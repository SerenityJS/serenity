import { Packet } from '@serenityjs/bedrock-protocol';
import { Serenity } from '@serenityjs/serenity';

const serenity = new Serenity(630, '1.20.51', '0.0.0.0');

serenity.start();

serenity.on('error', (error) => {
	console.log('Error', error);
});

serenity.on('warning', (warning) => {
	console.log('Warning', warning);
});

const network = serenity.network;

network.before(Packet.ResourcePackClientResponse, ({ packet }) => {
	console.log(packet);

	return true;
});
