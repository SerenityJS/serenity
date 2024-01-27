import { Serenity } from '@serenityjs/serenity';

const serenity = new Serenity({
	address: '0.0.0.0',
	debug: true,
});

serenity.start();

serenity.on('PlayerJoined', ({ player }) => {
	//
});

serenity.on('PlayerSpawned', ({ player }) => {
	//
});

serenity.on('PlayerLeft', ({ player }) => {
	//
});

serenity.on('PlayerChat', ({ player }) => {
	const chunk = player.getCurrentChunk();

	console.log(chunk.getHash());
});
