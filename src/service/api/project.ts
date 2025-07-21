import { taskCreateSchema, taskPatchSchema } from "@/lib/validators/project"
import { api } from "@/service/request"
import z from "zod"

export async function createProject(data: API.Project.ProjectCreateParams) {
    return api.post<API.Common.ApiResponse>("/api/project", data)
}

export async function fetchProjects() {
    return api.get<API.Project.ProjectResponseList>("/api/project")
}

export async function deleteProject(id: string) {
    return api.delete<API.Common.ApiResponse>(`/api/project/${id}`)
}

export async function editProject(id: string, data: API.Project.ProjectEditParams) {
    return api.put<API.Common.ApiResponse>(`/api/project/${id}`, data)
}

export async function createTask(id: string, data: z.infer<typeof taskCreateSchema>) {
    return api.post<API.Common.ApiResponse>(`/api/project/${id}/task`, data)
}

export async function getMembers(id: string) {
    return api.get<API.Common.ApiResponse<{ id: string; userId: string; projectId: string; user: { id: string; name: string; email: string } }[]>>(`/api/project/${id}/member`)
}

export async function getTasks(id: string, status: "pending" | "in_progress" | "completed") {
    return api.get<API.Common.ApiResponse<API.Task.TaskModel[]>>(`/api/project/${id}/task?status=${status}`)
}

export async function getProjectById(id: string) {
    return api.get<API.Project.ProjectResponse>(`/api/project/${id}`)
}

export async function patchTask(id: string, taskId: string, data: z.infer<typeof taskPatchSchema>) {
    return api.put<API.Common.ApiResponse>(`/api/project/${id}/task/${taskId}`, data)
}