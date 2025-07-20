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
}
