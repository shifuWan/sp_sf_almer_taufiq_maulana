import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { errorResponse, successResponse } from "@/lib/utils"
import { NextRequest } from "next/server"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const session = await auth()
    if (!session?.user) { return errorResponse("Unauthorized", 401) }

    try {
        const project = await prisma.projects.findFirst({
            where: {
                id: id,
                ownerId: session.user.id as string,
            },
        })

        if (!project) { return errorResponse("Project not found", 404) }

        if (project.ownerId !== session.user.id) { return errorResponse("Not allowed to delete this project", 403) }

        await prisma.membership.deleteMany({
            where: {
                projectId: id,
            },
        })

        await prisma.projects.delete({
            where: {
                id: id,
                ownerId: session.user.id as string,
            },
        })
        return successResponse("Project deleted successfully", 200)
    } catch (error) {
        console.log(error)
        return errorResponse("Failed to delete project", 500)
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const session = await auth()
    if (!session?.user) { return errorResponse("Unauthorized", 401) }

    const body = await req.json()

    const project = await prisma.projects.findFirst({
        where: {
            id: id,
            ownerId: session.user.id as string,
        },
    })

    if (!project) { return errorResponse("Project not found", 404) }


    await prisma.$transaction(async (tx) => {
        await tx.membership.deleteMany({
            where: {
                projectId: id,
            },
        })
        await tx.membership.createMany({
            data: body.members.map((member: string) => ({
                projectId: id,
                userId: member,
            })),
        })
    
        await tx.projects.update({
            where: {
                id: id,
                ownerId: session.user?.id as string,
            },
            data: {
                name: body.name,
            },
        })
    })

    return successResponse("Project updated successfully", 200)
}