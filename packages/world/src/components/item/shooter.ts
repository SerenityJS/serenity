import { EntityIdentifier } from "@serenityjs/entity";
import { Vector3f, type ItemUseMethod } from "@serenityjs/protocol";

import { type ItemStack, ItemUseCause, type Player } from "../..";

import { ItemComponent } from "./item-component";

import type { ItemIdentifier, Items } from "@serenityjs/item";

// TODO: Fix the projectile rotation
class ItemShooterComponent<T extends keyof Items> extends ItemComponent<T> {
	public static readonly identifier: string = "minecraft:shooter";

	// The item amounition of this shooter
	public amounition?: ItemIdentifier;

	// The projectile entity to spawn
	public projectile: EntityIdentifier = EntityIdentifier.Arrow;

	// Wetjher or not the power needs to be scaled based on the item use duration
	public scalePowerByDuration: boolean = false;

	// The power scale for the projectile, based on the item use duration
	public powerScale: number = 1;

	// The maximum launch power of the projectile, based on the item use duration
	public maxLaunchPower: number = 1;

	/**
	 * Retrieves the ammunition item stack from the player's inventory.
	 *
	 * @param player - The player whose inventory is being checked for ammunition.
	 * @returns The item stack of the ammunition if found, otherwise undefined.
	 */
	private getAmounition(player: Player): ItemStack | undefined {
		const playerInventory = player.getComponent("minecraft:inventory");

		return playerInventory.container.storage
			.filter((item) => item !== null)
			.find((item) => item.type.identifier == this.amounition);
	}

	public constructor(itemStack: ItemStack<T>) {
		super(itemStack, ItemShooterComponent.identifier);
	}

	/**
	 * Shoots a projectile from the player based on the item use duration and direction.
	 *
	 * @param player - The player who is using the item to shoot the projectile.
	 */
	private shoot(player: Player): void {
		const duration = Number(player.getItemUseDuration()) / 20; // Get the item use duration

		if (duration < 0.1) return; // You can't shoot a projectile if the duration is less than 0.1seconds
		const direction = player.getViewDirection().normalize(); // Normalize the view direction
		const projectile = player.dimension.spawnEntity(
			this.projectile,
			player.position.add(new Vector3f(0, 1, 0)).floor() // Spawn the projectile at the players view Y position
		); // Spawn the projectile entity
		const projectileComponent = projectile.getComponent("minecraft:projectile");

		if (!projectileComponent)
			throw new Error("Shooter projectile is not a projectile");

		const power = Math.min(
			this.maxLaunchPower,
			this.scalePowerByDuration ? duration * this.powerScale : this.powerScale
		); // Compute the projectile power (Speed)
		projectile.rotation.yaw = player.rotation.yaw;
		projectileComponent.owner = player; // Assign the projectile owner
		projectileComponent.shoot(direction.multiply(power)); // Shoot the projectile
	}

	public onUse(): ItemUseMethod | undefined {
		return;
	}

	public onStartUse(): void {}

	public onStopUse(player: Player, cause: ItemUseCause): void {
		if (cause !== ItemUseCause.Use) return;
		const inventory = player.getComponent("minecraft:inventory");

		if (!inventory) throw new Error("Player does not have an inventory");
		const amounition = this.amounition ? this.getAmounition(player) : undefined;

		if (!amounition && this.amounition) return;
		else if (amounition) {
			amounition.amount--; // Decrease the amounition amount
			inventory.container.setItem(
				inventory.container.storage.indexOf(amounition), // Get the amounition item slot
				amounition
			); // Update the amounition item
		}
		this.shoot(player);
	}
}

export { ItemShooterComponent };
