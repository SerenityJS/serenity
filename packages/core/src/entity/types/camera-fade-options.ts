interface PlayerCameraFadeTimeOptions {
  /**
   * Time in seconds for the fade-in effect.
   */
  fadeInTime?: number;

  /**
   * Time in seconds to hold the fade effect.
   */
  holdTime?: number;

  /**
   * Time in seconds for the fade-out effect.
   */
  fadeOutTime?: number;
}

interface PlayerCameraFadeOptions {
  /**
   * The color the screen will fade to. (RGB values from 0-255)
   */
  fadeColor?: {
    /**
     * The red component of the color (0-255).
     */
    red: number;

    /**
     * The green component of the color (0-255).
     */
    green: number;

    /**
     * The blue component of the color (0-255).
     */
    blue: number;
  };

  /**
   * Time in seconds for the fade-in, hold, and fade-out.
   */
  fadeTime?: PlayerCameraFadeTimeOptions;
}

export { PlayerCameraFadeOptions, PlayerCameraFadeTimeOptions };
