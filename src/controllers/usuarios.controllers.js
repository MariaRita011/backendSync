const pool = require('../config/dbconfig');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configuração do multer para armazenamento temporário dos arquivos
const upload = multer({ dest: 'uploads/' });

async function postUsuario(req, res) {
    const { nif, nome, descriptor, notificacao, notiwhere, telefone, email, adm, salas, sala_fixa } = req.body;
    const image = req.file;

    // Verifica se a imagem foi enviada
    if (!image) {
        return res.status(400).json({ message: 'Imagem não enviada' });
    }

    // Cria o diretório para armazenar a imagem, se não existir
    const directory = path.join(__dirname, '..', '..', 'uploads', nome);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    // Move a imagem para o diretório correto
    const imagePath = path.join(directory, image.originalname);
    try {
        fs.renameSync(image.path, imagePath);  // Move o arquivo temporário
    } catch (err) {
        return res.status(500).json({ message: 'Erro ao mover a imagem', error: err.message });
    }

    // Adiciona o usuário ao banco de dados
    const query = `
        INSERT INTO usuarios (nif, nome, caminho_imagem, descriptor, notificacao, notiwhere, telefone, email, adm)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const values = [nif, nome, imagePath, descriptor, notificacao, notiwhere, telefone, email, adm];

    try {
        await pool.query(query, values);
        res.status(200).json({ message: 'Usuário adicionado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
}

async function getUsuarios(req, res) {
    const query = 'SELECT * FROM usuarios';

    try {
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
}

module.exports = { postUsuario, getUsuarios, upload };
