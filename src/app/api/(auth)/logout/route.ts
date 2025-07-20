import { auth, signOut } from "@/auth"
import { errorResponse, successResponse } from "@/lib/utils"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session) {
        return errorResponse("Unauthorized", 401)
    }

    await signOut()

    return successResponse("Logged out successfully", 200)
}