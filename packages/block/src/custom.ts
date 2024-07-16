import { CompoundTag } from "@serenityjs/nbt";

import { BlockType } from "./type";
import { BlockPermutation } from "./permutation";
import { BlockState } from "./types";

/**
 * CustomBlockType allows developers to create and register custom blocks to SerenityJS. Custom blocks can also be registered with permutations, which allows developers to create multiple variations of a block.
 * 
 * **Example Usage**
 * ```typescript
	import { CustomBlockType, BlockPermutation } from "@serenityjs/block"

	// Creates a custom block type with the identifier "serenity:ruby_block"
	// Second parameter is indicates if the block can be waterlogged
	const rubyBlockType = new CustomBlockType("serenity:ruby_block", false)

	// Create a permutation for the block type
	// Blank object indicates that the block has no additional permutations
	const rubyBlockPermutation = BlockPermutation.create(rubyBlockType, {})

	// The permutation now must be registered with the block type
	rubyBlockType.register(rubyBlockPermutation)
 * ```
 */
class CustomBlockType extends BlockType {
	/**
	 * Whether the block type is custom.
	 */
	public readonly custom = true;

	/**
	 * The NBT data of the custom block.
	 */
	public readonly nbt: CompoundTag<unknown>;

	/**
	 * Create a new custom block type.
	 * @param identifier The identifier of the block type.
	 * @param loggable Whether the block type is loggable.
	 */
	public constructor(identifier: string, loggable: boolean) {
		super(identifier as keyof BlockState, loggable, false, false, true);

		// Construct the NBT tag.
		this.nbt = new CompoundTag("", {});

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
	): BlockType<T> {
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
