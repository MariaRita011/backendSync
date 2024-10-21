const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const pool = require('./config/dbconfig'); // Certifique-se de que o pool de conexão está configurado corretamente

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
    console.log('Escaneie o QR code abaixo para autenticar no WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Cliente do WhatsApp está pronto!');
});
client.initialize();

async function getSemanal() {
    try {
        console.log('Executando consulta getSemanal...');
        const query = `
           SELECT h.*, u.* FROM historico h JOIN usuarios u ON h.funcionario = u.nif WHERE h.data_fim IS NULL;
        `;

        const response = await pool.query(query);
        console.log('Consulta getSemanal executada com sucesso.');
        return response.rows;
    } catch (error) {
        console.error('Erro ao executar a consulta:', error);
        throw error;
    }
}

async function sendMessage(groupNameOrId, message) {
    try {
        console.log(`Enviando mensagem para ${groupNameOrId}...`);
        const chats = await client.getChats();
        let groupId = null;

        // Encontra o ID do grupo ou contato pelo nome ou ID
        chats.forEach(chat => {
            if (chat.name == groupNameOrId || chat.id._serialized == groupNameOrId) {
                groupId = chat.id._serialized;
            }
        });

        if (groupId) {
            await client.sendMessage(groupId, message);
            console.log(`\nMensagem enviada para ${groupNameOrId}:\n${message}`);
        } else {
            console.log(`\nGrupo ou contato não encontrado: ${groupNameOrId}`);
        }
    } catch (err) {
        console.error("\nErro ao enviar mensagem:", err);
    }
}

async function sendDailyMessage() {
    try {
        const message = 'Bom dia! Lembre-se de devolver a sua chave hoje.';

        console.log('Mensagem montada:', message);

        // Substitua 'Nome do Grupo' pelo nome do grupo ou ID do contato
        await sendMessage(process.env.GROUPID, message);
    } catch (error) {
        console.error('Erro ao enviar a mensagem diária:', error);
    }
}

// Função para formatar a mensagem
function formatMessage(data) {
    const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const unlubricatedMachines = {};

    data.forEach(row => {
        const date = new Date(row.date);
        const dayOfWeek = daysOfWeek[date.getDay() - 1]; // Ajusta o índice para começar na segunda-feira

        if (!unlubricatedMachines[row.patrimonio]) {
            unlubricatedMachines[row.patrimonio] = [];
        }
        unlubricatedMachines[row.patrimonio].push(dayOfWeek);
    });

    let message = '';
    for (const patrimonio in unlubricatedMachines) {
        message += `Máquina ${patrimonio}:\n`;
        const sortedDays = unlubricatedMachines[patrimonio].sort((a, b) => {
            return daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b);
        });
        message += sortedDays.join('\n');
        message += '\n\n';
    }

    return message.trim(); // Remove espaços em branco extras no final da mensagem
}

// Função para enviar relatório semanal
async function sendWeeklyReport() {
    try {
        const data = await getSemanal();
        const message = formatMessage(data);

        console.log('Mensagem semanal montada:', message);

        // Substitua 'Nome do Grupo' pelo nome do grupo ou ID do contato
        await sendMessage(process.env.GROUPID, message);
    } catch (error) {
        console.error('Erro ao enviar o relatório semanal:', error);
    }
}

// Agendar a tarefa diária para ser executada às 17h03 da tarde
cron.schedule('3 17 * * *', () => {
    console.log('Enviando mensagem diária às 17h03 da tarde...');
    sendDailyMessage();
});

// Agendar a tarefa semanal para ser executada às 17h03 da tarde nas sextas-feiras
cron.schedule('3 17 * * 5', () => {
    console.log('Enviando relatório semanal às 17h03 da tarde na sexta-feira...');
    sendWeeklyReport();
});

module.exports = { sendMessage };