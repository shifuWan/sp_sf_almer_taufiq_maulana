import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/utils";
import { loginSchema } from "@/lib/validators/auth";
import z from "zod";
import { signIn } from "@/auth";


export async function POST(request: NextRequest) {
    const requestBody = await request.json();
 
    const { success, data, error } = loginSchema.safeParse(requestBody);

    if (!success) {
        const errors = z.treeifyError(error).properties
        return errorResponse("errors", 400, errors);
    }

    try {
        await signIn('credentials', {
            email: data.email,
            password: data.password,
            redirect: false,
        })
        

    } catch (error) {
        console.log(error);
        return errorResponse("Invalid credentials", 401);
    }

    return successResponse("Login successful", 200);
}