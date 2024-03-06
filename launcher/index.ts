import { DimensionType, Gamemode, Packet, Vector3f } from '@serenityjs/bedrock-protocol';
import type { Block } from '@serenityjs/serenity';
import { Serenity, InternalProvider, Overworld, BlockBehavior } from '@serenityjs/serenity';

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
world.registerDimension('minecraft:overworld', DimensionType.Overworld, new Overworld());

// Start the server.
serenity.start();

serenity.on('PlayerSpawned', (event) => {
	event.player.getComponent('minecraft:ability.may_fly').setCurrentValue(true);

	event.player.gamemode = Gamemode.Survival;
});

serenity.network.on(Packet.BlockPickRequest, ({ packet, session }) => {
	if (!session.player) return;

	const { x, y, z } = packet;

	const entity = session.player.dimension.spawnEntity('minecraft:pig', new Vector3f(x, y + 1, z));

	const scale = entity.getComponent('minecraft:scale');

	scale.setCurrentValue(2.5);
});
