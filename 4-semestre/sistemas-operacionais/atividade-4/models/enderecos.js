import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export default class Enderecos {
    static async createEndereco(data) {
        try {
            const endereco = await prisma.enderecos.create({
                data: data,
            });
            return endereco;
        } catch (error) {
            throw error;
        }
    }

    static async getEnderecos() {
        try {
            const enderecos = await prisma.enderecos.findMany();
            return enderecos;
        } catch (error) {
            throw error;
        }
    }

    static async getEnderecoById(id) {
        try {
            const endereco = await prisma.enderecos.findUnique({
                where: { id: id },
            });
            return endereco;
        } catch (error) {
            throw error;
        }
    }
}