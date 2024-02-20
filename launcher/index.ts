import { DimensionType, Packet, Vector3f } from '@serenityjs/bedrock-protocol';
import { Serenity, InternalProvider, BetterFlat, BlockPermutation } from '@serenityjs/serenity';
import { ItemType } from '../packages/serenity/dist/world/items/Type.js';

// Create a new serenity instance.
const serenity = new Serenity();

// Provider "Provides" the chunks and other data to the world.
// Providers are used to read and write the world data.
// They can be custom built for specific applications.
// Custom providers can be built by extending the abstract "WorldProvider" class.
// The "InternalProvider" is a basic provider that stores chunks in memory.
const provider = serenity.registerProvider(InternalProvider);

// Register the world with the serenity instance.
// The provider is what the world will use to read/write chunks and other data.
const world = serenity.registerWorld('default-world', provider);

// Now we need to register a dimension for the world.
// The dimension is the actual area that players will play in.
world.registerDimension('minecraft:overworld', DimensionType.Overworld, BetterFlat.BasicFlat());

// Start the server.
serenity.start();

serenity.network.on(Packet.BlockPickRequest, ({ packet, session, bound }) => {
	if (!session.player) return;

	const player = session.player;

	const entity = player.dimension.spawnEntity('minecraft:npc', new Vector3f(packet.x, packet.y + 1, packet.z));

	entity.nametag = entity.identifier;
	entity.scale = 1.25;
	entity.variant = Math.floor(Math.random() * 20);
});

serenity.on('PlayerChat', (event) => {
	switch (event.message) {
		case 'survival':
			event.player.gamemode = 0;
			break;
		case 'creative':
			event.player.gamemode = 1;
			break;
		case 'adventure':
			event.player.gamemode = 2;
			break;
		case 'spectator':
			event.player.gamemode = 3;
			break;
	}
});
