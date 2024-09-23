import { EntityIdentifier } from "@serenityjs/entity";
import { BlockIdentifier, type BlockPermutation } from "@serenityjs/block";

import { EntityComponent } from "./entity-component";
import { EntityPhysicsComponent } from "./physics";
import { EntityHasGravityComponent } from "./flag";
import { EntityVariantComponent } from "./data";

import type { Block } from "../../block";
import type { Entity } from "../../entity";

class EntityFallingBlockComponent extends EntityComponent {
	public static readonly identifier = "minecraft:falling_block";

	public static readonly types = [EntityIdentifier.FallingBlock];

	/**
	 * The block permutation of the falling block.
	 */
	public permutation: BlockPermutation = this.entity
		.getWorld()
		.blocks.resolvePermutation(BlockIdentifier.Air);

	public constructor(entity: Entity) {
		super(entity, EntityFallingBlockComponent.identifier);

		// Add the physics component to the entity
		new EntityPhysicsComponent(entity);

		// Add the has gravity component to the entity
		new EntityHasGravityComponent(entity);

		// Add the variant component to the entity
		new EntityVariantComponent(entity);
	}

	public onTick(): void {
		// Check if the entity is on the ground
		if (!this.entity.onGround) return;

		// Get the block position
		const position = this.entity.position.floor();

		// Get the block at the position
		const block = this.entity.dimension.getBlock(position);

		// Try to place the falling block
		this.tryPlace(block);
	}

	/**
	 * Sets the permutation of the falling block.
	 * @param permutation The permutation to set.
	 */
	public setPermutation(permutation: BlockPermutation): void {
		// Update the entity's permutation
		this.permutation = permutation;

		// Update the entity's variant
		const variant = this.entity.getComponent("minecraft:variant");

		// Set the current value of the variant to the permutation's network value
		variant.setCurrentValue(this.permutation.network);
	}

	/**
	 * Tries to place the falling block at the given block.
	 * @param block The block to place the falling block at.
	 */
	protected tryPlace(block: Block): void {
		// Check if the block is air
		if (block.isAir()) {
			// Set the block at the position to the falling block
			block.setPermutation(this.permutation);

			// Destroy the falling block entity
			return this.entity.despawn();
		} else {
			// Check if the block is a falling block
			return this.tryPlace(block.above());
		}
	}
}

export { EntityFallingBlockComponent };
