import { Block } from "../block";
import { Player } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class PlayerEditSignSignal extends EventSignal {
  public static readonly identifier = WorldEvent.PlayerEditSign;

  /**
   * The player that is editing the sign.
   */
  public readonly player: Player;

  /**
   * The block of the sign being edited.
   */
  public readonly block: Block;

  /**
   * The front text of the sign.
   */
  public frontText: string;

  /**
   * The back text of the sign.
   */
  public backText: string;

  /**
   * Creates a new instance of the PlayerEditSignSignal class.
   * @param player The player that is editing the sign.
   * @param block The block of the sign being edited.
   * @param frontText The front text of the sign.
   * @param backText The back text of the sign.
   */
  public constructor(
    player: Player,
    block: Block,
    frontText?: string,
    backText?: string
  ) {
    // Call the super constructor
    super(block.dimension.world);

    // Assign the properties
    this.player = player;
    this.block = block;
    this.frontText = frontText ?? "";
    this.backText = backText ?? "";
  }
}

export { PlayerEditSignSignal };
