import { EntityComponent } from "./entity-component";

import type { Entity } from "../../entity";

class EntityPhysicsComponent extends EntityComponent {
	public static readonly identifier = "minecraft:physics";

	/**
	 * The gravity of the entity.
	 */
	public gravity = 0.03;

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
		// North = -z, South = +z, East = +x, West = -x

		const hasGravity = this.entity.hasComponent("minecraft:has_gravity");

		const dimension = this.entity.dimension;

		const velocity = this.entity.velocity;
		const position = this.entity.position;

		const hitboxWidth = 0.15;
		const hitboxHeight = 0.15;

		if (velocity.y !== 0) {
			const negate = velocity.y < 0 ? -1 : 1;

			// Get the block in the direction the entity is moving
			const bx = Math.floor(position.x - hitboxWidth);
			const by = Math.floor(position.y + velocity.y + hitboxHeight * negate);
			const bz = Math.floor(position.z - hitboxWidth);
			const block = dimension.getBlock({ x: bx, y: by, z: bz });

			// Check if the block is solid or if the velocity is approaching 0
			if (block.isSolid() || Math.abs(velocity.y) < 0.01) {
				this.entity.velocity.y = 0;
			} else {
				// Get the friction of the block below the entity
				const below = dimension.getBlock({ x: bx, y: by - 1, z: bz });

				// Apply gravity to the entity
				this.entity.velocity.y *= hasGravity
					? 1 - this.gravity
					: below.getType().friction;

				// Update the entity's position
				this.entity.position.y += velocity.y;
			}

			// Teleport the entity to the new position
			this.entity.teleport(this.entity.position);
		}

		// Check if the entity is moving north
		if (velocity.z !== 0) {
			const negate = velocity.z < 0 ? -1 : 1;

			// Get the block in the direction the entity is moving
			const bx = Math.floor(position.x + hitboxWidth);
			const by = Math.floor(position.y + hitboxHeight);
			const bz = Math.floor(position.z + velocity.z + hitboxWidth * negate);
			const block = dimension.getBlock({ x: bx, y: by, z: bz });

			// Check if the block is solid or if the velocity is approaching 0
			if (block.isSolid()) {
				// Set the entity's velocity to 0
				this.entity.velocity.z = 0;

				// Slighly push the entity in the opposite direction
				this.entity.velocity.z += 0.16 * -negate;
			} else if (Math.abs(velocity.z) < 0.01) {
				// Set the entity's velocity to 0
				this.entity.velocity.z = 0;
			} else {
				// Get the friction of the block below the entity
				const below = dimension.getBlock({
					x: Math.floor(position.x),
					y: Math.floor(position.y + hitboxHeight),
					z: Math.floor(position.z)
				});

				// Get the friction of the block below the entity
				const friction = below.getType().friction;

				// Apply gravity to the entity
				this.entity.velocity.z *= friction;

				// Update the entity's position
				this.entity.position.z += velocity.z;
			}

			// Teleport the entity to the new position
			this.entity.teleport(this.entity.position);
		}

		// Check if the entity is moving east
		if (velocity.x !== 0) {
			const negate = velocity.x < 0 ? -1 : 1;

			// Get the block in the direction the entity is moving
			const bx = Math.floor(position.x + velocity.x + hitboxWidth * negate);
			const by = Math.floor(position.y + hitboxHeight);
			const bz = Math.floor(position.z + hitboxWidth);
			const block = dimension.getBlock({ x: bx, y: by, z: bz });

			// Check if the block is solid or if the velocity is approaching 0
			if (block.isSolid()) {
				// Set the entity's velocity to 0
				this.entity.velocity.x = 0;

				// Slighly push the entity in the opposite direction
				this.entity.velocity.x += 0.16 * -negate;
			} else if (Math.abs(velocity.x) < 0.01) {
				// Set the entity's velocity to 0
				this.entity.velocity.x = 0;
			} else {
				// Get the friction of the block below the entity
				const below = dimension.getBlock({
					x: Math.floor(position.x),
					y: Math.floor(position.y + hitboxHeight),
					z: Math.floor(position.z)
				});

				// Get the friction of the block below the entity
				const friction = below.getType().friction;

				// Apply gravity to the entity
				this.entity.velocity.x *= friction;

				// Update the entity's position
				this.entity.position.x += velocity.x;
			}

			// Teleport the entity to the new position
			this.entity.teleport(this.entity.position);
		}

		if (hasGravity) {
			// Get the block below the entity
			const below = dimension.getBlock({
				x: Math.floor(position.x),
				y: Math.round(position.y + hitboxHeight - 1),
				z: Math.floor(position.z)
			});

			// Check if the block below the entity is solid
			if (below.isSolid()) {
				// Apply gravity to the entity
				this.entity.velocity.y = 0;

				// Apply friction to the entity
				if (this.entity.velocity.z !== 0)
					this.entity.velocity.z *= below.getType().friction;

				// Apply friction to the entity
				if (this.entity.velocity.x !== 0)
					this.entity.velocity.x *= below.getType().friction;

				// Set the entity to on ground
				this.entity.onGround = true;
			} else {
				// Apply gravity to the entity
				this.entity.velocity.y -= this.gravity;

				// Set the entity to not on ground
				this.entity.onGround = false;

				this.entity.teleport(this.entity.position);
			}
		}
	}
}

export { EntityPhysicsComponent };
