import {
  BlockPosition,
  LevelSoundEvent,
  LevelSoundEventPacket
} from "@serenityjs/protocol";

import { BlockInteractionOptions } from "../../types";
// import { PlayerPressedButtonSignal } from "../../events";

import { BlockTrait } from "./trait";

class BlockButtonTrait extends BlockTrait {
  public static readonly identifier = "button";
  public static readonly state = "button_pressed_bit";

  /**
   * The tick at which the button will be released.
   */
  public releaseTick: bigint = -1n;

  public onInteract(options: BlockInteractionOptions): void {
    // Check if the block interaction has been cancelled or if there is no origin
    if (options.cancel || !options.origin) return this.setState(false, true);

    // Check if the origin is sneaking, this will prevent blocks being placed on the button
    if (!options.origin.isSneaking) options.placingBlock = false;

    // Check if the block is currently being pressed
    if (this.releaseTick !== -1n) return;

    // Get the state of the button
    const state = this.getState();

    // Set the state of the button to the opposite of its current state
    this.setState(!state);

    // Add a release tick if the button is pressed
    this.releaseTick = this.block.world.currentTick + 40n;
  }

  public onTick(): void {
    // Check if the button is currently pressed
    if (this.releaseTick === -1n) return;

    // Check if the release tick has passed
    if (this.releaseTick <= this.block.world.currentTick) {
      // Set the button state back to false
      this.setState(false);

      // Reset the release tick
      this.releaseTick = -1n;
    }
  }

  /**
   * Get the current state of the button.
   * @returns The current state of the button (pressed or not).
   */
  public getState(): boolean {
    // Get the current state of the button
    return this.block.getState<boolean>(this.state as string);
  }

  /**
   * Set the state of the button.
   * @param state The desired state of the button (true for pressed, false for not pressed).
   * @param silent If the sound event should be played (default is false).
   */
  public setState(state: boolean, silent = false): void {
    // Set the button state to the specified value
    this.block.setState(this.state as string, state);

    // If silent is true, do not play the sound event
    if (silent) return;

    // Create a sound event packet to play the button click sound
    const packet = new LevelSoundEventPacket();
    packet.data = this.block.permutation.networkId;
    packet.event = state
      ? LevelSoundEvent.ButtonClickOff
      : LevelSoundEvent.ButtonClickOn;
    packet.position = BlockPosition.toVector3f(this.block.position);
    packet.uniqueActorId = -1n;
    packet.actorIdentifier = "";
    packet.isBabyMob = false;
    packet.isGlobal = true;

    // Send the sound event to all players in the dimension
    this.block.dimension.broadcast(packet);
  }
}

export { BlockButtonTrait };
