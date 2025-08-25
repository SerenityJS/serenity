import { Player } from "../player";

interface PlayerAnimationOptions {
  /**
   * The time it takes to blend out of the animation.
   */
  blendOutTime?: number;

  /**
   * The name of the animation controller to use for this animation.
   */
  controller?: string;

  /**
   * The next state to transition to after the animation is complete.
   */
  nextState?: string;

  /**
   * The stop expression, the condition that determines when to transition to the next state.
   */
  stopExpression?: string;

  /**
   * The players that the animation will be visible to.
   */
  players?: Array<Player>;
}

export { PlayerAnimationOptions };
