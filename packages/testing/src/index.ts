import {
	ChatTypes,
	MetadataFlags,
	MetadataKey,
	MetadataType,
	Packet,
	SetEntityData,
	Text,
	TitleTypes,
} from '@serenityjs/bedrock-protocol';
import { NetworkStatus, Serenity } from '@serenityjs/serenity';

const serenity = new Serenity({
	address: '0.0.0.0',
	debug: true,
});

serenity.start();

serenity.on('PlayerJoined', (player) => {
	console.log('join');
});

serenity.on('PlayerSpawned', (player) => {
	console.log('spawn');
});

serenity.after('PlayerLeft', (player) => {
	console.log('left');
});
