import { ContainerSlotType, DimensionType, Packet, Vector3f } from '@serenityjs/bedrock-protocol';
import {
	Serenity,
	InternalProvider,
	BetterFlat,
	EntityInventoryComponent,
	EntityCursorComponent,
	EntityContainer,
	Item,
	ItemType,
} from '@serenityjs/serenity';

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

serenity.on('PlayerJoined', (event) => {
	// Create a new inventory container.
	const container = new EntityContainer(event.player, ContainerSlotType.Inventory, 36);

	// Create a new inventory component.
	const inventory = new EntityInventoryComponent(event.player, container);

	// Register the component to the player.
	event.player.setComponent(inventory);

	// Create a new cursor container.
	const container2 = new EntityContainer(event.player, ContainerSlotType.Cursor, 1);

	// Create a new cursor component.
	const cursor = new EntityCursorComponent(event.player, container2);

	// Register the component to the player.
	event.player.setComponent(cursor);
});

serenity.on('PlayerChat', (event) => {
	// Get the item to add & and the amount.
	const [name, amount] = event.message.split(' ');

	// Get the player's inventory and container.
	const inventory = event.player.components.get('minecraft:inventory') as EntityInventoryComponent;
	const container = inventory.container;

	// Construct the item with the container and the item type.
	// This will automatically resolve the item type and create the item, and add it to the container.
	const item = new Item(ItemType.resolve(name)!, Number(amount ?? 1));

	// Add the item to the container.
	container.setItem(4, item);
});
