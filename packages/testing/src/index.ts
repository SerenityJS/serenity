import { Packet } from '@serenityjs/bedrock-protocol';
import { Serenity } from '@serenityjs/serenity';

const serenity = new Serenity({
	address: '0.0.0.0',
	debug: true,
});

serenity.start();

serenity.on('PlayerJoined', (player) => {
	console.log(player.runtimeId, player.uniqueId);
});

serenity.on('PlayerSpawned', (player) => {
	player.setMayFly(true);
});

serenity.after('PlayerLeft', (player) => {
	// Do something when a player leaves.
});

serenity.network.before(Packet.StartGame, (event) => {
	const { packet } = event;

	packet.playerPosition = { x: 0, y: -64, z: 0 };

	return true;
});
