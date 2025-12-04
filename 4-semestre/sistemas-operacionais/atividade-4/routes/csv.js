import express from 'express';

import Usuarios from '../models/usuarios.js';
import Enderecos from '../models/enderecos.js';
import Documentos from '../models/documentos.js';

const router = express.Router();

router.get('/', async (req, res) =>{
   try{
    const enderecos = await Enderecos.getEnderecos();

    if(!enderecos){
        return res.status(200).json({message: "sem enderecos"})
    }

    const headers = Object.keys(enderecos[0]).join(';');
    const rows = enderecos
      .map(obj => Object.values(obj).join(','))
      .join('\n');
    const csvContent = `${headers}\n${rows}`;
    console.log(csvContent);
    res.setHeader('Content-Disposition', 'attachment; filename="enderecos.csv"');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return res.send(csvContent);
   }catch(error){
    return res.status(500).json({error: error.message})
   }

});

export default router