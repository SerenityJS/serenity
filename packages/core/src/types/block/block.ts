import { BlockFace, Vector3f } from "@serenityjs/protocol";

import { BlockEntry } from "../world";
import { BlockPermutation, ItemDrop } from "../../block";
import { ItemCategory, ItemGroup } from "../../enums";

interface BlockTypeProperties {
  loggable: boolean;
  air: boolean;
  liquid: boolean;
  solid: boolean;
  components: Array<string>;
  tags: Array<string>;
  drops: Array<ItemDrop>;
  permutations: Array<BlockPermutation>;
}

interface CustomBlockProperties extends BlockTypeProperties {
  creativeCategory: ItemCategory;
  creativeGroup: ItemGroup;
}

interface BlockProperties {
  entry?: BlockEntry;
}

interface BlockInteractionOptions {
  clickPosition: Vector3f;
  face: BlockFace;
}

export {
  BlockProperties,
  CustomBlockProperties,
  BlockInteractionOptions,
  BlockTypeProperties
};
