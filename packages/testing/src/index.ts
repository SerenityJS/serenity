import { Gamemode } from '@serenityjs/bedrock-protocol';
import { Serenity } from '@serenityjs/serenity';

const serenity = new Serenity({
	address: '0.0.0.0',
	debug: true,
});

serenity.start();

serenity.on('PlayerChat', (event) => {
	if (event.message === 'dim') {
		const dim = serenity.world.getDimension('minecraft:nether');
		event.player.setDimension(dim);
	}
});
