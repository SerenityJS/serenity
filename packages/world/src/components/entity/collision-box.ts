import { Vector3f } from "@serenityjs/protocol";

import { AABB } from "../../collisions";

import { EntityComponent } from "./entity-component";

import type { EntityHitResult } from "../../types";
import type { Entity } from "../../entity";

class EntityCollisionBoxComponent extends EntityComponent {
	public static readonly identifier: string = "minecraft:collision_box";

	/**
	 * Constructs an EntityCollisionBoxComponent for a given entity.
	 *
	 * @param entity - The entity to which this component belongs.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityCollisionBoxComponent.identifier);
	}

	/**
	 * Retrieves the collision box of the entity.
	 *
	 * The collision box is calculated using the width and height of the entity.
	 * It assumes the entity's collision box is centered at the origin.
	 *
	 * @return The AABB representing the collision box of the entity.
	 */
	public get collisionBox(): AABB {
		const widthComponent = this.entity.getComponent(
			"minecraft:boundingbox_width"
		);
		const heightComponent = this.entity.getComponent(
			"minecraft:boundingbox_height"
		);

		const width = widthComponent.getCurrentValue() as number;
		const height = heightComponent.getCurrentValue() as number;
		const halfWidth = width / 2;

		// Define the AABB using the width and height of the entity.
		return new AABB(
			new Vector3f(-halfWidth, 0, -halfWidth),
			new Vector3f(halfWidth, height, halfWidth)
		);
	}

	/**
	 * Checks for an intersection between the ray and the entity's collision box.
	 *
	 * @param start - The starting point of the ray (Vector3f).
	 * @param end - The ending point of the ray (Vector3f).
	 * @return An EntityHitResult if an intersection is found; otherwise, undefined.
	 */
	public intercept(
		start: Vector3f,
		end: Vector3f
	): EntityHitResult | undefined {
		// Calculate the collision box moved to the entity's position and expanded slightly.
		const movedBox = this.collisionBox.move(this.entity.position).grow(0.3);

		// Check for intersection between the ray and the moved collision box.
		const result = AABB.Intercept(movedBox, start, end);

		if (!result) return undefined;

		// Return the intersection result with the entity information included.
		return { ...result, entity: this.entity };
	}
}

export { EntityCollisionBoxComponent };
