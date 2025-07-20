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
            project: ProjectModel
        }

        type ProjectCreateParams = Pick<ProjectModel, "name">

        type ProjectEditParams = {
            name: string
            members?: string[]
        }

        type ProjectResponseList = Common.ApiResponse<MembershipModel[]>
    }
    
}
