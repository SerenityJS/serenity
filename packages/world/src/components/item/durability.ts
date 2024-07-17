import { IntTag } from "@serenityjs/nbt";
import { LevelSoundEvent, LevelSoundEventPacket } from "@serenityjs/protocol";

import { ItemUseCause } from "../../enums";

import { ItemComponent } from "./item-component";

import type { Player } from "../../player";
import type { Items } from "@serenityjs/item";
import type { ItemStack } from "../../item";

class ItemDurabilityComponent<T extends keyof Items> extends ItemComponent<T> {
	public static readonly identifier = "minecraft:durability";

	public readonly maxDurability: number = 1561;

	public durability: number = 0;

	/**
	 * Creates a new item durability component.
	 *
	 * @param item The item the component is binded to.
	 * @returns A new item durability component.
	 */
	public constructor(item: ItemStack<T>) {
		super(item, ItemDurabilityComponent.identifier);
	}

	/**
	 * Sets the current value of the durability.
	 * @param value The value to set.
	 */
	public setCurrentValue(value: number): void {
		// Set the current value.
		this.durability = value;

		// Update the stacks nbt.
		// Check if a display tag exists.
		if (!this.item.nbt.hasTag("Damage")) this.item.nbt.removeTag("Damage");

		// Set the new damage tag.
		const damageTag = new IntTag("Damage", value);

		// Add the damage tag to the item.
		this.item.nbt.addTag(damageTag);

		// Update the item in the container.
		this.item.update();
	}

	/**
	 * Applies the durability to the item when used.
	 * @param player The player that used the item.
	 * @param cause The cause of the item use.
	 */
	public onUse(player: Player, cause: ItemUseCause): boolean {
		// Check if the durability is at the max.
		if (this.durability >= this.maxDurability) {
			// Set the amount of the item stack.
			this.item.setAmount(this.item.amount - 1);

			// Create a new level event packet.
			const sound = new LevelSoundEventPacket();
			sound.event = LevelSoundEvent.Break;
			sound.position = player.position;
			sound.actorIdentifier = this.item.type.identifier;
			sound.data = -1;
			sound.isBabyMob = false;
			sound.isGlobal = false;

			// Broadcast the sound to the player's dimension.
			player.dimension.broadcast(sound);

			return true;
		}

		// Check if the item was used to break a block.
		if (cause === ItemUseCause.Break) {
			// Apply the durability to the item.
			this.setCurrentValue(this.durability + 1);
		}

		return false;
	}
}

export { ItemDurabilityComponent };
