import {
	BlockCoordinates,
	BlockEventPacket,
	BlockEventType,
	ContainerId,
	ContainerType,
	LevelSoundEvent,
	LevelSoundEventPacket,
	Vector3f
} from "@serenityjs/protocol";
import { BlockIdentifier } from "@serenityjs/block";
import { type ListTag, Tag, type CompoundTag } from "@serenityjs/nbt";

import { BlockContainer } from "../../container";
import { ItemStack } from "../../item";

import { BlockComponent } from "./block-component";

import type { Player } from "../../player";
import type { Block } from "../../block";

class BlockInventoryComponent extends BlockComponent {
	public static readonly identifier = "minecraft:inventory";

	/**
	 * The type of container.
	 */
	public readonly containerType: ContainerType;

	/**
	 * The identifier of the container.
	 */
	public readonly containerId: ContainerId;

	/**
	 * The size of the inventory.
	 */
	public readonly inventorySize: number;

	/**
	 * The container of the inventory.
	 */
	public readonly container: BlockContainer;

	/**
	 * Creates a new inventory component for a block.
	 * @param block The block the component is binded to.
	 */
	public constructor(block: Block) {
		super(block, BlockInventoryComponent.identifier);

		// Create the container for the block based on the block type
		switch (block.getType().identifier) {
			default: {
				// Set the container type and id
				this.containerType = ContainerType.Container;
				this.containerId = ContainerId.Ui;
				this.inventorySize = 27;
				break;
			}

			case BlockIdentifier.CraftingTable: {
				// Set the container type and id
				this.containerType = ContainerType.Workbench;
				this.containerId = ContainerId.Ui;
				this.inventorySize = 9;
				break;
			}

			case BlockIdentifier.LitFurnace:
			case BlockIdentifier.Furnace: {
				// Set the container type and id
				this.containerType = ContainerType.Furnace;
				this.containerId = ContainerId.Ui;
				this.inventorySize = 3;
				break;
			}

			case BlockIdentifier.EnchantingTable: {
				// Set the container type and id
				this.containerType = ContainerType.Enchantment;
				this.containerId = ContainerId.Ui;
				this.inventorySize = 20; // Why?
				break;
			}
		}

		// Create the container for the block
		this.container = new BlockContainer(
			block,
			this.containerType,
			this.containerId,
			this.inventorySize
		);
	}

	public onTick(): void {
		// Check if the container has any occupants
		if (this.container.occupants.size > 0 && !this.container.opened) {
			// Set the container to opened
			this.container.opened = true;

			// Create a new block event packet
			const packet = new BlockEventPacket();
			packet.position = this.block.position;
			packet.type = BlockEventType.ChangeState;
			packet.data = 1;

			// Create a new level sound event packet
			const sound = new LevelSoundEventPacket();
			sound.position = BlockCoordinates.toVector3f(this.block.position);
			sound.data = this.block.permutation.network;
			sound.actorIdentifier = String();
			sound.isBabyMob = false;
			sound.isGlobal = false;

			// Set the sound event based on the block type
			switch (this.block.getType().identifier) {
				default: {
					sound.event = -1 as LevelSoundEvent;
					break;
				}

				case BlockIdentifier.Chest:
				case BlockIdentifier.TrappedChest: {
					sound.event = LevelSoundEvent.ChestOpen;
					break;
				}
			}

			// Broadcast the block event packet
			this.block.dimension.broadcast(packet, sound);
		}

		// Check if the container has no occupants
		if (this.container.occupants.size === 0 && this.container.opened) {
			// Set the container to closed
			this.container.opened = false;

			// Create a new block event packet
			const packet = new BlockEventPacket();
			packet.position = this.block.position;
			packet.type = BlockEventType.ChangeState;
			packet.data = 0;

			// Create a new level sound event packet
			const sound = new LevelSoundEventPacket();
			sound.position = BlockCoordinates.toVector3f(this.block.position);
			sound.data = this.block.permutation.network;
			sound.actorIdentifier = String();
			sound.isBabyMob = false;
			sound.isGlobal = false;

			// Set the sound event based on the block type
			switch (this.block.getType().identifier) {
				default: {
					sound.event = -1 as LevelSoundEvent;
					break;
				}

				case BlockIdentifier.Chest:
				case BlockIdentifier.TrappedChest: {
					sound.event = LevelSoundEvent.ChestClosed;
					break;
				}
			}

			// Broadcast the block event packet
			this.block.dimension.broadcast(packet, sound);
		}
	}

	public onInteract(player: Player): void {
		// Check if the player is sneaking
		if (!player.isSneaking) {
			// Show the container to the player
			this.container.show(player);
		}
	}

	public onBreak(player?: Player): void {
		// Check if a player is provided
		if (!player) return;

		// Loop through the items in the container
		for (const item of this.container.storage) {
			// Check if the item is valid
			if (!item) continue;

			// Spawn the item in the world
			const { x, y, z } = this.block.position;
			const entity = player.dimension.spawnItem(
				item,
				new Vector3f(x + 0.5, y + 0.5, z + 0.5)
			);

			// Add some upwards velocity to the item.
			entity.setMotion(new Vector3f(0, 0.1, 0));
		}
	}

	public static serialize(
		nbt: CompoundTag,
		component: BlockInventoryComponent
	): void {
		// Create the inventory list tag.
		const inventory = nbt.createListTag("Inventory", Tag.Compound);

		// Iterate of the items in the container.
		for (let index = 0; index < component.container.size; index++) {
			// Get the item stack.
			const itemStack = component.container.getItem(index);

			// Check if the item stack exists.
			if (!itemStack) continue;

			// Serialize the item stack.
			const nbt = ItemStack.serialize(itemStack);
			nbt.createByteTag("Slot", index);

			// Add the item stack to the inventory.
			inventory.push(nbt);
		}
	}

	public static deserialize(
		nbt: CompoundTag,
		block: Block
	): BlockInventoryComponent {
		// Create a new entity inventory component.
		const component = new BlockInventoryComponent(block);

		// Check if the inventory tag exists.
		if (!nbt.hasTag("Inventory")) return component;

		// Get the inventory tag.
		const inventory = nbt.getTag("Inventory") as ListTag<CompoundTag>;

		// Iterate over the inventory items.
		for (const itemTag of inventory.value) {
			// Get the slot of the item.
			const slot = itemTag.getTag("Slot")?.value as number;

			// Deserialize the item stack.
			const itemStack = ItemStack.deserialize(itemTag);

			// Add the item stack to the container.
			component.container.setItem(slot, itemStack);
		}

		// Return the entity inventory component.
		return component;
	}
}

export { BlockInventoryComponent };
