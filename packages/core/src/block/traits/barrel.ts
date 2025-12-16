import {
  BlockPosition,
  LevelSoundEvent,
  LevelSoundEventPacket
} from "@serenityjs/protocol";

import { BlockIdentifier } from "../../enums";

import { BlockInventoryTrait } from "./inventory";

class BlockBarrelTrait extends BlockInventoryTrait {
  public static readonly identifier: string = "barrel";
  public static readonly types = [BlockIdentifier.Barrel];

  public onOpen(silent?: boolean): void {
    // Call the super method
    super.onOpen();

    // Set the open_bit state to true
    this.block.setState("open_bit", true);

    // If silent is true, return
    if (silent) return;

    // Create a new LevelSoundEventPacket
    const sound = new LevelSoundEventPacket();
    sound.position = BlockPosition.toVector3f(this.block.position);
    sound.event = LevelSoundEvent.BarrelOpen;
    sound.data = this.block.permutation.networkId;
    sound.actorIdentifier = String();
    sound.isBabyMob = false;
    sound.isGlobal = false;
    sound.uniqueActorId = -1n;

    // Broadcast the packets to the dimension
    this.dimension.broadcast(sound);
  }

  public onClose(silent?: boolean): void {
    // Call the super method
    super.onClose();

    // Set the open_bit state to false
    this.block.setState("open_bit", false);

    // If silent is true, return
    if (silent) return;

    // Create a new LevelSoundEventPacket
    const sound = new LevelSoundEventPacket();
    sound.position = BlockPosition.toVector3f(this.block.position);
    sound.event = LevelSoundEvent.BarrelClose;
    sound.data = this.block.permutation.networkId;
    sound.actorIdentifier = String();
    sound.isBabyMob = false;
    sound.isGlobal = false;
    sound.uniqueActorId = -1n;

    // Broadcast the packets to the dimension
    this.dimension.broadcast(sound);
  }
}

export { BlockBarrelTrait };
