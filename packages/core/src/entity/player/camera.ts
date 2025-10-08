import {
  CameraFadeDuration,
  CameraFadeInstruction,
  CameraFOVInstruction,
  CameraInstructionsPacket,
  Vector3f
} from "@serenityjs/protocol";

import { PlayerCameraFadeOptions, PlayerCameraFovOptions } from "../types";

import { Player } from "./player";

class PlayerCamera {
  /**
   * The player the camera belongs to.
   */
  private readonly player: Player;

  /**
   * Create a new player camera.
   * @param player The player the camera belongs to.
   */
  public constructor(player: Player) {
    this.player = player;
  }

  /**
   * Set a fade effect on the player's camera.
   * @param options The options for the fade effect.
   */
  public setFade(options?: PlayerCameraFadeOptions): void {
    // Create a new CameraFadeInstruction
    const instruction = new CameraFadeInstruction();

    // Check if fade options were provided
    if (options?.fadeTime) {
      // Create a new CameraFadeDuration with the provided options
      instruction.duration = new CameraFadeDuration(
        options.fadeTime.fadeInTime ?? 0,
        options.fadeTime.holdTime ?? 0,
        options.fadeTime.fadeOutTime ?? 0
      );
    }

    // Check if a fade color was provided
    if (options?.fadeColor) {
      instruction.color = new Vector3f(
        options.fadeColor.red,
        options.fadeColor.green,
        options.fadeColor.blue
      );
    }

    // Create a new CameraInstructionsPacket to send the instruction
    const packet = new CameraInstructionsPacket();
    packet.instruction = { fade: instruction };

    // Send the packet to the player
    this.player.send(packet);
  }

  /**
   * Set the field of view of the player's camera.
   * @param options The options for the FOV change.
   */
  public setFov(options?: PlayerCameraFovOptions): void {
    // Create a new CameraFOVInstruction
    const instruction = new CameraFOVInstruction(
      options?.fov ?? 60,
      options?.easeOptions?.easeTime ?? 0,
      options?.easeOptions?.easeType ?? 0,
      options ? false : true
    );

    // Create a new CameraInstructionsPacket to send the instruction
    const packet = new CameraInstructionsPacket();
    packet.instruction = { fov: instruction };

    // Send the packet to the player
    this.player.send(packet);
  }

  /**
   * Clear all camera effects from the player's camera.
   */
  public clear(): void {
    // Create a new CameraInstructionsPacket to clear all camera effects
    const packet = new CameraInstructionsPacket();
    packet.instruction = { clear: true };

    // Send the packet to the player
    this.player.send(packet);
  }
}

export { PlayerCamera };
