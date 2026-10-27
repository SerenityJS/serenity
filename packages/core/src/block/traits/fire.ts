import { BlockFace } from "@serenityjs/protocol";

import { BlockIdentifier } from "../../enums";
import { BlockState } from "../types";

import { BlockConnectionTrait } from "./connection";
import { BlockTrait } from "./trait";

import type { Block } from "../block";

/**
 * The sides of fire that can cling to a block, and the states naming them.
 */
const FIRE_SIDES: Array<[BlockFace, string]> = [
  [BlockFace.North, "minecraft:connection_north"],
  [BlockFace.East, "minecraft:connection_east"],
  [BlockFace.South, "minecraft:connection_south"],
  [BlockFace.West, "minecraft:connection_west"],
  [BlockFace.Top, "minecraft:connection_up"]
];

/**
 * Wooden blocks that burn. Crimson and warped wood does not.
 */
const FLAMMABLE_WOOD =
  /^minecraft:(stripped_)?(oak|spruce|birch|jungle|acacia|dark_oak|mangrove|cherry|pale_oak|poplar|bamboo)_(planks|slab|double_slab|stairs|fence|fence_gate|log|wood|block|mosaic|mosaic_slab|mosaic_double_slab|mosaic_stairs)$/;

/**
 * Other blocks that burn.
 */
const FLAMMABLE_BLOCKS = new Set<string>(
  [
    "fence_gate",
    "bookshelf",
    "chiseled_bookshelf",
    "lectern",
    "composter",
    "beehive",
    "bee_nest",
    "scaffolding",
    "bamboo",
    "tnt",
    "target",
    "coal_block",
    "hay_block",
    "dried_kelp_block",
    "vine",
    "glow_lichen",
    "cave_vines",
    "cave_vines_body_with_berries",
    "cave_vines_head_with_berries",
    "moss_block",
    "moss_carpet",
    "pale_moss_block",
    "pale_moss_carpet",
    "pale_hanging_moss",
    "azalea",
    "flowering_azalea",
    "mangrove_roots",
    "hanging_roots",
    "spore_blossom",
    "big_dripleaf",
    "small_dripleaf_block",
    "short_grass",
    "tall_grass",
    "fern",
    "large_fern",
    "deadbush",
    "bush",
    "firefly_bush",
    "short_dry_grass",
    "tall_dry_grass",
    "leaf_litter",
    "sweet_berry_bush",
    "pink_petals",
    "wildflowers",
    "dandelion",
    "golden_dandelion",
    "poppy",
    "blue_orchid",
    "allium",
    "azure_bluet",
    "red_tulip",
    "orange_tulip",
    "white_tulip",
    "pink_tulip",
    "oxeye_daisy",
    "cornflower",
    "lily_of_the_valley",
    "wither_rose",
    "torchflower",
    "sunflower",
    "lilac",
    "rose_bush",
    "peony",
    "pitcher_plant",
    "open_eyeblossom",
    "closed_eyeblossom",
    "cactus_flower"
  ].map((name) => `minecraft:${name}`)
);

/**
 * Makes fire cling to the flammable blocks around it, as vanilla does.
 * Since 1.26.60 the sides fire burns on are block states the server sets,
 * rather than something the client works out.
 */
class BlockFireTrait extends BlockTrait {
  public static readonly identifier = "fire";
  public static readonly types = [BlockIdentifier.Fire];

  public onUpdate(): void {
    // Fire on a floor it can stand on, or that burns, does not cling to anything.
    const below = this.block.below();
    const onFloor =
      BlockConnectionTrait.isFaceSturdy(below, BlockFace.Top) ||
      BlockFireTrait.isFlammable(below);

    // Otherwise it clings to every flammable block next to it, and above it.
    const state: BlockState = {};
    for (const [face, name] of FIRE_SIDES)
      state[name] =
        !onFloor && BlockFireTrait.isFlammable(this.block.face(face));

    this.setStates(state);
  }

  /**
   * Whether a block burns.
   * @param block The block to check.
   */
  public static isFlammable(block: Block): boolean {
    const { identifier } = block;

    return (
      FLAMMABLE_WOOD.test(identifier) ||
      FLAMMABLE_BLOCKS.has(identifier) ||
      /_(leaves|leaves_flowered|wool|carpet)$/.test(identifier)
    );
  }
}

export { BlockFireTrait };
