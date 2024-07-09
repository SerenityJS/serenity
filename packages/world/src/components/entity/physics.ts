import { EntityComponent } from "./entity-component";

import type { Entity } from "../../entity";

class EntityPhysicsComponent extends EntityComponent {
	public static readonly identifier = "minecraft:physics";

	/**
	 * The gravity of the entity.
	 */
	public gravity = 0.04;

	/**
	 * Creates a new entity inventory component.
	 *
	 * @param entity The entity of the component.
	 * @param itemStack The item stack of the component.
	 * @returns A new entity inventory component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityPhysicsComponent.identifier);
	}

	public onTick(): void {
		// Check if the entity is on the ground
		if (this.entity.onGround) return;

		// Check how many blocks is between the entity and the nearest ground block
		const { y } = this.entity.position;

		// Round the position of the entity to the nearest whole number
		const position = this.entity.position.floor();

		// We want gravity to be a constant force, which means we dont want the entity to fall faster the further it is from the ground.
		// Calculate the distance between the entity and the nearest ground block
		const distance =
			y - 1 - this.entity.dimension.getTopmostBlock(position).position.y;

		// Check if the distance is greater than 0, if so, apply gravity
		// If the distance is less than 0, the entity is below the ground, so we should teleport the entity to the ground
		// If the distance is equal to 0, the entity is on the ground, so we should stop applying gravity
		if (distance > 0) {
			// Apply gravity to the entity
			this.entity.velocity.y -= this.gravity;

			// Reduce the entity's x and z velocity
			this.entity.velocity.x *= 0.98;
			this.entity.velocity.z *= 0.98;

			// Set the motion of the entity
			this.entity.setMotion(this.entity.velocity);
		} else if (distance < 0) {
			// Add velocity to the entity to move it to the ground
			this.entity.velocity.y = -distance;

			// Set the motion of the entity
			this.entity.setMotion(this.entity.velocity);
		} else {
			// Stop applying gravity to the entity
			this.entity.velocity.y = 0;

			// Reduce the entity's x and z velocity
			this.entity.velocity.x *= 0.25;
			this.entity.velocity.z *= 0.25;
		}

		// Move the entity to the new position
		this.entity.teleport(this.entity.position);

		// Check if the entity's velocity is approching 0
		if (
			Math.abs(this.entity.velocity.x) < 0.000_000_5 &&
			Math.abs(this.entity.velocity.y) < 0.000_000_5 &&
			Math.abs(this.entity.velocity.z) < 0.000_000_5
		) {
			// Set the entity's velocity to 0
			this.entity.velocity.x = 0;
			this.entity.velocity.y = 0;
			this.entity.velocity.z = 0;

			// Set the entity as on the ground
			this.entity.onGround = true;
		}
	}
}

export { EntityPhysicsComponent };
