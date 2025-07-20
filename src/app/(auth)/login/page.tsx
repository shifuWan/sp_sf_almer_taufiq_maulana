'use client'

import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import { toast } from "sonner"
import React, {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import { login } from "@/service/api/auth"
import { Loader2 } from "lucide-react"



export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()


    async function Submit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        try {
            await login(email, password)
            toast.success("Login successfully")
            setIsLoading(false)
            router.replace("/dashboard")
        } catch (error) {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6")}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={Submit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@example.com"
                                    required
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input id="password" type="password" placeholder="********" onChange={(e) => setPassword(e.target.value)}
                                       required/>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading} >
                                    {isLoading ? (<span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Login</span>) : (<span>Login</span>)}
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="underline underline-offset-4">
                                Register here
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
