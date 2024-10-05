import { CompoundTag, FloatTag } from "@serenityjs/nbt";
import { Vector3f } from "@serenityjs/protocol";
import { BlockIdentifier } from "@serenityjs/block";

import { ItemStack } from "../../item";

import { BlockComponent } from "./block-component";

import type { Block } from "../../block";
import type { Player } from "../../player";

// TODO: Detect when the block is hitted and drop the item
class ItemFrameComponent extends BlockComponent {
	public static readonly identifier = "minecraft:item_frame";

	public static readonly types: Array<BlockIdentifier> = [
		BlockIdentifier.Frame,
		BlockIdentifier.GlowFrame
	];

	/**
	 * The ItemStack contained within the item frame.
	 */
	public itemStack?: ItemStack;

	/**
	 * The rotation of the item within the item frame.
	 */
	public itemRotation: number = 0;

	public constructor(block: Block) {
		super(block, ItemFrameComponent.identifier);
	}

	public static serialize(
		nbt: CompoundTag,
		component: ItemFrameComponent
	): void {
		if (component.itemStack)
			nbt.addTag(ItemStack.serialize(component.itemStack, "Item"));
		nbt.addTag(
			new FloatTag("ItemRotation", component.itemRotation),
			new FloatTag("ItemDropChance", 1)
		);
	}

	/**
	 * Rotates the item within the item frame to a specified angle.
	 *
	 * @param angle - The angle to rotate the item to. If the angle is greater than 315 degrees, the rotation resets to 0.
	 *
	 * @returns void
	 */
	public rotate(angle: number): void {
		this.itemRotation = angle > 315 ? 0 : angle;
	}

	/**
	 * Handles the interaction of a player with the item frame.
	 * @param player - The player interacting with the item frame.
	 * @throws Will throw an error if the player does not have an inventory.
	 */
	public onInteract(player: Player): void {
		// Get the player's inventory
		const playerInventory = player.getComponent("minecraft:inventory");

		// Check if the player has an inventory
		if (!playerInventory) throw new Error("Player does not have an inventory!");
		// Get the held item from the player's inventory
		const heldItem = playerInventory.getHeldItem();
		const blockNbt = new CompoundTag();

		// If the player has a held item, rotate it or set it as the item stack in the item frame.
		if (!heldItem && !this.itemStack) return;
		else if (this.itemStack) this.rotate(this.itemRotation + 45);
		else if (heldItem) this.itemStack = heldItem;

		// Update the block NBT with the new item stack or rotation.
		ItemFrameComponent.serialize(blockNbt, this);
		this.block.nbt.addTag(...blockNbt.getTags());
		this.block.update();
	}

	public onBreak(): boolean {
		if (!this.itemStack) return true;
		// ? Handle breaking the item frame.
		const { x, y, z } = this.block.position;
		// Spawn the item stack above the item frame.
		this.block.dimension.spawnItem(this.itemStack, new Vector3f(x, y + 0.5, z));
		return true;
	}
}

export { ItemFrameComponent };
