import {
	ActorDamageCause,
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

	public onInteract(
		player: Player,
		type: ItemUseOnEntityInventoryTransactionType
	): void {
		/**
		 * TODO: Calculate the damage based on the player, projectile , etc.
		 */
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

		this.entity.applyDamage(2, ActorDamageCause.EntityAttack);
	}

	public onTick(): void {}
}

export { EntityHealthComponent };
