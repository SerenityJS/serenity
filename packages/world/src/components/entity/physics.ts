import { MoveActorAbsolutePacket } from "@serenityjs/protocol";

import { EntityComponent } from "./entity-component";

import type { Entity } from "../../entity";

class EntityPhysicsComponent extends EntityComponent {
	public static readonly gravity = 1.62 / 20;

	public readonly identifier = "minecraft:physics";

	/**
	 * Creates a new entity inventory component.
	 *
	 * @param entity The entity of the component.
	 * @param itemStack The item stack of the component.
	 * @returns A new entity inventory component.
	 */
	public constructor(entity: Entity) {
		super(entity, "minecraft:physics");
	}

	public onTick(): void {
		// Check how many blocks is between the entity and the nearest ground block
		const { x, y, z } = this.entity.position;

		const distance =
			y -
			1 -
			this.entity.dimension.getTopLevel(
				Math.round(x),
				Math.round(z),
				Math.round(y)
			);

		// If the entity is on the ground, set the velocity to 0
		if (distance <= 0) {
			this.entity.velocity.y = 0;
			return;
		}

		// Calculate the time it takes for the entity to fall to the ground
		const time = Math.sqrt((2 * distance) / EntityPhysicsComponent.gravity);

		// Update the velocity of the entity is the entity is falling
		if (distance > 0) {
			this.entity.velocity.y = -EntityPhysicsComponent.gravity * time;
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
