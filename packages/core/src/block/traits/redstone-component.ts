import {
  AbilityIndex,
  UpdateBlockFlagsType,
  UpdateBlockLayerType,
  UpdateBlockPacket
} from "@serenityjs/protocol";

import { BlockInteractionOptions } from "../../types";
import { BlockIdentifier } from "../../enums";

import { BlockTrait } from "./trait";

import type { Block } from "../block";

/**
 * Handles a player clicking a redstone component that they adjust, rather than place a block against.
 * @param block The redstone component.
 * @param options The options of the interaction.
 * @returns Whether the component should be adjusted.
 */
function shouldAdjust(block: Block, options: BlockInteractionOptions): boolean {
  const { origin, cancel } = options;

  // Check if the origin is a player
  if (!origin || !origin.isPlayer()) return false;

  // Players sneaking with a block in hand place it rather than adjust the component
  if (origin.isSneaking && options.placingBlock) return false;

  // Adjusting the component takes the place of placing a block against it
  options.placingBlock = false;

  // Check if the interaction was cancelled, or the player may not use switches
  if (cancel || !origin.abilities.getAbility(AbilityIndex.DoorsAndSwitches)) {
    // Show the player the component as it really is, undoing what the client predicted
    const packet = new UpdateBlockPacket();
    packet.position = block.position;
    packet.networkBlockId = block.permutation.networkId;
    packet.layer = UpdateBlockLayerType.Normal;
    packet.flags = UpdateBlockFlagsType.Network;
    origin.send(packet);

    return false;
  }

  return true;
}

/**
 * Cycles the delay of a repeater between 1 and 4 redstone ticks when a player uses it.
 */
class BlockRepeaterTrait extends BlockTrait {
  public static readonly identifier = "repeater";
  public static readonly types = [
    BlockIdentifier.PoweredRepeater,
    BlockIdentifier.UnpoweredRepeater
  ];

  public onInteract(options: BlockInteractionOptions): void {
    if (!shouldAdjust(this.block, options)) return;

    // Move the delay on to the next one, going back to the first after the last
    const delay = this.block.getState<number>("repeater_delay");
    this.setStates({ repeater_delay: (delay + 1) % 4 });
  }
}

/**
 * Switches a comparator between comparing and subtracting when a player uses it.
 */
class BlockComparatorTrait extends BlockTrait {
  public static readonly identifier = "comparator";
  public static readonly types = [
    BlockIdentifier.PoweredComparator,
    BlockIdentifier.UnpoweredComparator
  ];

  public onInteract(options: BlockInteractionOptions): void {
    if (!shouldAdjust(this.block, options)) return;

    // Switch the mode of the comparator
    const subtract = this.block.getState<boolean>("output_subtract_bit");
    this.setStates({ output_subtract_bit: !subtract });
  }
}

export { BlockRepeaterTrait, BlockComparatorTrait };
