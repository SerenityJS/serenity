import {
	InternalProvider,
	Superflat,
	ItemIdentifier,
	Item,
	CustomItemType,
	ItemCategory,
	ItemGroup,
	CustomBlockType,
	BlockPermutation
} from "@serenityjs/world";
import {
	ContainerId,
	DimensionType,
	InventorySlotPacket,
	Packet
} from "@serenityjs/protocol";

import { Serenity } from "./serenity";

const serenity = new Serenity();

// Provider "Provides" the chunks and other data to the world.
// Providers are used to read and write the world data.
// They can be custom built for specific applications.
// Custom providers can be built by extending the abstract "WorldProvider" class.
// The "InternalProvider" is a basic provider that stores chunks in memory.
const provider = new InternalProvider(true); // Boolean indicates hash block values, false indicates runtime block values.

// Register the world with the serenity instance.
// The provider is what the world will use to read/write chunks and other data.
const world = serenity.createWorld("default", provider);

import "./custom-block";

// Now we need to register a dimension for the world.
// The dimension is the actual area that players will play in.
world.createDimension(
	"minecraft:overworld",
	DimensionType.Overworld,
	new Superflat() // Super flat world generator.
);

serenity.start();

serenity.network.on(Packet.Text, (data) => {
	const player = serenity.getPlayer(data.session);
	if (!player) return;

	const inventory = player.getComponent("minecraft:inventory");
	const container = inventory.container;

	const spawnEgg = new Item(ItemIdentifier.AgentSpawnEgg, 45, container);
	const water = new Item(ItemIdentifier.Water, 1, container);
	const lava = new Item(ItemIdentifier.Element10, 1, container);

	container.addItem(spawnEgg);
	container.addItem(water);
	container.addItem(lava);

	const packet = new InventorySlotPacket();
	packet.slot = 7;
	packet.containerId = ContainerId.Inventory;
	packet.item = {
		network: 10_000,
		blockRuntimeId: 0,
		metadata: 0,
		stackNetId: null,
		stackSize: 1,
		extras: null
	};

	player.session.send(packet);
});

// serenity.network.on(Packet.MovePlayer, (data) => {
// 	const player = serenity.getPlayer(data.session);
// 	if (!player) return;

// 	const pos = data.packet.position.floor();

// 	const block = player.dimension.getBlock(pos.x, 3, pos.z);

// 	// block.setPermutation(blockPermutation);
// });
