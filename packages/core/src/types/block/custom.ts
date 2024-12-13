import {
  ByteTag,
  CompoundTag,
  IntTag,
  ListTag,
  LongTag,
  StringTag
} from "@serenityjs/nbt";

interface CustomBlockProperty {
  name: StringTag;
  enum: ListTag<ByteTag | IntTag | LongTag | StringTag>;
}

interface CustomBlockPermutation {
  condition: StringTag;
}

interface CustomBlockTypeVanillaNbt {
  components: CompoundTag<unknown>;
  menu_category: CompoundTag<unknown>;
  vanilla_block_data: CompoundTag<unknown>;
  molangVersion: IntTag;
  properties: ListTag<CompoundTag<CustomBlockProperty>>;
  permutations: ListTag<CompoundTag<CustomBlockPermutation>>;
}

export {
  CustomBlockTypeVanillaNbt,
  CustomBlockProperty,
  CustomBlockPermutation
};
