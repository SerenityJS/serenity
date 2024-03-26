import { BlockIdentifier } from "../enums";
import { ItemType } from "../item";
import { BlockState } from "../types";

import { BlockPermutation } from "./permutation";

/**
 * A block type.
 */
class BlockType {
	/**
	 * A collective map of all block types registered.
	 */
	public static types: Map<string, BlockType> = new Map();

	/**
	 * The version of the block state.
	 */
	public readonly version: number;

	/**
	 * The identifier of the block state.
	 */
	public readonly identifier: BlockIdentifier;

	/**
	 * The permutations of the block state.
	 */
	public readonly permutations: Array<BlockPermutation>;

	/**
	 * The item of the block state.
	 */
	public readonly item: ItemType;

	/**
	 * Creates a new block type.
	 * @param identifier The identifier of the block state.
	 * @param version The version of the block state.
	 * @param item The item of the block state.
	 */
	public constructor(
		identifier: BlockIdentifier,
		version: number,
		item: ItemType
	) {
		this.identifier = identifier;
		this.version = version;
		this.item = item;
		this.permutations = [];
	}

	/**
	 * Gets a permutation of the block type.
	 * If no states are provided, the default permutation is returned.
	 * @param states The states of the permutation.
	 * @returns The permutation.
	 */
	public getPermutation<T = BlockState>(states?: T): BlockPermutation<T> {
		return states
			? BlockPermutation.resolve<T>(this.identifier, states)
			: (this.permutations[0] as BlockPermutation<T>);
	}

	/**
	 * Resolves a block type from the identifier.
	 * @param identifier The identifier of the block type.
	 * @returns The block type.
	 */
	public static resolve(identifier: BlockIdentifier): BlockType {
		return this.types.get(identifier)!;
	}

	/**
	 * Registers a new block type.
	 * @param identifier The identifier of the block type.
	 * @returns The block type.
	 */
	public static register(identifier: string): BlockType {
		// Check if the block type is already in the map.
		if (this.types.has(identifier)) {
			throw new Error(
				`Block type with identifier "${identifier}" already exists.`
			);
		}

		// Find the item type for the block.
		const item = ItemType.types.get(identifier);

		// Check if the item type exists.
		if (!item) {
			throw new Error(
				`Item type with identifier "${identifier}" does not exist.`
			);
		}

		// Create a new block type.
		// We will use -1 version to indicate a custom block type.
		const type = new BlockType(identifier as BlockIdentifier, -1, item);

		// Add the type to the collective map.
		this.types.set(identifier, type);

		// Return the block type.
		return type;
	}
}

export { BlockType };
