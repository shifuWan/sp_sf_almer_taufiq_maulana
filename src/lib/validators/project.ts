import { z } from "zod"

export const projectCreateSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
})

export const projectEditSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    members: z.array(z.string()).optional(),
})

export const taskCreateSchema = z.object({
    title: z.string()
        .min(1, { message: "Title is required" })
        .max(255, { message: "Title must be less than 255 characters" }),
    description: z.string().max(1000, { message: "Description must be less than 1000 characters" }).optional(),
    status: z.enum(["pending", "in_progress", "completed"], {
        message: "Status is required",
    }),
    assigneeId: z.string().min(1, { message: "Assignee ID is required" }),
})

export const taskPatchSchema = z.object({
    status: z.enum(["pending", "in_progress", "completed"], {
        message: "Status is required",
    }),
})

