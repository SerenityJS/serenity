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
  components: CompoundTag;
  menu_category: CompoundTag;
  vanilla_block_data: CompoundTag;
  molangVersion: IntTag;
  properties: ListTag<CompoundTag>;
  permutations: ListTag<CompoundTag>;
}

interface BlockTypeNbtStateDefinition {
  name: StringTag;
  enum: ListTag<ByteTag | IntTag | LongTag | StringTag>;
}

interface BlockTypeNbtPermutationDefinition {
  condition: StringTag;
}

type BlockTypeDefinition = CompoundTag;

export {
  BlockProperties,
  CustomBlockProperties,
  BlockTypeProperties,
  BlockTypeNbtDefinition,
  BlockTypeNbtStateDefinition,
  BlockTypeNbtPermutationDefinition,
  BlockTypeDefinition
};
