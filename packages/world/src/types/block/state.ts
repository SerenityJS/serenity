import { ByteTag, CompoundTag, IntTag, StringTag } from "@serenityjs/nbt";

import { BlockIdentifier } from "../../enums";

type BlockState<T = string | number> = Record<string, T>;

/**
 * A block state as a NBT value.
 */
interface CanonicalStateNBT {
	/**
	 * The name of the block state.
	 */
	name: StringTag;

	/**
	 * The states of the block state.
	 */
	states: CompoundTag<StringTag | ByteTag>;

	/**
	 * The version of the block state.
	 */
	version: IntTag;
}

/**
 * A block state as an object.
 */
interface CanonicalState {
	/**
	 * The name of the block state.
	 */
	name: BlockIdentifier;

	/**
	 * The states of the block state.
	 */
	states: BlockState;

	/**
	 * The version of the block state.
	 */
	version: number;
}

export { CanonicalStateNBT, CanonicalState, BlockState };
