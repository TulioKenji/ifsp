import { remove } from "../../models/propertymodel.js"


const deletePropertyController = async(req, res) =>{
    const {id} = req.params;

    const result = await remove(+id);

    res.json({
        message: "produto1 deletado",
        property: result
    })
}

export default deletePropertyController