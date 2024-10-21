const pool = require('../config/dbconfig')

async function newPromiseClass(req, res) {
    const { data_inicio, funcionario, ambiente } = req.body;

    data_fim = null
    deleted = false

    const query = `INSERT INTO historico (data_inicio, data_fim, deleted, funcionario, ambiente) VALUES ($1, $2, $3, $4, $5)`;
    const values = [data_inicio, data_fim, deleted, funcionario, ambiente];

    try {
        await pool.query(query, values);
        await pool.query('UPDATE ambientes SET disponivel = false WHERE id = $1', [ambiente]);
        const responseAmbiente = await pool.query('SELECT * FROM ambientes WHERE id = $1', [ambiente]);
        if(responseAmbiente.rows[0].chave === true) {
            await pool.query('UPDATE chaves SET disponivel = false WHERE salas = $1', [ambiente]);
        }
        res.status(200).json({ message: 'Sala reservada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
}

async function getHistorico(req, res) {
    const query = 'SELECT * FROM historico';

    try {
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
}

async function deleteHistorico(req, res){
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM historico WHERE id = $1', [id]);
        res.status(200).send({ mensagem: 'historico deletado' });
    } catch (error) {
        console.error('erro ao excluir historico', error);
        res.status(500).send('erro ao excluir historico');
    }
}

async function updateHistorico(req, res) {
    try {
        const { id } = req.params;
        const { data_inicio, funcionario, ambiente } = req.body;
            await pool.query('UPDATE historico SET data_inicio = $1, funcionario = $2, ambiente = $3  WHERE id = $4', [ data_inicio, funcionario, ambiente, id]);
            res.status(200).send({ mensagem: 'historico atualizado' });
        
    } catch (error) {
        console.error('erro ao atualizar historico', error);
        res.status(500).send('erro ao atualizar historico');
    }
}

module.exports = { newPromiseClass, getHistorico, deleteHistorico, updateHistorico };