import { api } from "@/service/request"

export function login(email: string, password: string) {
    return api.post<API.Auth.LoginParams>("/api/login", {
        email,
        password
    })
}

export function register(data: API.Auth.RegisterParams) {
    return api.post<API.Auth.RegisterParams>("/api/register", data)
}
