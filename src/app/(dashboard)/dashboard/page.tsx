"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { projectCreateSchema } from "@/lib/validators/project";
import { createProject, fetchProjects } from "@/service/api/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { log } from "console";
import { Loader2, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export default function Dashboard() {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [projects, setProjects] = useState<API.Project.MembershipModel[]>([])
    const form = useForm<z.infer<typeof projectCreateSchema>>({
        resolver: zodResolver(projectCreateSchema),
        defaultValues: {
            name: "",
        },
    })

    async function onSubmit(data: z.infer<typeof projectCreateSchema>) {
        try {
            await createProject(data)
            setIsOpen(false)
            await getProjects()
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error && typeof error === "object" && "response" in error && error.response?.data?.data?.errors) {
                    const errors = error.response.data.data.errors;
                    Object.entries(errors).forEach(([field, message]) => {
                        form.setError(field as keyof z.infer<typeof projectCreateSchema>, {
                            type: "manual",
                            message: Array.isArray(message) ? message.join(", ") : String(message),
                        });
                    });
                }
            }
        }
    }

    function onOpenChange(open: boolean) {
        setIsOpen(open)
        form.reset()
    }

    async function getProjects() {
        setIsLoading(true)
        const res = await fetchProjects()
        setProjects(res.data?.data || [])
        setIsLoading(false)
    }

    useEffect(() => {
        getProjects()
    }, [])

    return (
        <div className="container mx-auto px-4 py-2 my-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Button variant="outline" className="cursor-pointer" onClick={() => setIsOpen(true)}>
                    <PlusIcon className="w-4 h-4" /> Add Task
                </Button>
            </div>
            {isLoading && (
                <div className="flex items-center justify-center my-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm text-gray-500">Loading...</p>
                </div>
            )}
            {projects.length === 0 && !isLoading && (
                <div className="bg-white py-4 rounded-lg">
                    <h2 className="text-lg font-bold">No projects found</h2>
                    <p className="text-sm text-gray-500">You don't have any projects yet. Create a new project to get started.</p>
                </div>
            )}
            <div className="grid grid-cols-1 mt-4 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.length > 0 && projects.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-lg font-bold">{item.project.name}</h2>
                    </div>
                ))}
            </div>
            <Dialog open={isOpen} onOpenChange={onOpenChange} >
                <DialogContent >
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                            <DialogHeader>
                                <DialogTitle>Create new project</DialogTitle>
                                <DialogDescription>
                                    Fill name of the project you want to create.
                                </DialogDescription>
                            </DialogHeader>

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

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? "Creating..." : "Create project"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div >
    )
}