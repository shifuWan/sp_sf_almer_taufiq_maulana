import { errorResponse, successResponse } from "@/lib/utils";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { taskPatchSchema } from "@/lib/validators/project";
import z from "zod";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string, taskId: string }> }) {
    const { id, taskId } = await params;
    const body = await request.json();

    const { success, data, error } = await taskPatchSchema.safeParseAsync(body)

    if (!success) {
        const errors = z.treeifyError(error).properties
        return errorResponse("Invalid request body", 400, errors)
    }

    try {
    await prisma.tasks.update({
        where: { id: taskId, projectId: id },
        data: {
            status: data.status,
        },
        })

        return successResponse("Task updated successfully", 200)
    } catch (error) {
        return errorResponse("Failed to update task", 500)
    }
}