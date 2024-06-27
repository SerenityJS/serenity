import {
	ActorEventIds,
	ActorEventPacket,
	AttributeName,
	Gamemode,
	ItemUseOnEntityInventoryTransactionType,
	Vector3f
} from "@serenityjs/protocol";

import { EntityAttributeComponent } from "./attribute";

import type { Player } from "../../../player";
import type { Entity } from "../../../entity";

class EntityHealthComponent extends EntityAttributeComponent {
	/**
	 * The identifier of the component.
	 */
	public static readonly identifier = AttributeName.Health;

	/**
	 * The minimum health allowed for the entity.
	 */
	public readonly effectiveMin = 0;

	/**
	 * The maximum health allowed for the entity.
	 */
	public readonly effectiveMax = 20;

	/**
	 * The default health for the entity.
	 */
	public readonly defaultValue = 20;

	/**
	 * Creates a new entity health component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity health component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityHealthComponent.identifier);

		// Set the default health for the entity
		this.setCurrentValue(this.defaultValue, false);
	}

	/**
	 * Damages the entity with an attacker.
	 * @param attacker The entity that is attacking the entity.
	 * @returns The current health of the entity.
	 */
	public damage(attacker: Entity): number {
		// TODO: Handle the damage based on the attacker
		// item used, potion effect, arrow, tnt explosion, etc.

		// Declare the base damage
		let damage = 0.5;

		// TODO: This is a temporary implementation, we should replace this with a proper damage calculation.
		const item = attacker.getComponent("minecraft:inventory").getHeldItem();
		const sword = item ? item.type.identifier.includes("sword") : false;

		if (sword) damage += 1.25;

		// Create a new actor event packet
		const packet = new ActorEventPacket();

		// Assign the values to the packet
		packet.actorRuntimeId = this.entity.runtime;
		packet.eventId = ActorEventIds.HURT_ANIMATION;
		packet.eventData = -1;

		// Broadcast the packet to the dimension
		this.entity.dimension.broadcast(packet);

		// Decrease the health of the entity
		this.decreaseValue(damage);

		// Return the current health of the entity
		return this.getCurrentValue();
	}

	public onInteract(
		player: Player,
		type: ItemUseOnEntityInventoryTransactionType
	): void {
		// Check if the player is attacking the entity
		if (type !== ItemUseOnEntityInventoryTransactionType.Attack) return;

		// Check if the entity is a player and the player is in creative mode
		if (this.entity.isPlayer() && this.entity.gamemode === Gamemode.Creative)
			return;

		// We want to apply knockback to the entity when it is attacked, based on the direction the player is facing.
		// Get the direction the player is facing
		const { headYaw, pitch } = player.rotation;

		// Normalize the pitch & headYaw, so the entity will be spawned in the correct direction
		const headYawRad = (headYaw * Math.PI) / 180;
		const pitchRad = (pitch * Math.PI) / 180;

		// Calculate the velocity of the entity based on the player's rotation
		// NOTE: These numbers are not official/vanilla values, these seem to work similar to the vanilla values.
		// If we can get the official values, we should replace these with the official values.
		const x = (-Math.sin(headYawRad) * Math.cos(pitchRad)) / 3.75;
		const y = 0.2;
		const z = (Math.cos(headYawRad) * Math.cos(pitchRad)) / 3.75;

		// Set the velocity of the entity
		this.entity.setMotion(new Vector3f(x, y, z));

		// Damage the entity
		const health = this.damage(player);

		// Check if the entity is dead
		if (health <= 0) {
			// Kill the entity
			this.entity.kill();
		}
	}

	public onTick(): void {
		if (!this.entity.isPlayer()) return;

		// Check if the player is in creative mode & the health is at the maximum value
		if (
			this.entity.gamemode === Gamemode.Creative ||
			this.getCurrentValue() === this.effectiveMax
		)
			return;

		// Check if the current tick is a multiple of 80 (4 seconds)
		if (this.entity.dimension.world.currentTick % 80n !== 0n) return;

		// Increase the health of the entity
		this.increaseValue(1);
	}
}

export { EntityHealthComponent };
