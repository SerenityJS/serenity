import { ContainerId, ContainerType } from "@serenityjs/protocol";
import { CompoundTag, IntTag, ListTag, StringTag, Tag } from "@serenityjs/nbt";
import { BlockIdentifier } from "@serenityjs/block";

import { BlockContainer } from "../../container";

import { BlockInventoryComponent } from "./inventory";
import { BlockNBTComponent } from "./nbt";

import type { CraftingTableComponentNBT } from "../../types";
import type { Block } from "../../block";

/**
 * @deprecated
 */
class BlockCraftingTableComponent extends BlockNBTComponent {
	public static readonly identifier = "minecraft:crafting_table";

	/**
	 * The crafting tags of the crafting table.
	 */
	public static readonly craftingTags: Array<string> = [];

	/**
	 * The grid size of the crafting table.
	 */
	public static gridSize: number = 3;

	/**
	 * The name of the crafting table.
	 */
	public static tableName = "Custom Table";

	/**
	 * The title of the crafting table.
	 */
	public constructor(block: Block) {
		super(block, BlockCraftingTableComponent.identifier);

		// Check if the block is custom or if the identifier is a crafting table
		if (
			!block.permutation.type.custom &&
			block.permutation.type.identifier !== BlockIdentifier.CraftingTable
		) {
			throw new Error("Block type must be custom or a crafting table!");
		}

		// Create a container for the crafting table
		const containerSize = BlockCraftingTableComponent.gridSize ** 2;
		const container = new BlockContainer(
			block,
			ContainerType.Workbench,
			ContainerId.Ui,
			containerSize
		);

		// Create a new inventory component for the block.
		new BlockInventoryComponent(block);
	}

	public static serialize(): CompoundTag<CraftingTableComponentNBT> {
		// Create a new compound tag
		const component = new CompoundTag(this.identifier, {});

		// Create a list tag for storing the crafting tags
		// This is used to store the crafting tags of the crafting table.
		const craftingTags = new ListTag<StringTag>(
			"crafting_tags",
			[],
			Tag.String
		);
		for (const tag of this.craftingTags) {
			// Add the tag to the list
			craftingTags.push(new StringTag("", tag));
		}

		// Add the crafting tags to the compound tag
		component.addTag(craftingTags);

		// Add the grid size to the compound tag
		component.addTag(new IntTag("grid_size", this.gridSize));

		// Add the table name to the compound tag
		component.addTag(new StringTag("table_name", this.tableName));

		// Return the tag
		return component as CompoundTag<CraftingTableComponentNBT>;
	}
}

export { BlockCraftingTableComponent };
