import { prisma } from "@/lib/prisma"
import { errorResponse, successResponse } from "@/lib/utils"
import { projectCreateSchema } from "@/lib/validators/project"
import { auth } from "@/auth"
import { NextRequest } from "next/server"
import z from "zod"

export async function POST(req: NextRequest) {
    const body = await req.json()

    const session = await auth()
    if (!session?.user) { return errorResponse("Unauthorized", 401) }

    const { data, success, error } = await projectCreateSchema.safeParseAsync(body)

    if (!success) {
        const errors = z.treeifyError(error).properties
        return errorResponse("Invalid request body", 400, errors)
    }

    try {
        const existingProject = await prisma.projects.findFirst({
            where: {
                name: data.name,
                ownerId: session.user.id as string,
            },
        })
        if (existingProject) {
            return errorResponse("Project already exists", 400, {
                errors: {
                    name: "Name project already exists",
                }
            })
        }

        await prisma.projects.create({
            data: {
                name: data.name,
                ownerId: session.user.id as string,
                memberships: {
                    create: {
                        userId: session.user.id as string,
                    },
                }
            },
        })
        return successResponse("Project created successfully", 200)
    } catch (error) {
        console.error(error)
        return errorResponse("Failed to create project", 500)
    }
}

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user) { return errorResponse("Unauthorized", 401) }


    try {
        const projects = await prisma.membership.findMany({
            where: {
                userId: session.user.id as string,
            },
        })

        const projectsWithMembers = await prisma.projects.findMany({
            where: {
                id: {
                    in: projects.map((project) => project.projectId),
                },
            },
            include: {
                memberships: {
                    include: {
                        user: {
                            omit: {
                                password: true,
                            }
                        },
                    },
                },
            },
        })

        return successResponse("Projects fetched successfully", 200, projectsWithMembers)
    } catch (error) {
        return errorResponse("Failed to fetch projects", 500)
    }


}