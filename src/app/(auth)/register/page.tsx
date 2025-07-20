'use client'

import React from 'react';
import {cn} from "@/lib/utils";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {registerSchema} from '@/lib/validators/auth'
import {zodResolver} from "@hookform/resolvers/zod";
import z from "zod";
import Link from "next/link";
import {register} from "@/service/api/auth";
import {toast} from "sonner";
import {useRouter} from "next/navigation";


const RegisterPage = () => {
    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })
    const router = useRouter()

    async function submitForm(data: z.infer<typeof registerSchema>) {
        try {
            await register(data)
            toast.success("Registration successful! Please login to continue.")
            router.push('/login')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6")}>
            <Card>
                <CardHeader>
                    <CardTitle>Create your account</CardTitle>
                    <CardDescription>
                        Welcome back! Please enter your details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(submitForm)}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-3">
                                    <FormField name="name" control={form.control} render={({field}) => (
                                        <FormItem>
                                            <FormLabel htmlFor="name">Name</FormLabel>
                                            <FormControl>
                                                <Input id="name" placeholder="John Doe" {...field}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}/>
                                </div>
                                <div className="grid gap-3">
                                    <FormField name="email" control={form.control} render={({field}) => (
                                        <FormItem>
                                            <FormLabel htmlFor="email">Email</FormLabel>
                                            <FormControl>
                                                <Input id="email" type='email' placeholder="email@example.com" {...field}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}/>
                                </div>
                                <div className="grid gap-3">
                                    <FormField name="password" control={form.control} render={({field}) => (
                                        <FormItem>
                                            <FormLabel htmlFor="password">Password</FormLabel>
                                            <FormControl>
                                                <Input id="password" type='password' placeholder="********" {...field}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}/>
                                </div>
                                <div className="grid gap-3">
                                    <FormField name="confirmPassword" control={form.control} render={({field}) => (
                                        <FormItem>
                                            <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input id="confirmPassword" type='password' placeholder="********" {...field}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}/>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button type="submit" className="w-full">
                                        Register
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-4 text-center text-sm">
                                Already have an account?{" "}
                                <Link href="/login" className="underline underline-offset-4">
                                    Login
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default RegisterPage;