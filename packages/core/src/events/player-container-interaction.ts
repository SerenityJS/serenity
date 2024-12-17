import { Container, WorldEvent } from "..";
import { Player } from "../entity";

import { EventSignal } from "./event-signal";

class PlayerContainerInteractionSignal extends EventSignal {
  public static readonly identifier = WorldEvent.PlayerContainerInteraction;

  /**
   * The player that interacted with a container.
   */
  public readonly player: Player;

  /**
   * The source container that the player interacted with.
   */
  public readonly sourceContainer: Container;

  /**
   * The slot in the source container that the player interacted with.
   */
  public readonly sourceSlot: number;

  /**
   * The destination container that the player interacted with.
   */
  public readonly destinationContainer: Container | null;

  /**
   * The slot in the destination container that the player interacted with.
   */
  public readonly destinationSlot: number | null;

  /**
   * The amount of items that were selected.
   */
  public readonly amount: number;

  /**
   * Creates a new player container interaction signal.
   * @param player The player that interacted with a container.
   * @param sourceContainer The source container that the player interacted with.
   * @param sourceSlot The slot in the source container that the player interacted with.
   * @param destinationContainer The destination container that the player interacted with.
   * @param destinationSlot The slot in the destination container that the player interacted with.
   * @param amount The amount of items that were selected.
   */
  public constructor(
    player: Player,
    sourceContainer: Container,
    sourceSlot: number,
    destinationContainer: Container | null,
    destinationSlot: number | null,
    amount: number
  ) {
    super(player.world);
    this.player = player;
    this.sourceContainer = sourceContainer;
    this.sourceSlot = sourceSlot;
    this.destinationContainer = destinationContainer;
    this.destinationSlot = destinationSlot;
    this.amount = amount;
  }
}

export { PlayerContainerInteractionSignal };
