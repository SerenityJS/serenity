import { JSONLikeObject } from "../json";

interface PlayerCombatComponent extends JSONLikeObject {
  /**
   * The maximum reach of the player horizontally.
   */
  horizontalMaxReach: number;

  /**
   * The maximum reach of the player vertically.
   */
  verticalMaxReach: number;

  /**
   * The horizontal knockback of the player.
   */
  horizontalKnockback: number;

  /**
   * The vertical knockback of the player.
   */
  verticalKnockback: number;

  /**
   * The amount of ticks till the player can attack again.
   */
  combatCooldown: number;
}

export { PlayerCombatComponent };
