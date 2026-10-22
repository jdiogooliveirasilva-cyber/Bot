
const mineflayer = require('mineflayer');

function createBot() {
    const bot = mineflayer.createBot({
        host: 'SuperDragonZ.aternos.me',
        port: 50275,
        username: 'Raboot',
        version: false
    });

    let rotinaIniciada = false;

    bot.on('login', () => {
        console.log('[NPC] Conectado ao servidor Java.');
    });

    bot.on('spawn', () => {
        console.log('[NPC] Bot entrou no servidor.');

        if (rotinaIniciada) return;
        rotinaIniciada = true;

        executarRotina();
    });

    async function executarRotina() {
        while (bot.entity) {
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

                        await new Promise(resolve =>
                            setTimeout(resolve, 2000)
                        );

                        chest.close();
                        console.log('[NPC] Baú fechado.');
                    } else {
                        console.log('[NPC] Nenhum baú encontrado.');
                    }
                }

                await new Promise(resolve =>
                    setTimeout(resolve, 1000)
                );

                bot.setControlState('jump', true);

                await new Promise(resolve =>
                    setTimeout(resolve, 500)
                );

                bot.setControlState('jump', false);

            } catch (err) {
                console.log('[NPC] Erro na rotina:', err.message);
            }

            await new Promise(resolve =>
                setTimeout(resolve, 45000)
            );
        }
    }

    bot.on('end', reason => {
        console.log('[NPC] Desconectado:', reason);
        console.log('[NPC] Tentando reconectar em 25 segundos...');

        setTimeout(createBot, 25000);
    });

    bot.on('error', err => {
        console.log('[NPC] Erro:', err.message);
    });
}

createBot();
        
