import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/utils";
import { loginSchema } from "@/lib/validators/auth";
import z from "zod";
import { signIn } from "@/auth";
import { CredentialsSignin } from "next-auth";


export async function POST(request: NextRequest) {
    const requestBody = await request.json();

    const { success, data, error } = loginSchema.safeParse(requestBody);

    if (!success) {
        const errors = z.treeifyError(error).properties
        return errorResponse("email or password incorrect", 400, errors);
    }

    try {
        await signIn('credentials', {
            email: data.email,
            password: data.password,
            redirect: false,
        })
    } catch (error) {
        if (error instanceof CredentialsSignin) {
            return errorResponse("email or password incorrect", 401);
        } else {
            return errorResponse("An error occurred while logging in", 500);
        }
    }

    return successResponse("Login successful", 200);
}