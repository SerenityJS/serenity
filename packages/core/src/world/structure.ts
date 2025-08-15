import { CompoundTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../block";
import { BlockIdentifier } from "../enums";

import { World } from "./world";
import { BlockStorage } from "./chunk";

interface StructureData {
  format_version: number;
  size: [number, number, number];
  structure: {
    block_indices: [Array<number>, Array<number>];
    entities: Array<unknown>;
    palette: {
      default: {
        block_palette: Array<{
          name: BlockIdentifier;
          states: Record<string, string | number | boolean>;
          version: number;
        }>;
      };
    };
  };
}

interface StructureOptions {
  size: [number, number, number];
  palette: Array<BlockPermutation>;
  blocks: Array<number>;
}

class Structure extends BlockStorage {
  public readonly size: [number, number, number] = [0, 0, 0];

  public constructor(options?: Partial<StructureOptions>) {
    // Get the size from options or default to [0, 0, 0].
    const size = options?.size || [0, 0, 0];

    // Call the parent constructor with the calculated size.
    super(undefined, undefined, size);

    this.size = size;
  }

  public static from(world: World, compound: CompoundTag): Structure {
    const object = compound.toJSON() as unknown as StructureData;

    const size = object.size;

    const structure = new this({ size });

    for (const [index, block] of object.structure.block_indices[0].entries()) {
      const def = object.structure.palette.default.block_palette[block];

      if (!def) continue;

      const permutation = world.blockPalette.resolvePermutation(
        def?.name,
        def?.states
      );

      structure.blocks[index] = block;
      structure.palette[block] = permutation.networkId;
    }

    return structure;
  }
}

export { Structure, StructureData };
