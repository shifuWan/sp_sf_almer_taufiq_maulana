import Link from "next/link";
import { Button } from "../ui/button";
import { LogOutIcon } from "lucide-react";

export default function Header() {
    return (
        <header className="flex items-center justify-between bg-gray-100">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                <div>
                    <Link href="/">
                        <h1 className="text-3xl font-bold">Task Management</h1>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="cursor-pointer">
                        <LogOutIcon className="w-4 h-4" /> Logout
                    </Button>
                </div>
            </div>

        </header>
    )
}