import { getPacketId, Text } from '@serenityjs/protocol';
import { Serenity } from './Serenity';

const server = new Serenity('0.0.0.0', 19_132);

server.start();

server.on('packet', ({ bin, id }, session, player) => {
	const packetId = getPacketId(bin);

	if (!player) return;
	if (packetId !== Text.id) return;

	const text = new Text(bin).deserialize();

	if (text.message === 'on') {
		player.abilities.setMayFly(true);
		player.sendToast('Mayfly', 'enabled!');
	}

	if (text.message === 'off') {
		player.abilities.setMayFly(false);
		player.sendToast('Mayfly', 'disabled!');
	}
});
