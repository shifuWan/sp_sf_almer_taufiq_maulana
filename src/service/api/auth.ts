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

export function logout() {
    return api.post<API.Common.ApiResponse>("/api/logout")
}

export function searchUser(email: string) {
    return api.get<API.Common.ApiResponse<{ id: string; name: string; email: string }[]>>(`/api/search-user?email=${encodeURIComponent(email)}`)
}