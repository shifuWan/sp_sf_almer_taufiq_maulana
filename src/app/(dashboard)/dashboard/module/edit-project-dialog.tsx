"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDebounce } from "@/lib/utils"
import { projectEditSchema } from "@/lib/validators/project"
import { searchUser } from "@/service/api/auth"
import { editProject } from "@/service/api/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { AxiosError } from "axios"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

interface EditProjectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: string
    projectName: string
    onSuccess?: () => void
}

interface User {
    id: string
    name: string
    email: string
}

export function EditProjectDialog({
    open,
    onOpenChange,
    projectId,
    projectName,
    onSuccess
}: EditProjectDialogProps) {
    const form = useForm<z.infer<typeof projectEditSchema>>({
        resolver: zodResolver(projectEditSchema),
        defaultValues: {
            name: "",
            members: []
        },
    })


    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<User[]>([])
    const [selectedUsers, setSelectedUsers] = useState<User[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [popoverOpen, setPopoverOpen] = useState(false)

    const debouncedSearchQuery = useDebounce(searchQuery, 500)

    const handleSearchUser = useCallback(async (query: string) => {
        // if (!query || query.length < 1) return

        setIsSearching(true)
        try {
            const response = await searchUser(query)
            if (response.data?.data) {
                const users = response.data.data as User[]
                const filteredUsers = users.filter(user =>
                    !selectedUsers.some(selected => selected.id === user.id)
                )
                setSearchResults(filteredUsers)
            }
        } catch (error) {
            console.error("Error searching users:", error)
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }, [selectedUsers])

    useEffect(() => {
        if (open) {
            form.reset({
                name: projectName,
                members: []
            })
            setSelectedUsers([])
            setSearchQuery("")
            setSearchResults([])
        }
    }, [open, projectName, form])

    useEffect(() => {
        if (debouncedSearchQuery) {
            handleSearchUser(debouncedSearchQuery)
        } else {
            setSearchResults([])
        }
    }, [debouncedSearchQuery, handleSearchUser])

    async function onSubmit(data: z.infer<typeof projectEditSchema>) {
        try {
            const memberIds = selectedUsers.map(user => user.id)
            const res = await editProject(projectId, { ...data, members: memberIds })
            onOpenChange(false)
            onSuccess?.()
            toast.success("Project updated successfully")
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error && typeof error === "object" && "response" in error && error.response?.data?.data?.errors) {
                    const errors = error.response.data.data.errors;
                    Object.entries(errors).forEach(([field, message]) => {
                        form.setError(field as keyof z.infer<typeof projectEditSchema>, {
                            type: "manual",
                            message: Array.isArray(message) ? message.join(", ") : String(message),
                        });
                    });
                }
            }
        }
    }

    function handleOpenChange(open: boolean) {
        onOpenChange(open)
        if (!open) {
            form.reset()
            setSelectedUsers([])
            setSearchQuery("")
            setSearchResults([])
        }
    }



    function handleSelectUser(user: User) {
        setSelectedUsers(prev => [...prev, user])
        setSearchQuery("")
        setSearchResults([])
        setPopoverOpen(false)
    }

    function handleRemoveUser(userId: string) {
        setSelectedUsers(prev => prev.filter(user => user.id !== userId))
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit project</DialogTitle>
                    <DialogDescription>
                        Edit the project name and description.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="name">Name</FormLabel>
                                    <FormControl>
                                        <Input id="name" placeholder="project example" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="members"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="members">Members</FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={popoverOpen}
                                                        className="w-full justify-between"
                                                        onClick={() => handleSearchUser('')}
                                                    >
                                                        {searchQuery || "Search users..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="Search users by email..."
                                                            value={searchQuery}
                                                            onValueChange={setSearchQuery}
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                {isSearching ? "Searching..." : "No users found."}
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {searchResults.map((user) => (
                                                                    <CommandItem
                                                                        key={user.id}
                                                                        value={user.email}
                                                                        onSelect={() => handleSelectUser(user)}
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{user.name}</span>
                                                                            <span className="text-sm text-muted-foreground">{user.email}</span>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>

                                            {selectedUsers.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedUsers.map((user) => (
                                                        <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                                                            <span>{user.name}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveUser(user.id)}
                                                                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Editing..." : "Edit project"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 