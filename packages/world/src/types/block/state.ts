import type { ByteTag, CompoundTag, StringTag } from "@serenityjs/nbt";

/**
 * A block state.
 */
type BlockState<T = string | number> = Record<string, T>;

/**
 * A block state as a NBT value.
 */
type BlockStateNBT = CompoundTag<StringTag<string> | ByteTag<number>>;

export { BlockStateNBT, BlockState };
