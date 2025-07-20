import { prisma } from "@/lib/prisma";
import { errorResponse, hashPassword, successResponse } from "@/lib/utils";
import { registerSchema } from "@/lib/validators/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const requestBody = await request.json();
    const { email, name, password } = registerSchema.parse(requestBody);

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        return errorResponse("User already exists", 400);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
        },
    });

    if (!user) {
        return errorResponse("Failed to create user", 500);
    }

    return successResponse("Registration successful! Please login to continue.", 200);
}
