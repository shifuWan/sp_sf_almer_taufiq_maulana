import { NextResponse } from "next/server";
import z from "zod";

export function successResponse<T = unknown>(message: string, status: number, data?: T) {

    return NextResponse.json<API.Common.ApiResponse<T>>({
        message,
        data
    }, { status });
}

export function errorResponse(message: string, status: number, data?: any) {
    return NextResponse.json<API.Common.ApiResponse<null>>({
        message,
        data
    }, { status });
}
