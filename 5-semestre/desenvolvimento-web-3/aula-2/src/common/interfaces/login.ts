export interface LoginRequestBody {
    username: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    authToken?: string;
    username?: string;
}