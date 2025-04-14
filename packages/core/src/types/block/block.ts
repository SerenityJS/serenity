import {
  ByteTag,
  CompoundTag,
  IntTag,
  ListTag,
  LongTag,
  StringTag
} from "@serenityjs/nbt";

import { BlockEntry } from "../world";
import { BlockPermutation, ItemDrop } from "../../block";
import { ItemCategory, ItemGroup } from "../../enums";

interface BlockTypeProperties {
  loggable: boolean;
  air: boolean;
  liquid: boolean;
  solid: boolean;
  tags: Array<string>;
  drops: Array<ItemDrop>;
  permutations: Array<BlockPermutation>;
  properties: BlockTypeDefinition;
}

interface CustomBlockProperties extends BlockTypeProperties {
  creativeCategory: ItemCategory;
  creativeGroup: ItemGroup;
}

interface BlockProperties {
  entry?: BlockEntry;
}

interface BlockTypeNbtDefinition {
  components: CompoundTag<unknown>;
  menu_category: CompoundTag<unknown>;
  vanilla_block_data: CompoundTag<unknown>;
  molangVersion: IntTag;
  properties: ListTag<CompoundTag<BlockTypeNbtStateDefinition>>;
  permutations: ListTag<CompoundTag<BlockTypeNbtPermutationDefinition>>;
}

interface BlockTypeNbtStateDefinition {
  name: StringTag;
  enum: ListTag<ByteTag | IntTag | LongTag | StringTag>;
}

interface BlockTypeNbtPermutationDefinition {
  condition: StringTag;
}

type BlockTypeDefinition = CompoundTag<BlockTypeNbtDefinition>;

export {
  BlockProperties,
  CustomBlockProperties,
  BlockTypeProperties,
  BlockTypeNbtDefinition,
  BlockTypeNbtStateDefinition,
  BlockTypeNbtPermutationDefinition,
  BlockTypeDefinition
};
