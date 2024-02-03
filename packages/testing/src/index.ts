import { Gamemode } from '@serenityjs/bedrock-protocol';
import { Serenity } from '@serenityjs/serenity';

const serenity = new Serenity({
	address: '0.0.0.0',
	debug: true,
});

serenity.start();

serenity.on('PlayerChat', (event) => {
	if (event.message === 'gamemode c') {
		event.player.setGamemode(Gamemode.Creative);
	} else if (event.message === 'gamemode s') {
		event.player.setGamemode(Gamemode.Survival);
	} else if (event.message === 'gamemode spec') {
		event.player.setGamemode(Gamemode.Spectator);
	}
});
