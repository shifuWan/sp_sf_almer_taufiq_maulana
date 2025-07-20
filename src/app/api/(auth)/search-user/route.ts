import { prisma } from "@/lib/prisma"
import { errorResponse, successResponse } from "@/lib/utils"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    let email = searchParams.get("email") || ""

    const user = await prisma.user.findMany({
        where: {
            email: {
                contains: email,
                mode: "insensitive",
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    })

    return successResponse("User found", 200, user)
}