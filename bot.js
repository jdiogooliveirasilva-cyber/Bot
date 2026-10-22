const mineflayer = require('@wp2508/mineflayer');

const CONFIG = {
    host: 'basslet.aternos.host',
    port: 50275,
    username: 'Raboot',
    version: false
};

const ESPERA_RECONEXAO = 25000;
const INTERVALO_ROTINA = 45000;

let reconexaoAgendada = false;

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createBot() {
    console.log('[NPC] Conectando ao servidor...');
    console.log(`[NPC] Endereço: ${CONFIG.host}:${CONFIG.port}`);

    let bot;

    try {
        bot = mineflayer.createBot(CONFIG);
    } catch (err) {
        console.error('[NPC] Falha ao criar conexão:', err.message);
        agendarReconexao();
        return;
    }

    let rotinaIniciada = false;
    let encerrando = false;

    bot.on('login', () => {
        console.log('[NPC] Login realizado.');
    });

    bot.on('spawn', () => {
        console.log('[NPC] Bot entrou no servidor.');

        if (rotinaIniciada) return;

        rotinaIniciada = true;
        executarRotina();
    });

    async function executarRotina() {
        while (bot.entity && !encerrando) {
            try {
                const chestId = bot.registry.blocksByName.chest?.id;

                if (chestId !== undefined) {
                    const chestBlock = bot.findBlock({
                        matching: chestId,
                        maxDistance: 5
                    });

                    if (chestBlock) {
                        console.log('[NPC] Baú encontrado. Tentando abrir...');

                        const chest = await bot.openChest(chestBlock);

                        await esperar(2000);

                        chest.close();
                        console.log('[NPC] Baú fechado.');
                    } else {
                        console.log('[NPC] Nenhum baú encontrado a até 5 blocos.');
                    }
                }

                await esperar(1000);

                if (bot.entity && !encerrando) {
                    bot.setControlState('jump', true);
                    await esperar(500);
                    bot.setControlState('jump', false);
                    console.log('[NPC] Salto realizado.');
                }
            } catch (err) {
                console.error('[NPC] Erro na rotina:', err.message);

                try {
                    bot.clearControlStates();
                } catch {}
            }

            await esperar(INTERVALO_ROTINA);
        }
    }

    bot.on('end', reason => {
        encerrando = true;

        try {
            bot.clearControlStates();
        } catch {}

        console.log('[NPC] Conexão encerrada:', reason);
        console.log('[NPC] Consulte o Console do Aternos para verificar se a tentativa chegou ao servidor.');

        agendarReconexao();
    });

    bot.on('error', err => {
        console.error('[NPC] Erro de conexão:', err.message);
    });

    function agendarReconexao() {
        if (reconexaoAgendada) return;

        reconexaoAgendada = true;

        setTimeout(() => {
            reconexaoAgendada = false;
            createBot();
        }, ESPERA_RECONEXAO);
    }
}

createBot();
