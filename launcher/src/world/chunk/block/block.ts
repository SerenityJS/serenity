import type { BlockCoordinates } from "@serenityjs/protocol";
import type { BlockComponents } from "../../../types";
import type { Dimension } from "../../dimension";
import type { BlockPermutation } from "./permutation";
import type { BlockComponent } from "./components";

/**
 * Represents a block in the world.
 */
class Block {
	/**
	 * The dimension the block is in.
	 */
	public readonly dimension: Dimension;

	/**
	 * If the block is air.
	 */
	public readonly isAir: boolean;

	/**
	 * If the block is liquid.
	 */
	public readonly isLiquid: boolean;

	/**
	 * The permutation of the block.
	 */
	public readonly permutation: BlockPermutation;

	/**
	 * The location of the block.
	 */
	public readonly location: BlockCoordinates;

	/**
	 * The components of the block.
	 */
	public readonly components: Map<string, BlockComponent>;

	/**
	 * Represents a block in the world.
	 *
	 * @param dimension The dimension the block is in.
	 * @param permutation The permutation of the block.
	 * @param location The location of the block.
	 */
	public constructor(
		dimension: Dimension,
		permutation: BlockPermutation,
		location: BlockCoordinates
	) {
		this.dimension = dimension;
		this.isAir = permutation.type.identifier === "minecraft:air";
		this.isLiquid =
			permutation.type.identifier === "minecraft:water" ||
			permutation.type.identifier === "minecraft:lava";
		this.permutation = permutation;
		this.location = location;
		this.components = new Map();
	}

	/**
	 * Gets the component of the block.
	 *
	 * @param type The type of the component.
	 * @returns The component of the block.
	 */
	public getComponent<T extends keyof BlockComponents>(
		type: T
	): BlockComponents[T] {
		return this.components.get(type) as BlockComponents[T];
	}

	/**
	 * Sets the component of the block.
	 *
	 * @param component The component to set.
	 */
	public setComponent<T extends keyof BlockComponents>(
		component: BlockComponents[T]
	): void {
		// @ts-ignore
		this.components.set(component.type, component);
	}

	/**
	 * Gets the block above this block.
	 *
	 * @param steps The amount of steps to go up.
	 */
	public above(steps?: number): Block {
		return this.dimension.getBlock(
			this.location.x,
			this.location.y + (steps ?? 1),
			this.location.z
		);
	}

	/**
	 * Gets the block below this block.
	 *
	 * @param steps The amount of steps to go down.
	 */
	public below(steps?: number): Block {
		return this.dimension.getBlock(
			this.location.x,
			this.location.y - (steps ?? 1),
			this.location.z
		);
	}

	/**
	 * Gets the block to the north of this block.
	 *
	 * @param steps The amount of steps to go north.
	 */
	public north(steps?: number): Block {
		return this.dimension.getBlock(
			this.location.x,
			this.location.y,
			this.location.z + (steps ?? 1)
		);
	}

	/**
	 * Gets the block to the south of this block.
	 *
	 * @param steps The amount of steps to go south.
	 */
	public south(steps?: number): Block {
		return this.dimension.getBlock(
			this.location.x,
			this.location.y,
			this.location.z - (steps ?? 1)
		);
	}

	/**
	 * Gets the block to the east of this block.
	 *
	 * @param steps The amount of steps to go east.
	 */
	public east(steps?: number): Block {
		return this.dimension.getBlock(
			this.location.x + (steps ?? 1),
			this.location.y,
			this.location.z
		);
	}

	/**
	 * Gets the block to the west of this block.
	 *
	 * @param steps The amount of steps to go west.
	 */
	public west(steps?: number): Block {
		return this.dimension.getBlock(
			this.location.x - (steps ?? 1),
			this.location.y,
			this.location.z
		);
	}

	/**
	 * Sets the permutation of the block.
	 *
	 * @param permutation The permutation to set.
	 */
	public setPermutation(permutation: BlockPermutation): void {
		this.dimension.setPermutation(
			this.location.x,
			this.location.y,
			this.location.z,
			permutation
		);
	}

	/**
	 * Destroys the block.
	 */
	public destroy(): void {
		// Get the air permutation.
		const air = this.dimension.world.blocks.resolvePermutation("minecraft:air");

		// Set the block permutation to air.
		this.dimension.setPermutation(
			this.location.x,
			this.location.y,
			this.location.z,
			air
		);
	}
}

export { Block };
