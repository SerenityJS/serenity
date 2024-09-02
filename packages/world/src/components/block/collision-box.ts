import { BlockCoordinates, Vector3f } from "@serenityjs/protocol";
import { BlockIdentifier } from "@serenityjs/block";

import { AABB } from "../../collisions";

import { BlockComponent } from "./block-component";

import type { BlockHitResult, HitResult } from "../../types";
import type { Block } from "../../block";

class BlockCollisionComponent extends BlockComponent {
	public static readonly identifier: string = "minecraft:collision_box";

	// List of collision boxes associated with this block.
	public readonly boxes: Array<AABB>;

	public static readonly types: Array<BlockIdentifier> =
		Object.values(BlockIdentifier);

	/**
	 * Constructor for the BlockCollisionComponent.
	 * Initializes the component with a default collision box.
	 *
	 * @param block - The block to associate with this component.
	 */
	public constructor(block: Block) {
		super(block, BlockCollisionComponent.identifier);

		// Initialize with a default solid collision box if the block is not air
		this.boxes = [];
		if (!block.isSolid()) this.addCollision(BlockCollisionComponent.Solid);
	}

	/**
	 * Checks if a line segment intersects with any of the collision boxes.
	 * Returns the closest hit result if an intersection is found.
	 *
	 * @param start - The starting point of the line segment.
	 * @param end - The ending point of the line segment.
	 * @return The closest BlockHitResult if an intersection is found; otherwise, undefined.
	 */
	public intercept(start: Vector3f, end: Vector3f): BlockHitResult | undefined {
		let closestHit: HitResult | undefined;
		let closestDistance = Number.MAX_VALUE;

		// Iterate through each collision box and check for intersections.
		for (const box of this.boxes) {
			// Move the box to the block's position and check for intersections.
			const movedBox = box.move(
				BlockCoordinates.toVector3f(this.block.position)
			);
			const result = AABB.Intercept(movedBox, start, end);

			// Continue if no intersection is found.
			if (!result) continue;

			// Calculate the distance from the start to the hit point.
			const resultDistance = result.position.subtract(start).lengthSqrt();

			// Update the closest hit result if this intersection is closer.
			if (resultDistance > closestDistance) continue;
			closestDistance = resultDistance;
			closestHit = result;
		}

		// Return the closest hit result, including the block's position.
		if (!closestHit) return;
		return {
			...closestHit,
			blockPosition: this.block.position,
			distance: closestDistance
		};
	}

	/**
	 * Adds a new collision box to the list of collision boxes.
	 *
	 * @param box - The collision box to add.
	 */
	public addCollision(box: AABB): void {
		// Add the box if it's not already included.
		if (!this.boxes.includes(box)) {
			this.boxes.push(box);
		}
	}

	/**
	 * Removes a collision box from the list based on its index.
	 *
	 * @param index - The index of the collision box to remove.
	 */
	public removeCollision(index: number): void {
		// Ensure the index is valid before attempting to remove.
		if (index >= 0 && index < this.boxes.length) {
			this.boxes.splice(index, 1);
		}
	}

	/**
	 * Clears all collision boxes from the list.
	 */
	public clearCollisions(): void {
		this.boxes.length = 0; // Clear all elements from the array.
	}

	/**
	 * Sets the list of collision boxes, replacing any existing ones.
	 *
	 * @param collisions - The new list of collision boxes.
	 */
	public setCollisions(collisions: Array<AABB>): void {
		this.clearCollisions();
		this.boxes.push(...collisions);
	}

	/**
	 * Provides a default solid collision box with unit dimensions.
	 *
	 * @return The default solid collision box.
	 */
	public static get Solid(): AABB {
		return new AABB(new Vector3f(0, 0, 0), new Vector3f(1, 1, 1));
	}
}

export { BlockCollisionComponent };
