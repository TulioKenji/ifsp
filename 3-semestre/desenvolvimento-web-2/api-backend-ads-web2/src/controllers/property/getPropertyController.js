import { getList } from "../../models/propertymodel.js"

export default async function getPropertyController (req, res) {

    const result = await getList();
    return res.json(result)
}

// const getProperty = (req, res) =>{
//     res.json({
//         message: "produto 1",
//         property: {
//             name: "produto1",
//             id: "0",
//             value: "40,00",
//             description: "sofa"
//         }
        
//     })
// }

// export default getProperty