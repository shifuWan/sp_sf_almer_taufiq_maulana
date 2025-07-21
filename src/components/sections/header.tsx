"use client"

import Link from "next/link";
import { LogOutIcon } from "lucide-react";
import { logout } from "@/service/api/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

export default function Header() {
    const router = useRouter()
    const { data: session } = useSession()
    async function handleLogout() {
        try {
            const { data } = await logout()
            toast.success(data?.message || "Logged out successfully")
            router.replace("/login")
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <header className="flex items-center justify-between bg-gray-100">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                <div>
                    <Link href="/">
                        <h1 className="text-3xl font-bold">Task Management</h1>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="cursor-pointer">
                                <AvatarImage src={session?.user?.image || ""} />
                                <AvatarFallback className="cursor-pointer bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center">
                                    <p className="text-sm">{(session?.user?.name?.charAt(0).toUpperCase())}</p>
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>
                                {session?.user?.name}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOutIcon className="w-4 h-4" /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

        </header>
    )
}