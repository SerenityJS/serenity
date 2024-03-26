import {
	CustomItemType,
	CustomBlockType,
	BlockPermutation,
	ItemCategory,
	ItemGroup
} from "@serenityjs/world";

// This is an example on how to register custom blocks to serenityjs.
// First we need to create a custom item type.

const rubyBlockItemType = new CustomItemType(
	"serenity:ruby_block", // Item identifier.
	ItemCategory.Construction // Creative category.
);

// Then we need to create a custom block type.

const rubyBlockType = new CustomBlockType(
	"serenity:ruby_block", // Block identifier.
	rubyBlockItemType // Item type.
);

// Then we need to register a block permutation.
BlockPermutation.register(rubyBlockType); // This is a barebones method, states will be implemented later.

// Now we have a custom block registered to serenityjs.

const rubyOreItemType = new CustomItemType(
	"serenity:ruby_ore", // Item identifier.
	ItemCategory.Nature, // Creative category.
	ItemGroup.Ore // Creative category group.
);

const rubyOreType = new CustomBlockType(
	"serenity:ruby_ore", // Block identifier.
	rubyOreItemType // Item type.
);

BlockPermutation.register(rubyOreType); // This is a barebones method, states will be implemented later.

const sapphireBlockItemType = new CustomItemType(
	"serenity:sapphire_block", // Item identifier.
	ItemCategory.Construction // Creative category.
);

const sapphireBlockType = new CustomBlockType(
	"serenity:sapphire_block", // Block identifier.
	sapphireBlockItemType // Item type.
);

BlockPermutation.register(sapphireBlockType); // This is a barebones method, states will be implemented later.

const sappireOrerItemType = new CustomItemType(
	"serenity:sapphire_ore", // Item identifier.
	ItemCategory.Nature, // Creative category.
	ItemGroup.Ore // Creative category group.
);

const sapphireOreType = new CustomBlockType(
	"serenity:sapphire_ore", // Block identifier.
	sappireOrerItemType // Item type.
);

BlockPermutation.register(sapphireOreType); // This is a barebones method, states will be implemented later.
