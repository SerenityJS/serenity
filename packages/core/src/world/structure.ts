import { CompoundTag, IntTag, ListTag } from "@serenityjs/nbt";

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

  public static toCompound(structure: Structure): CompoundTag {
    // Create a new compound tag as the root.
    const compound = new CompoundTag();

    // Set the format version.
    compound.set("format_version", new IntTag(1));

    // Set the size of the structure.
    compound.set(
      "size",
      new ListTag<IntTag>([
        new IntTag(structure.size[0]),
        new IntTag(structure.size[1]),
        new IntTag(structure.size[2])
      ])
    );

    // Create the structure tag.
    const structureTag = compound.add(new CompoundTag("structure"));

    // Create a new indices tag for the structure.
    const blockIndices = structureTag.add(
      new ListTag<ListTag<IntTag>>([], "block_indices")
    );

    // Map the blocks to the indices.
    blockIndices[0] = new ListTag<IntTag>(
      structure.blocks.map((value) => new IntTag(value))
    );

    // Create an empty entities tag for the structure.
    blockIndices[1] = new ListTag<IntTag>([]);

    // Create the palette tag for the structure.
    const paletteTag = structureTag.add(new CompoundTag("palette"));

    // Create the default palette tag.
    const defaultTag = paletteTag.add(new CompoundTag("default"));

    // Create the block palette tag.
    const blockPalette = defaultTag.add(
      new ListTag<CompoundTag>([], "block_palette")
    );

    // Map the palette to the block palette.
    for (const networkId of structure.palette) {
      // Get the permutation for the network ID.
      const permutation = BlockPermutation.resolve(networkId);

      // Convert the permutation to NBT and add it to the block palette.
      const nbt = BlockPermutation.toNbt(permutation);

      // Push the NBT to the block palette.
      blockPalette.push(nbt);
    }

    // Return the compound tag.
    return compound;
  }
}

export { Structure, StructureData };
