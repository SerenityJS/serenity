import {
	InternalProvider,
	Superflat,
	ItemIdentifier,
	ItemStack,
	ItemType
} from "@serenityjs/world";
import { DimensionType, Packet } from "@serenityjs/protocol";

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
	new Superflat()
);

serenity.start();

serenity.network.on(Packet.Text, (data) => {
	const player = serenity.getPlayer(data.session);
	if (!player) return;

	const inventory = player.getComponent("minecraft:inventory");
	const container = inventory.container;

	const item1 = ItemType.resolve("serenity:ruby_ore" as ItemIdentifier).create(
		32,
		0
	);

	const item2 = new ItemStack(ItemIdentifier.Dirt, 32, 0);

	container.addItem(item1);
	container.addItem(item2);
});

// serenity.network.on(Packet.MovePlayer, (data) => {
// 	const player = serenity.getPlayer(data.session);
// 	if (!player) return;

// 	const pos = data.packet.position.floor();

// 	const block = player.dimension.getBlock(pos.x, 3, pos.z);

// 	// block.setPermutation(blockPermutation);
// });
