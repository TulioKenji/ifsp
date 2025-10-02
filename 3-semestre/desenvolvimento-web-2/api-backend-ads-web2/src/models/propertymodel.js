import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient();

const propertySchema = z.object({
    id: z.number().positive(),
    type: z.string().min(5).max(19),
    address: z.string().min(5).max(199),
    rooms: z.number().positive(),
    property: z.string().min(5).max(49)
})

export const propertyValidator = (property, partial = null)=>{
    if(partial){
        return propertySchema.partial(partial).safeParse(property)
    }
    return propertySchema.safeParse(property)
}

prisma.users.findMany();

export async function create(property){
    const result = await prisma.property.create({
        data: property
    });

    return result;
}

export async function remove(id){
    const result = await prisma.property.delete({
        where: {
            id: id
        }
    });

    return result;
}

export async function getList(){
    const result = await prisma.property.findMany();

    return result;
}

export async function update(id, property){
    const result = await prisma.property.update({
        where: {
            id: id
        },

        data: property
        
    });
    return result;
}