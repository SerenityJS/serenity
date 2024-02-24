import {
	AbilityLayerFlag,
	AbilityLayerType,
	CommandPermissionLevel,
	ContainerSlotType,
	DimensionType,
	Packet,
	PermissionLevel,
	UpdateAbilities,
	Vector3f,
} from '@serenityjs/bedrock-protocol';
import {
	Serenity,
	InternalProvider,
	BetterFlat,
	EntityInventoryComponent,
	EntityCursorComponent,
	EntityContainer,
	Item,
	ItemType,
	EntityMovementComponent,
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

	const movement = new EntityMovementComponent(event.player);

	event.player.setComponent(movement);
});

serenity.on('PlayerChat', (event) => {
	const speed = Number(event.message);

	const movement = event.player.getComponent('minecraft:movement');

	movement.setCurrentValue(speed);

	console.log(movement);
});
