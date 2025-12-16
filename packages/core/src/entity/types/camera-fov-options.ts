import { EasingType } from "@serenityjs/protocol";

interface PlayerEaseOptions {
  /**
   * The duration of the easing effect in seconds.
   */
  easeTime?: number;

  /**
   * The type of easing effect to apply.
   */
  easeType?: EasingType;
}

interface PlayerCameraFovOptions {
  /**
   * The easing options for the FOV change.
   */
  easeOptions?: PlayerEaseOptions;

  /**
   * The field of view (FOV) angle in degrees. Typical values range from 30 to 110.
   */
  fov?: number;
}

export { PlayerCameraFovOptions, PlayerEaseOptions };
