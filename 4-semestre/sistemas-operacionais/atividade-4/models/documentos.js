import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export default class Documentos {
    static async createDocumento(data) {
        try {
            const documento = await prisma.documentos.create({
                data: data,
            });
            return documento;
        } catch (error) {
            throw error;
        }
    }

    static async getDocumentos() {
        try {
            const documentos = await prisma.documentos.findMany();
            return documentos;
        } catch (error) {
            throw error;
        }
    }

    static async getDocumentoById(id) {
        try {
            const documento = await prisma.documentos.findUnique({
                where: { id: id },
            });
            return documento;
        } catch (error) {
            throw error;
        }
    }
}