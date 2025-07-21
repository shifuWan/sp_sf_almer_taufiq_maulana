declare namespace API {
    namespace Common {
        interface PaginatingCommonParams {
            size: number
            current: number
            total: number
        }

        interface ApiResponse<T = unknown> {
            data?: T
            message: string
            pagination?: PaginatingCommonParams
        }
    }

    namespace Auth {
        interface LoginParams {
            email: string
            password: string
        }

        interface RegisterParams {
            name: string
            email: string
            password: string
            confirmPassword: string
        }
    }

    namespace User {
        interface UserModel {
            id: string
            name: string
            email: string
            image: string
        }
    }

    namespace Project {
        interface ProjectModel {
            id: string
            name: string
            ownerId: string
            createdAt: string
            updatedAt: string
        }

        interface MembershipModel {
            id: string
            userId: string
            projectId: string
            createdAt: string
            updatedAt: string
        }

        type ProjectCreateParams = Pick<ProjectModel, "name">

        type ProjectEditParams = {
            name: string
            members?: string[]
        }

        interface ProjectMembershipModel extends ProjectModel {
            memberships: {
                id: string
                user: User.UserModel
            }[]
        }

        type ProjectResponse = Common.ApiResponse<ProjectModel>

        type ProjectResponseList = Common.ApiResponse<ProjectMembershipModel[]>
    }

    namespace Task {
        interface TaskModel {
            id: string
            title: string
            description: string
            status: string
            assigneeId: string
            projectId: string
            createdAt: string
            updatedAt: string
            assignee: User.UserModel
        }

        type TaskCreateParams = Pick<TaskModel, "title" | "description" | "status" | "assigneeId">
        type TaskResponseList = Common.ApiResponse<TaskModel[]>
    }

}
