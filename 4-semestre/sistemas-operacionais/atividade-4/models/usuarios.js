import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default class Usuarios {
    static async createUsuario(data) {
        try {
            const user = await prisma.usuarios.create({
                data: data,
            });
            return user;
        } catch (error) {
            throw error;
        }
    }

    static async getUsuarios() {
        try {
            const users = await prisma.usuarios.findMany();
            return users;
        } catch (error) {
            throw error;
        }
    }

    static async getUsuariosIdOrderByIdDesc() {
        try {
            const users = await prisma.usuarios.findFirst({
                orderBy: {
                    id: "desc"
                },
                select: {
                    id: true,
                }
            });
            return users;
        } catch (error) {
            throw error;
        }
    }
}