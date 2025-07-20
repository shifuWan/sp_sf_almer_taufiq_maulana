"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { taskCreateSchema } from "@/lib/validators/project";
import { Check, ChevronsUpDown, PlusIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Command, CommandList, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { createTask, getMembers, getTasks } from "@/service/api/project";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Komponen SortableTask untuk item task yang bisa di-drag
function SortableTask({ task, children }: { task: API.Task.TaskModel, children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

// Komponen DroppableColumn untuk register kolom sebagai drop target
function DroppableColumn({ id, children }: { id: string, children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} id={id} className="flex-1 bg-gray-100 rounded-lg p-4 min-h-[400px]">
            {children}
        </div>
    );
}

export default function ProjectPage() {
    const { id } = useParams();
    const [isOpen, setIsOpen] = useState(false);
    const [members, setMembers] = useState<{ id: string; userId: string; projectId: string; user: { id: string; name: string; email: string } }[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [pendingTasks, setPendingTasks] = useState<API.Task.TaskModel[]>([]);
    const [inProgressTasks, setInProgressTasks] = useState<API.Task.TaskModel[]>([]);
    const [completedTasks, setCompletedTasks] = useState<API.Task.TaskModel[]>([]);

    const form = useForm<z.infer<typeof taskCreateSchema>>({
        resolver: zodResolver(taskCreateSchema),
        defaultValues: {
            title: "",
            description: "",
            status: "pending",
            assigneeId: "",
        },
    });

    function onOpenChange(open: boolean) {
        setIsOpen(open)
        form.reset()
    }

    async function onSubmit(data: z.infer<typeof taskCreateSchema>) {
        try {
            const {data: response} = await createTask(id as string, data)
            onOpenChange(false)
            toast.success(response.message)
            fetchTasks(id as string, "pending")
            fetchTasks(id as string, "in_progress")
            fetchTasks(id as string, "completed")
        } catch (error) {
            console.error("Error creating task:", error);
        }
    }

    async function fetchMembers(projectId: string) {
        setIsLoadingMembers(true);
        try {
            const response = await getMembers(projectId);
            setMembers(response.data?.data || []);
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setIsLoadingMembers(false);
        }
    }

    async function fetchTasks(projectId: string, status: "pending" | "in_progress" | "completed") {
        const response = await getTasks(projectId, status);
        if (status === "pending") {
            setPendingTasks(response.data?.data || []);
        } else if (status === "in_progress") {
            setInProgressTasks(response.data?.data || []);
        } else if (status === "completed") {
            setCompletedTasks(response.data?.data || []);
        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    // Helper untuk update status task di state (dummy, nanti bisa dihubungkan ke backend)
    function moveTask(taskId: string, from: string, to: string) {
        let movedTask: API.Task.TaskModel | undefined;
        if (from === "pending") {
            movedTask = pendingTasks.find(t => t.id === taskId);
            if (movedTask) setPendingTasks(prev => prev.filter(t => t.id !== taskId));
        } else if (from === "in_progress") {
            movedTask = inProgressTasks.find(t => t.id === taskId);
            if (movedTask) setInProgressTasks(prev => prev.filter(t => t.id !== taskId));
        } else if (from === "completed") {
            movedTask = completedTasks.find(t => t.id === taskId);
            if (movedTask) setCompletedTasks(prev => prev.filter(t => t.id !== taskId));
        }
        if (movedTask) {
            const updatedTask = { ...movedTask, status: to };
            if (to === "pending") setPendingTasks(prev => [updatedTask, ...prev]);
            else if (to === "in_progress") setInProgressTasks(prev => [updatedTask, ...prev]);
            else if (to === "completed") setCompletedTasks(prev => [updatedTask, ...prev]);
        }
    }

    function findTaskById(taskId: string): { status: string } | undefined {
        if (pendingTasks.some(t => t.id === taskId)) return { status: "pending" };
        if (inProgressTasks.some(t => t.id === taskId)) return { status: "in_progress" };
        if (completedTasks.some(t => t.id === taskId)) return { status: "completed" };
        return undefined;
    }

    function onDragEnd(event: any) {
        const { active, over } = event;
        if (!over) return;
        const activeId = active.id;
        const overId = over.id;
        // Jika drag ke kolom lain
        if (activeId !== overId && ["pending","in_progress","completed"].includes(overId)) {
            const from = findTaskById(activeId)?.status;
            const to = overId;
            if (from && to && from !== to) {
                moveTask(activeId, from, to);
                // TODO: Panggil API update status task jika backend sudah ada
                console.log(from, to)
            }
        }
    }


    useEffect(() => {
        if (id) {
            fetchMembers(id as string);
            Promise.all([
                fetchTasks(id as string, "pending"),
                fetchTasks(id as string, "in_progress"),
                fetchTasks(id as string, "completed"),
            ])
        }
    }, [id]);

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <div className="container mx-auto px-4 py-2 my-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Project</h1>
                    <Button variant="outline" className="cursor-pointer" onClick={() => setIsOpen(true)}>
                        <PlusIcon className="w-4 h-4" /> Add Task
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 my-8 container mx-auto px-4 py-2">
                {/* Pending Column */}
                <SortableContext items={pendingTasks.map(t => t.id)} id="pending" strategy={verticalListSortingStrategy}>
                <DroppableColumn id="pending">
                    <h2 className="text-lg font-bold mb-4">Pending</h2>
                    <div className="min-h-[60px] flex flex-col gap-2">
                        {pendingTasks.map((task) => (
                            <SortableTask key={task.id} task={task}>
                                <div className="bg-white rounded shadow p-3 cursor-move flex flex-col gap-2">
                                    {task.title}
                                    <div className="flex items-center gap-2">
                                    <Avatar>
                                        <AvatarImage src={task.assignee.image} />
                                        <AvatarFallback>
                                            {task.assignee.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p>{task.assignee.name}</p>
                                    </div>
                                </div>
                            </SortableTask>
                        ))}
                    </div>
                </DroppableColumn>
                </SortableContext>
                {/* On Progress Column */}
                <SortableContext items={inProgressTasks.map(t => t.id)} id="in_progress" strategy={verticalListSortingStrategy}>
                <DroppableColumn id="in_progress">
                    <h2 className="text-lg font-bold mb-4">On Progress</h2>
                    <div className="min-h-[60px] flex flex-col gap-2">
                        {inProgressTasks.map((task) => (
                            <SortableTask key={task.id} task={task}>
                                <div className="bg-white rounded shadow p-3 cursor-move flex flex-col gap-2">
                                    {task.title}
                                    <div className="flex items-center gap-2">
                                    <Avatar>
                                        <AvatarImage src={task.assignee.image} />
                                        <AvatarFallback>
                                            {task.assignee.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p>{task.assignee.name}</p>
                                    </div>
                                </div>
                            </SortableTask>
                        ))}
                    </div>
                </DroppableColumn>
                </SortableContext>
                {/* Done Column */}
                <SortableContext items={completedTasks.map(t => t.id)} id="completed" strategy={verticalListSortingStrategy}>
                <DroppableColumn id="completed">
                    <h2 className="text-lg font-bold mb-4">Done</h2>
                    <div className="min-h-[60px] flex flex-col gap-2">
                        {completedTasks.map((task) => (
                            <SortableTask key={task.id} task={task}>
                                <div className="bg-white rounded shadow p-3 cursor-move flex flex-col gap-2">
                                    {task.title}
                                    <div className="flex items-center gap-2">
                                    <Avatar>
                                        <AvatarImage src={task.assignee.image} />
                                        <AvatarFallback>
                                            {task.assignee.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p>{task.assignee.name}</p>
                                    </div>
                                </div>
                            </SortableTask>
                        ))}
                    </div>
                </DroppableColumn>
                </SortableContext>
            </div>
            <Dialog open={isOpen} onOpenChange={onOpenChange} >
                <DialogContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                            <DialogHeader>
                                <DialogTitle>Add Task</DialogTitle>
                                <DialogDescription>Add a new task to the project</DialogDescription>
                            </DialogHeader>

                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Task Title" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Task Description" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="flex flex-row gap-2 items-baseline">
                            <FormField control={form.control} name="assigneeId"  render={({ field }) => (
                                <FormItem className="flex-1" >
                                    <FormLabel>Assignee</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "justify-between w-full",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? members.find(
                                                            (member) => member.userId === field.value
                                                        )?.user.name
                                                        : "Select assignee"}
                                                    <ChevronsUpDown className="opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="w-full p-0">
                                            <Command>
                                                <CommandInput
                                                    placeholder="Search members..."
                                                    className="h-9"
                                                />
                                                <CommandList>
                                                    <CommandEmpty>No members found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {members.map((member) => (
                                                            <CommandItem
                                                                value={member.user.name}
                                                                key={member.userId}
                                                                onSelect={() => {
                                                                    form.setValue("assigneeId", member.userId)
                                                                }}
                                                            >
                                                                {member.user.name}
                                                                <Check
                                                                    className={cn(
                                                                        "ml-auto",
                                                                        member.userId === field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="done">Done</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            </div>


                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>Cancel</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Adding..." : "Add Task"}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </DndContext>
    )
}