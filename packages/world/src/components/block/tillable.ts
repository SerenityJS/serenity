import { BlockIdentifier, BlockType } from "@serenityjs/block";
import { ItemIdentifier, ItemToolType } from "@serenityjs/item";
import { Gamemode } from "@serenityjs/protocol";

import { BlockComponent } from "./block-component";

import type { Block } from "../../block";
import type { CompoundTag } from "@serenityjs/nbt";
import type { Player } from "../../player";

class BlockTillableComponent extends BlockComponent {
	public static readonly identifier = "minecraft:tillable";

	public static readonly types = [
		BlockIdentifier.Dirt,
		BlockIdentifier.GrassBlock,
		BlockIdentifier.Farmland
	];

	/**
	 * Whether the block is tilled
	 */
	public tilled = false;

	/**
	 * The block outcome when tilled.
	 */
	public outcome: BlockIdentifier = BlockIdentifier.Farmland;

	public constructor(block: Block) {
		super(block, BlockTillableComponent.identifier);

		// Check if the block is farmland, if so set the tilled value to true.
		if (block.getType().identifier === BlockIdentifier.Farmland)
			this.tilled = true;
	}

	public onInteract(player: Player): void {
		// Verify the player's gamemode.
		const gamemode = player.getGamemode();

		// Check if the player is in spectator or adventure mode.
		if (gamemode === Gamemode.Spectator || gamemode === Gamemode.Adventure)
			return;

		// Get the player's held item.
		const inventory = player.getComponent("minecraft:inventory");
		const itemStack = inventory.getHeldItem();

		// Check if the held item is valid.
		if (itemStack === null) return;

		// Check if the block is already tilled.
		// If so, plant the block.
		if (this.tilled) {
			// TODO: Implement ItemPlantComponent

			if (itemStack.type.identifier !== ItemIdentifier.WheatSeeds) return;

			const crop = BlockType.get(BlockIdentifier.Wheat);

			if (this.plant(crop, player)) itemStack.decrement();
		}

		// Check if the item is a hoe tool
		if (itemStack.getToolType() !== ItemToolType.Hoe) return;

		// Force the player to use the hoe.
		player.useItem();

		// Tills the block.
		this.till(player);
	}

	public onBreak(player?: Player): boolean {
		// Get the block above the current block.
		const above = this.block.above();

		// Check if the block above has a growth component.
		const growth = above.hasComponent("minecraft:growth");

		// Destroy the block above if it has a growth component.
		if (growth) above.destroy(player);

		return true;
	}

	/**
	 * Tills the block.
	 * @param player The player that tilled the block.
	 */
	public till(player?: Player): void {
		// Get the block type of the outcome.
		const type = BlockType.get(this.outcome);

		// Set the block type to the outcome.
		this.block.setType(type, { player, clearComponents: false });

		// Set the block as tilled.
		this.tilled = true;
	}

	public plant(crop: BlockType, player?: Player): boolean {
		// Get the block above the current block.
		const above = this.block.above();

		// Check if the block above is air.
		if (!above.isAir()) return false;

		// Set the block type to the provided crop.
		above.setType(crop, { player, clearComponents: true });

		// Return true if the block was successfully planted.
		return true;
	}

	public static serialize(
		nbt: CompoundTag,
		component: BlockTillableComponent
	): void {
		// Create the tilled tag.
		nbt.createByteTag("Tilled", component.tilled ? 1 : 0);

		// Create the outcome tag.
		nbt.createStringTag("Outcome", component.outcome);
	}

	public static deserialize(
		nbt: CompoundTag,
		block: Block
	): BlockTillableComponent {
		// Create the component.
		const component = new this(block);

		// Set the tilled value.
		component.tilled = nbt.getTag("Tilled")?.value === 1;

		// Set the outcome value.
		component.outcome = nbt.getTag("Outcome")?.value as BlockIdentifier;

		// Return the component.
		return component;
	}
}

export { BlockTillableComponent };
