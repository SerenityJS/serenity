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
	// Do something when a player joins.
});

serenity.on('PlayerSpawned', (player) => {
	// serenity.world.setBlock(0, -58, 0, 1);
});

serenity.after('PlayerLeft', (player) => {
	// Do something when a player leaves.
});

serenity.network.on(Packet.Text, ({ packet, session }) => {
	if (packet.message === 'on') {
		const data = new SetEntityData<boolean>();
		data.runtimeEntityId = session.runtimeId;
		data.metadata = [
			{
				key: MetadataKey.Flags,
				type: MetadataType.Long,
				value: true,
				flag: MetadataFlags.AffectedByGravity,
			},
		];
		data.properties = {
			ints: [],
			floats: [],
		};
		data.tick = BigInt(0);

		void session.send(data);
	} else if (packet.message === 'off') {
		const data = new SetEntityData<boolean>();
		data.runtimeEntityId = session.runtimeId;
		data.metadata = [
			{
				key: MetadataKey.Flags,
				type: MetadataType.Long,
				value: false,
				flag: MetadataFlags.AffectedByGravity,
			},
		];
		data.properties = {
			ints: [],
			floats: [],
		};
		data.tick = BigInt(0);

		void session.send(data);
	}
});
