import { BlockFace } from "@serenityjs/protocol";

import { BlockIdentifier } from "../../enums";
import { BlockState } from "../types";

import { BlockTrait } from "./trait";

import type { Block } from "../block";

/**
 * The sides of a chorus plant, and the states naming them.
 */
const CHORUS_SIDES: Array<[BlockFace, string]> = [
  [BlockFace.Bottom, "minecraft:connection_down"],
  [BlockFace.Top, "minecraft:connection_up"],
  [BlockFace.North, "minecraft:connection_north"],
  [BlockFace.East, "minecraft:connection_east"],
  [BlockFace.South, "minecraft:connection_south"],
  [BlockFace.West, "minecraft:connection_west"]
];

/**
 * Connects chorus plants to the chorus plants and flowers around them, as vanilla does.
 * Since 1.26.60 the connections are block states the server sets,
 * rather than something the client works out.
 */
class BlockChorusPlantTrait extends BlockTrait {
  public static readonly identifier = "chorus_plant";
  public static readonly types = [BlockIdentifier.ChorusPlant];

  public onUpdate(): void {
    const state: BlockState = {};

    // Check which sides the plant connects to.
    for (const [face, name] of CHORUS_SIDES) {
      const neighbor = this.block.face(face);

      // Chorus plants also connect down to the end stone they grow on.
      state[name] =
        this.isChorus(neighbor) ||
        (face === BlockFace.Bottom &&
          neighbor.identifier === BlockIdentifier.EndStone);
    }

    this.setStates(state);
  }

  /**
   * Whether a block is part of a chorus plant.
   * @param block The block to check.
   */
  protected isChorus(block: Block): boolean {
    return (
      block.identifier === BlockIdentifier.ChorusPlant ||
      block.identifier === BlockIdentifier.ChorusFlower
    );
  }
}

export { BlockChorusPlantTrait };
