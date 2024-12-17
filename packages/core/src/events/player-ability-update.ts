import { AbilityIndex } from "@serenityjs/protocol";

import { Player } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class PlayerAbilityUpdateSignal extends EventSignal {
  public static readonly identifier = WorldEvent.PlayerAbilityUpdate;

  /**
   * The player in which the ability was updated.
   */
  public readonly player: Player;

  /**
   * The ability that was updated.
   */
  public readonly ability: AbilityIndex;

  /**
   * The new value of the ability.
   */
  public value: boolean;

  /**
   * Create a new player ability update event.
   * @param player The player in which the ability was updated.
   * @param ability The ability that was updated.
   * @param value The new value of the ability.
   */
  public constructor(player: Player, ability: AbilityIndex, value: boolean) {
    super(player.world);
    this.player = player;
    this.ability = ability;
    this.value = value;
  }
}

export { PlayerAbilityUpdateSignal };
