import {
	MetadataFlags,
	DimensionType,
	Gamemode,
	MetadataKey,
	Packet,
	Vector3f,
	MetadataType,
} from '@serenityjs/bedrock-protocol';
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
});

serenity.network.on(Packet.BlockPickRequest, ({ packet, session }) => {
	if (!session.player) return;

	const { x, y, z } = packet;

	const entity = session.player.dimension.spawnEntity('minecraft:npc', new Vector3f(x, y + 1, z));

	const nametag = entity.getComponent('minecraft:nametag');

	nametag.setCurrentValue('Hello, World!');

	const component = entity.getComponent('minecraft:always_show_nametag');

	component.setCurrentValue(true);

	// Random number between 0 and 20.
	const random = Math.floor(Math.random() * 20);

	const variant = entity.getComponent('minecraft:variant');

	variant.setCurrentValue(random);
});
