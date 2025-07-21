import Header from "@/components/sections/header";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <SessionProvider>
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                <Toaster position="top-right" richColors />
            </SessionProvider>
        </div>
    )
}