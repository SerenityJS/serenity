import { Container } from "..";
import { Player } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class PlayerClosedContainerSignal extends EventSignal {
  public readonly identifier = WorldEvent.PlayerClosedContainer;

  /**
   * The player that closed the container.
   */
  public readonly player: Player;

  /**
   * The container that was closed by the player.
   */
  public readonly container: Container;

  /**
   * Create a new player closed container event.
   * @param player The player that closed the container.
   * @param container The container that was closed by the player.
   */
  public constructor(player: Player, container: Container) {
    super(player.world);
    this.player = player;
    this.container = container;
  }
}

export { PlayerClosedContainerSignal };
