import express from 'express';

import Usuarios from '../models/usuarios.js';
import Enderecos from '../models/enderecos.js';
import Documentos from '../models/documentos.js';

const router = express.Router();

router.get('/', async (req, res) =>{
   try{
    const data = await Documentos.getDocumentos();

    if(!data){
        return res.status(200).json({message: "sem documentos"})
    }

    console.log(data);
    res.setHeader('Content-Disposition', 'attachment; filename="documentos.json"');
    res.setHeader('Content-Type', 'text/json; charset=utf-8');
    return res.send(data);
   }catch(error){
    return res.status(500).json({error: error.message})
   }

});

export default router