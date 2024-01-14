import { ChatTypes, Packet, Text } from '@serenityjs/bedrock-protocol';
import { NetworkStatus, Serenity } from '@serenityjs/serenity';

const serenity = new Serenity({
	address: '127.0.0.1',
	debug: true,
});

serenity.start();

serenity.on('PlayerJoined', (player) => {
	//
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

serenity.network.on(Packet.Text, (event) => {
	if (event.status !== NetworkStatus.Incoming) return;

	const text = new Text();
	text.type = ChatTypes.Chat;
	text.needsTranslation = false;
	text.source = '';
	text.message = event.packet.message;
	text.parameters = [];
	text.xuid = event.session.getPlayerInstance()!.xuid;
	text.platformChatId = '';

	void event.session.send(text);

	// event.session.disconnect('You have been kicked.', 0);
});
