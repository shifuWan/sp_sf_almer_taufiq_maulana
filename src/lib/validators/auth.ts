import { z } from "zod";

export const registerSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    name: z.string()
        .min(1, { message: "Name is required" })
        .max(100, { message: "Name must be at most 100 characters long" }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(32, { message: "Password must be at most 32 characters long" }),
    confirmPassword: z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(32, { message: "Password must be at most 32 characters long" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})


export const loginSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
})


