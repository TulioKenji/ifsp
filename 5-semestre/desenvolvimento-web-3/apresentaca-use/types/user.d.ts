interface User {
    id: string;
    name: string;
    email: string;
}

interface PageUser {
    promiseUsers: Promise<User[]>;
    promiseError: Promise<User[]>;
}