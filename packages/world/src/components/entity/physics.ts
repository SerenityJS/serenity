import { MoveActorAbsolutePacket, Vector3f } from "@serenityjs/protocol";

import { EntityComponent } from "./entity-component";

import type { Entity } from "../../entity";

class EntityPhysicsComponent extends EntityComponent {
	public static readonly gravity = 0.001_25;

	public static readonly identifier = "minecraft:physics";

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
		// Check how many blocks is between the entity and the nearest ground block
		const { y } = this.entity.position;

		// Calculate the distance between the entity and the nearest ground block
		const distance =
			y -
			1 -
			this.entity.dimension.getTopmostBlock(this.entity.position.floor())
				.location.y;

		// Check if the entity is falling
		// And check if the entity is in a block, if so add a small velocity to make the entity move up
		if (distance > 0) {
			// Calculate the time it takes for the entity to fall to the ground
			const time = Math.sqrt((2 * distance) / EntityPhysicsComponent.gravity);

			// Update the velocity of the entity is the entity is falling
			// While including any previous velocity
			const velocity = new Vector3f(
				this.entity.velocity.x,
				-EntityPhysicsComponent.gravity * time + this.entity.velocity.y,
				this.entity.velocity.z
			);

			this.entity.setMotion(velocity);
		} else if (distance < 0) {
			// Check if the entity is in a block
			// If so, move the entity up
			const velocity = new Vector3f(
				this.entity.velocity.x,
				0,
				this.entity.velocity.z
			);

			// Set the position to a whole number to avoid bouncing
			this.entity.position.y = this.entity.position.y + Math.abs(distance);

			// Reset the y velocity
			this.entity.setMotion(velocity);
		} else {
			// Reset total velocity
			const velocity = new Vector3f(0, 0, 0);
			this.entity.setMotion(velocity);

			// Return do to the entity being on the ground
			return;
		}

		// Update the entity position
		this.entity.position.x = this.entity.position.x + this.entity.velocity.x;
		this.entity.position.y = this.entity.position.y + this.entity.velocity.y;
		this.entity.position.z = this.entity.position.z + this.entity.velocity.z;

		// Create a new MoveActorAbsolutePacket
		const packet = new MoveActorAbsolutePacket();

		// Set the properties of the packet
		packet.runtimeId = this.entity.runtime;
		packet.flags = 1;
		packet.position = this.entity.position;
		packet.rotation = this.entity.rotation;

		// Broadcast the packet
		this.entity.dimension.broadcast(packet);
	}
}

export { EntityPhysicsComponent };
