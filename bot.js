const mineflayer = require('@wp2508/mineflayer');

const HOST = 'basslet.aternos.host';
const PORT = 50275;
const USERNAME = 'Raboot';

let reconectando = false;

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createBot() {
    console.log('[NPC] Conectando ao servidor...');

    const bot = mineflayer.createBot({
        host: HOST,
        port: PORT,
        username: USERNAME,
        version: false
    });

    let rotinaIniciada = false;
    let encerrando = false;

    bot.on('login', () => {
        console.log('[NPC] Conectado ao servidor Java.');
    });

    bot.on('spawn', () => {
        console.log('[NPC] Bot entrou no servidor.');

        if (!rotinaIniciada) {
            rotinaIniciada = true;
            executarRotina();
        }
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
                        console.log('[NPC] Abrindo baú...');

                        const chest = await bot.openChest(chestBlock);

                        await esperar(2000);

                        chest.close();
                        console.log('[NPC] Baú fechado.');
                    } else {
                        console.log('[NPC] Nenhum baú encontrado.');
                    }
                }

                await esperar(1000);

                if (bot.entity) {
                    bot.setControlState('jump', true);
                    await esperar(500);
                    bot.setControlState('jump', false);
                }
            } catch (err) {
                console.log('[NPC] Erro na rotina:', err.message);

                try {
                    bot.clearControlStates();
                } catch {}
            }

            await esperar(45000);
        }
    }

    bot.on('end', reason => {
        encerrando = true;
        console.log('[NPC] Desconectado:', reason);

        if (!reconectando) {
            reconectando = true;
            console.log('[NPC] Tentando reconectar em 25 segundos...');

            setTimeout(() => {
                reconectando = false;
                createBot();
            }, 25000);
        }
    });

    bot.on('error', err => {
        console.log('[NPC] Erro:', err.message);
    });
}

createBot();
