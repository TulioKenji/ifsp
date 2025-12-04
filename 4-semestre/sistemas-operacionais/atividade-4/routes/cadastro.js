import express from 'express';

import Usuarios from '../models/usuarios.js';
import Enderecos from '../models/enderecos.js';
import Documentos from '../models/documentos.js';

const router = express.Router();

router.use(express.json());

router.post('/', async (req, res) => {
    const usuario = req.body.usuario;
    const endereco = req.body.endereco;
    const documento = req.body.documento;

    const novoUsuario = await Usuarios.createUsuario(usuario)
        .catch(error => {
        res.status(500).json({ error: error.message });
        });

        console.log(novoUsuario);
    endereco.idUsuario = novoUsuario.id;
    documento.idUsuario = novoUsuario.id;
    console.log(endereco);
    console.log(documento);
    await Promise.all([
        Enderecos.createEndereco(endereco),
        Documentos.createDocumento(documento)
    ])
    .then((newCadastro) => res.status(201).json({novoUsuario, newCadastro}))
    .catch((error) => res.status(500).json({ error: error.message }));
});

router.get('/', async (req, res) => {
    Usuarios.getUsuarios()
        .then((users) => res.status(200).json(users))
        .catch((error) => res.status(500).json({ error: error.message }));
});

export default router;