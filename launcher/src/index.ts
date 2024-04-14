export * from "./serenity";
export * from "./handlers";
export * from "./properties";
export * from "./events";

import { InternalProvider, Superflat } from "@serenityjs/world";
import { DimensionType } from "@serenityjs/protocol";
import { CustomItemType, ItemCategory, ItemGroup } from "@serenityjs/item";
import { BlockPermutation, CustomBlockType } from "@serenityjs/block";

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
