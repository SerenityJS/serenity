import {
	InternalProvider,
	Superflat,
	ItemNametagComponent,
	EntityIdentifier
} from "@serenityjs/world";
import { DimensionType, Packet } from "@serenityjs/protocol";
import { NetworkBound } from "@serenityjs/network";
import {
	CreativeItem,
	CustomItemType,
	ItemCategory,
	ItemGroup,
	ItemIdentifier,
	ItemType
} from "@serenityjs/item";
import {
	BlockIdentifier,
	BlockPermutation,
	BlockType,
	CustomBlockType
} from "@serenityjs/block";

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

// Now we need to register a dimension for the world.
// The dimension is the actual area that players will play in.
world.createDimension(
	"minecraft:overworld",
	DimensionType.Overworld,
	new Superflat()
);

serenity.start();

serenity.network.before(Packet.Text, (data) => {
	if (data.bound === NetworkBound.Client) return true;

	const player = serenity.getPlayer(data.session);
	if (!player) return false;

	if (data.packet.message.startsWith("rename")) {
		const inventory = player.getComponent("minecraft:inventory");

		const item = inventory.getHeldItem();

		if (!item) return false;

		const component = item.components.has("minecraft:nametag")
			? item.getComponent("minecraft:nametag")
			: item.setComponent(new ItemNametagComponent(item));

		component.setCurrentValue(data.packet.message.slice(7));

		console.log(item.components);

		return false;
	} else if (data.packet.message.startsWith("entity")) {
		player.dimension.spawnEntity(EntityIdentifier.Pig, player.position);
	}

	return true;
});

serenity.network.on(Packet.BlockPickRequest, (data) => {
	const player = serenity.getPlayer(data.session);
	if (!player) return;

	const block = player.dimension.getBlock(
		data.packet.x,
		data.packet.y,
		data.packet.z
	);
	const item = block.getItemStack();

	const inventory = player.getComponent("minecraft:inventory");

	const nametag = new ItemNametagComponent(item);

	inventory.container.addItem(item);

	nametag.setCurrentValue("Hello, World!");
});

// How to create a custom block with a custom item on SerenityJS.
// This will also allow to assign the block item to a specific creative tab/category.
// The custom block will be registered with the block registry.

// First we need to create a new custom block type.
const customBlockType = new CustomBlockType("serenity:ruby_ore", false);

// Next we need to create a new block permutation for the custom block,
// this will allow us to define the block state. At the moment, custom states are not supported for custom blocks.
// This will be added in the future.
const customBlockPermutation = BlockPermutation.create(customBlockType, {}); // Blank state record.

// We now need to register the block permutation with to the custom block type.
customBlockType.register(customBlockPermutation);

// Now we need to create a custom item type for the custom block.
// This will allow us to define the item properties and creative tab/category.
// NOTE: Custom items do not need to have a block associated with them.
// If no category/group is provided, the item will not be added to the creative inventory.
new CustomItemType(
	"serenity:ruby_ore", // The identifier of the custom item.
	customBlockType, // The block of the custom item.
	ItemCategory.Nature, // The category of the custom item.
	ItemGroup.Ore // The group of the custom item.
);

const rubyBlock = new CustomBlockType("serenity:ruby_block", false);

const rubyBlockPermutation = BlockPermutation.create(rubyBlock, {});

rubyBlock.register(rubyBlockPermutation);

new CustomItemType("serenity:ruby_block", rubyBlock, ItemCategory.Nature);
