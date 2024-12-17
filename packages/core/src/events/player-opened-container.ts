import { Container } from "../container";
import { Player } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class PlayerOpenedContainerSignal extends EventSignal {
  public readonly identifier = WorldEvent.PlayerOpenedContainer;

  /**
   * The player that opened the container.
   */
  public readonly player: Player;

  /**
   * The container that was opened by the player.
   */
  public readonly container: Container;

  /**
   * Create a new player opened container event.
   * @param player The player that opened the container.
   * @param container The container that was opened by the player.
   */
  public constructor(player: Player, container: Container) {
    super(player.world);
    this.player = player;
    this.container = container;
  }
}

export { PlayerOpenedContainerSignal };
