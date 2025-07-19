import { NextResponse } from "next/server";

export function successResponse<T = unknown>(message: string, status: number, data?: T) {

    return NextResponse.json<API.Common.ApiResponse<T>>({
        message,
        data
    }, { status });
}
