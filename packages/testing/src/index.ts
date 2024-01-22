import { Serenity } from '@serenityjs/serenity';

const serenity = new Serenity({
	address: '0.0.0.0',
	debug: true,
});

serenity.start();

serenity.on('PlayerJoined', ({ player }) => {
	// console.log('join');
});

serenity.on('PlayerSpawned', ({ player }) => {
	// console.log('spawn');
});

serenity.on('PlayerLeft', ({ player }) => {
	// console.log('left');
});
