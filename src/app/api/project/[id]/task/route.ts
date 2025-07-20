import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/utils";
import { taskCreateSchema } from "@/lib/validators/project";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const body = await request.json();

    const { success, data, error } = await taskCreateSchema.safeParseAsync(body)

    if (!success) {
        const errors = z.treeifyError(error).properties
        return errorResponse("Invalid request body", 400, errors)
    }

    const project = await prisma.tasks.findFirst({
        where: {
            title: data.title,
            projectId: id,
        },
    })

    if (project) { return errorResponse("Task already exists", 400) }

    await prisma.tasks.create({
        data: {
            title: data.title,
            description: data.description,
            status: data.status,
            projectId: id,
            assigneeId: data.assigneeId,
        }, 
    })

    return successResponse("Task created successfully", 200)
}
