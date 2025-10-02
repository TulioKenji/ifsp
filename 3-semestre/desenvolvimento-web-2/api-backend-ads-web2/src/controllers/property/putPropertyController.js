import { update } from "../../models/propertymodel.js"

const putPropertyController = async (req, res) =>{
    const {id} = req.params;
    const property = req.body;

    const result = await update(+id, property);

    res.json({
        message: "produto 1 atualizado",
        property: result
        
    })
}

export default putPropertyController