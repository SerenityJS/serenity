import { BlockCoordinates, Vector3f } from "@serenityjs/protocol";

import type { Entity } from "../entity";
import type { AABB } from "./aabb";
import type { HitResult } from "../types";
import type { Dimension } from "../world";

class Raycaster {
	/**
	 * Checks for intersections between a ray defined by start and end points
	 * and the collision boxes of blocks in the specified dimension.
	 *
	 * @param dimension - The dimension to check for block collisions.
	 * @param start - The starting point of the ray (Vector3f).
	 * @param end - The ending point of the ray (Vector3f).
	 * @param box - The bounding box to consider for entity collision checks.
	 * @param condition - Optional function to filter entities based on a condition.
	 * @return The HitResult if an intersection is found; otherwise, undefined.
	 */
	public static clip(
		dimension: Dimension,
		start: Vector3f,
		end: Vector3f,
		box?: AABB,
		condition?: (entity: Entity) => boolean
	): HitResult | undefined {
		let hit: HitResult | undefined;

		// Check for intersections with blocks along the ray.
		Raycaster.transverseBlocks(start, end, (position) => {
			const block = dimension.getBlock(position);
			const blockCollisions = block.getComponent("minecraft:collision_box");

			// Skip blocks without collision components.
			if (!blockCollisions) return false;

			// Check for intersection with the block's collision boxes.
			const result = blockCollisions.intercept(start, end);
			if (!result) return false;

			// Store the hit result if an intersection is found.
			hit = result;
			return true; // Stop traversing further blocks.
		});

		// If there is not entity box, we cant check if the entity collides with other entities
		if (!box) return hit;

		// Calculate the bounding box of the ray.
		let distance = Number.MAX_VALUE;
		const translatedBox = box.move(start).expand(end.subtract(start));

		// Check for intersections with entities within the expanded bounding box.
		const entitiesWithin = dimension
			.getEntities()
			.filter((entity) => translatedBox.grow(8).within(entity.position));

		for (const entity of entitiesWithin) {
			if (condition && condition(entity)) continue;

			const entityCollisions = entity.getComponent("minecraft:collision_box");
			const entityBox = entityCollisions?.collisionBox;

			if (!entityBox) continue;
			if (!entityBox.move(entity.position).intersectsWith(translatedBox))
				continue;

			const hitResult = entityCollisions.intercept(start, end);
			if (!hitResult) continue;

			// Update the closest hit result based on distance.
			const hitDistance = start.subtract(hitResult.position).lengthSqrt();
			if (hitDistance >= distance) continue;

			distance = hitDistance;
			hit = hitResult;
		}

		return hit; // Return the closest hit result found.
	}

	/**
	 * Traverses blocks along a line segment defined by start and end vectors.
	 * Applies a given condition function to each block and stops if the condition is met.
	 *
	 * @param start - The starting point of the line segment (Vector3f).
	 * @param end - The ending point of the line segment (Vector3f).
	 * @param condition - A function that takes BlockCoordinates and returns a boolean,
	 *                    defining the condition to stop traversing when met.
	 */
	public static transverseBlocks(
		start: Vector3f,
		end: Vector3f,
		condition: (position: BlockCoordinates) => boolean
	): void {
		if (start.equals(end)) return; // No traversal needed if start and end are the same.

		const direction = end.subtract(start);
		const { x, y, z } = start.floor();
		const blockPosition = new BlockCoordinates(x, y, z);

		// Check if the initial block position meets the condition.
		if (condition(blockPosition)) return;

		// Determine the step sizes for each axis.
		const step = Raycaster.sign(direction);
		const stepSize = new Vector3f(
			step.x === 0 ? Number.MAX_VALUE : step.x / direction.x,
			step.y === 0 ? Number.MAX_VALUE : step.y / direction.y,
			step.z === 0 ? Number.MAX_VALUE : step.z / direction.z
		);

		// Calculate the initial tMax values for each axis.
		const tMax = new Vector3f(
			stepSize.x *
				(step.x > 0
					? 1 - Raycaster.boundary(direction.x)
					: Raycaster.boundary(direction.x)),
			stepSize.y *
				(step.y > 0
					? 1 - Raycaster.boundary(direction.y)
					: Raycaster.boundary(direction.y)),
			stepSize.z *
				(step.z > 0
					? 1 - Raycaster.boundary(direction.z)
					: Raycaster.boundary(direction.z))
		);

		// Traverse blocks until the end of the line segment or the condition is met.
		while (tMax.x <= 1 || tMax.y <= 1 || tMax.z <= 1) {
			// Determine the axis to step along based on the smallest tMax value.
			if (tMax.x < tMax.y && tMax.x < tMax.z) {
				blockPosition.x += step.x;
				tMax.x += stepSize.x;
			} else if (tMax.y < tMax.z) {
				blockPosition.y += step.y;
				tMax.y += stepSize.y;
			} else {
				blockPosition.z += step.z;
				tMax.z += stepSize.z;
			}

			// Check if the current block position meets the condition.
			if (condition(blockPosition)) break;
		}
	}

	/**
	 * Returns a Vector3f containing the sign of each component of the given vector.
	 *
	 * @param vec - The vector to get the sign from.
	 * @return A new Vector3f with the sign of each component.
	 */
	public static sign(vec: Vector3f): Vector3f {
		return new Vector3f(Math.sign(vec.x), Math.sign(vec.y), Math.sign(vec.z));
	}

	/**
	 * Calculates the distance from the given number to the next lower integer (boundary).
	 *
	 * @param number - The number to calculate the boundary for.
	 * @return The distance from the number to the nearest lower integer.
	 */
	public static boundary(number: number): number {
		return Math.floor(number) - number; // Returns the distance to the nearest lower integer.
	}
}

export { Raycaster };
