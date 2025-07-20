import axios from "axios"
import { signOut } from "@/auth"
import { toast } from "sonner"

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
})

api.interceptors.response.use(
    (response) => {
        // toast.success(response.data.message)
        return response
    },
    (error) => {
        toast.error(error.response.data.message)
        return Promise.reject(error)
    }
)
