import {
	EquipmentSlot,
	ItemUseMethod,
	LevelSoundEvent,
	LevelSoundEventPacket
} from "@serenityjs/protocol";

import { ItemUseCause } from "../../enums";

import { ItemComponent } from "./item-component";

import type { Player } from "../../player";
import type { Items } from "@serenityjs/item";
import type { ItemStack } from "../../item";

class ItemArmorComponent<T extends keyof Items> extends ItemComponent<T> {
	public static readonly identifier = "minecraft:armor";

	/**
	 * Creates a new item durability component.
	 *
	 * @param item The item the component is binded to.
	 * @returns A new item durability component.
	 */
	public constructor(item: ItemStack<T>) {
		super(item, ItemArmorComponent.identifier);
	}

	/**
	 * Applies the item to the armor slot
	 * @param player The player that used the item.
	 * @param cause The cause of the item use.
	 */
	public onUse(player: Player, cause: ItemUseCause): ItemUseMethod | undefined {
		if (!player.usingItem || cause !== ItemUseCause.Use) return;
		// Get both the armor inventory and inventory
		const playerArmorComponent = player.getComponent("minecraft:armor");
		const playerInventoryComponent = player.getComponent("minecraft:inventory");
		// Resolve the used item equipment slot
		const itemEquipmentSlot = this.resolveEquipmentSlot(player.usingItem);

		// Return if cant resolve the item equipment slot
		if (itemEquipmentSlot == undefined) return;
		const sound = new LevelSoundEventPacket();
		sound.event = LevelSoundEvent.EquipGeneric;
		sound.position = player.position;
		sound.actorIdentifier = player.type.identifier;
		sound.data = -1;
		sound.isBabyMob = false;
		sound.isGlobal = false;

		player.session.send(sound);
		// If there is amor equipped, do swap logic
		if (playerArmorComponent.getEquipment(itemEquipmentSlot)) {
			// Get the equiped Item
			const equipedItem = playerArmorComponent.getEquipment(itemEquipmentSlot);

			playerArmorComponent.setEquipment(itemEquipmentSlot, player.usingItem);
			playerInventoryComponent.container.setItem(
				playerInventoryComponent.selectedSlot,
				equipedItem as ItemStack
			);
			return ItemUseMethod.EquipArmor;
		}
		// Clear the selected slot, and set the used item into the players armor inventory
		playerInventoryComponent.container.clearSlot(
			playerInventoryComponent.selectedSlot
		);
		playerArmorComponent.setEquipment(itemEquipmentSlot, player.usingItem);

		return ItemUseMethod.EquipArmor;
	}

	// TODO: Clean up function
	protected resolveEquipmentSlot(
		itemStack: ItemStack
	): EquipmentSlot | undefined {
		if (!itemStack) return;
		const suffixToSlotMap: Record<string, EquipmentSlot> = {
			_helmet: EquipmentSlot.Head,
			_chestplate: EquipmentSlot.Chest,
			_leggings: EquipmentSlot.Legs,
			_boots: EquipmentSlot.Feet
		};

		return Object.entries(suffixToSlotMap).find(([suffix]) =>
			itemStack.type.identifier.endsWith(suffix)
		)?.[1];
	}
}

export { ItemArmorComponent };
