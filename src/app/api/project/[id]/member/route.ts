import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { errorResponse, successResponse } from "@/lib/utils"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const session = await auth()
    if (!session?.user) { return errorResponse("Unauthorized", 401) }

    const members = await prisma.membership.findMany({
        where: {
            projectId: id,
        },
        include: {
            user: true,
        },
    })

    return successResponse("Members fetched successfully", 200, members)
}