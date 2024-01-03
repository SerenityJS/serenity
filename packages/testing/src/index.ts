import { Disconnect, Packet } from '@serenityjs/bedrock-protocol';
import { Serenity, NetworkStatus } from '@serenityjs/serenity';

const serenity = new Serenity(630, '1.20.51', '127.0.0.1');

serenity.start();

const network = serenity.network;

network.on(Packet.RequestNetworkSettings, ({ session }) => {
	// const disconnect = new Disconnect();
	// disconnect.reason = 40;
	// disconnect.hideDisconnectionScreen = false;
	// disconnect.message = 'test';
	// network.send(session, disconnect);
});

network.before(Packet.Disconnect, ({ packet, status }) => {
	if (status === NetworkStatus.Incoming) {
		console.log('Incoming disconnect packet', packet);
	}

	if (status === NetworkStatus.Outgoing) {
		console.log('Outgoing disconnect packet', packet);
	}

	packet.message = 'intercepted test';

	return true;
});
