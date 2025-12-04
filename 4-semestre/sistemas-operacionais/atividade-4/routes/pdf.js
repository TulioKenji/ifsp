import express from 'express';
import PDFDocument from 'pdfkit';

import Usuarios from '../models/usuarios.js';
import Enderecos from '../models/enderecos.js';
import Documentos from '../models/documentos.js';

const router = express.Router();
const pdf = new PDFDocument();

router.get('/', async (req, res) =>{
    try {
        const data = await Usuarios.getUsuarios();

        // Verificação correta: se não houver dados OU o array estiver vazio
        if (!data || data.length === 0) {
            return res.status(200).json({ message: "sem usuarios" });
        }

        // 1. Criar um novo documento PDF
        const doc = new PDFDocument({ margin: 20 });

        // 2. Configurar os headers da resposta ANTES de enviar qualquer dado!
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="usuarios.pdf"');

        // 3. Conectar o PDF ao stream de resposta (a forma mais eficiente)
        doc.pipe(res);

        // 4. Adicionar conteúdo ao PDF
        // Título
        doc.fontSize(18).text('Usuários', { align: 'center' });
        doc.moveDown(2);

        // Cabeçalho da tabela
        const headers = Object.keys(data[0]);
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text(headers.join(' | '));
        doc.moveDown(0.5);

        // Linhas de dados
        doc.font('Helvetica').fontSize(10);
        data.forEach(usuario => {
            const row = Object.values(usuario).join(' | ');
            doc.text(row);
            doc.moveDown(0.3);
        });

        // 5. Finalizar o PDF (isso enviará o arquivo para o cliente)
        doc.end();

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        return res.status(500).json({ error: error.message });
    }

});

export default router