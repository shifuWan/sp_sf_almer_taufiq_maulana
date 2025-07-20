import React from 'react';
import { Toaster } from "@/components/ui/sonner"


const RootLayout = ({children}: {
    children: React.ReactNode
}) => {
    return (
        <>
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    {children}
                    <Toaster position={"top-right"}  closeButton={true} richColors={true}/>
                </div>
            </div>
        </>
    );
};

export default RootLayout;