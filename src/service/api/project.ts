import { api } from "@/service/request"

export async function createProject(data: API.Project.ProjectCreateParams) {
    return api.post<API.Common.ApiResponse>("/api/project", data)
}

export async function fetchProjects() {
    return api.get<API.Project.ProjectResponseList>("/api/project")
}

export async function deleteProject(id: string) {
    return api.delete<API.Common.ApiResponse>(`/api/project/${id}`)
}