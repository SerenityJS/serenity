import { ChatTypes, Packet, Text, TitleTypes } from '@serenityjs/bedrock-protocol';
import { NetworkStatus, Serenity } from '@serenityjs/serenity';

const serenity = new Serenity({
	address: '0.0.0.0',
	debug: true,
});

serenity.start();

serenity.on('PlayerJoined', (player) => {
	//
});

serenity.on('PlayerSpawned', (player) => {
	//
});

serenity.after('PlayerLeft', (player) => {
	// Do something when a player leaves.
});
