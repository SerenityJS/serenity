import { BlockType } from "./type";
import { BlockPermutation } from "./permutation";
import { BlockState } from "./types";

class CustomBlockType extends BlockType {
	/**
	 * Create a new custom block type.
	 * @param identifier The identifier of the block type.
	 * @param loggable Whether the block type is loggable.
	 */
	public constructor(identifier: string, loggable: boolean) {
		super(identifier as keyof BlockState, loggable, 0, 0, "default", false);

		// Register the block type.
		BlockType.types.set(identifier, this);
	}

	/**
	 * Register a block permutation to the block type.
	 * @param permutation The block permutation to register.
	 */
	public register(permutation: BlockPermutation): void {
		this.permutations.push(permutation);
	}

	/**
	 * Get a block type from the registry.
	 * @param identifier The identifier of the block type.
	 */
	public static get<T extends keyof BlockState = keyof BlockState>(
		identifier: string
	): BlockType<T> | null {
		return BlockType.types.get(identifier) as BlockType<T>;
	}

	/**
	 * Get all custom block types from the registry.
	 */
	public static getAll(): Array<CustomBlockType> {
		return [...BlockType.types.values()].filter(
			(type): type is CustomBlockType => type instanceof CustomBlockType
		);
	}
}

export { CustomBlockType };
