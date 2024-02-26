import { DimensionType, NetworkChunkPublisherUpdate, Packet, Vector3f } from '@serenityjs/bedrock-protocol';
import { Serenity, InternalProvider, BetterFlat } from '@serenityjs/serenity';

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

serenity.on('PlayerSpawned', (event) => {
	event.player.getComponent('minecraft:ability.may_fly').setCurrentValue(true);
});

serenity.network.on(Packet.BlockPickRequest, ({ session, packet }) => {
	if (!session.player) return;

	session.player.dimension.spawnEntity('minecraft:npc', new Vector3f(packet.x, packet.y + 1, packet.z));
});
