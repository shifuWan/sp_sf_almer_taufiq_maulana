import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { errorResponse } from "@/lib/utils"

export default auth( async (req: NextRequest, context: any) => {
    const { nextUrl } = req
    const isLoggedIn = !!context.auth
    
    // Get the pathname from the URL
    const pathname = nextUrl.pathname
    
    // Check if it's an API route
    const isApiRoute = pathname.startsWith('/api/')
    
    // Check if it's an auth API route
    const isAuthApiRoute = pathname.startsWith('/api/login') || pathname.startsWith('/api/register')
    
    // Check if it's a login or register page
    const isAuthPage = pathname === '/login' || pathname === '/register'
    
    // Check if it's a dashboard route (assuming dashboard starts with /dashboard)
    const isDashboardRoute = pathname.startsWith('/dashboard')

    // jika user belum login dan mengakses api maka return error 401
    if (!isLoggedIn && isApiRoute && !isAuthApiRoute) {
        return errorResponse("Unauthorized", 401)
    }
    
    // jika user belum login dan mengakses dashboard maka redirect ke login
    if (!isLoggedIn && isDashboardRoute) {
        return NextResponse.redirect(new URL('/login', nextUrl))
    }
    
    // jika user sudah login dan mengakses login maka redirect ke dashboard
    if (isLoggedIn && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    
    // jika user sudah login dan mengakses register maka redirect ke dashboard
    if (isLoggedIn && pathname === '/register') {
        return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    
    // jika user sudah login dan mengakses api/login atau api/register maka return 404
    if (isLoggedIn && pathname === '/api/login' || pathname === '/api/register') {
        return errorResponse("Not Found", 404)
    }
    
    return null
})

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}