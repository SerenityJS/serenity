import {
  BlockEventPacket,
  BlockEventType,
  BlockPosition,
  LevelSoundEvent,
  LevelSoundEventPacket
} from "@serenityjs/protocol";

import { BlockIdentifier } from "../../enums";

import { BlockInventoryTrait } from "./inventory";

class BlockShulkerBoxTrait extends BlockInventoryTrait {
  public static readonly identifier: string = "shulker_box";
  public static readonly types = [
    BlockIdentifier.UndyedShulkerBox,
    BlockIdentifier.WhiteShulkerBox,
    BlockIdentifier.LightGrayShulkerBox,
    BlockIdentifier.GrayShulkerBox,
    BlockIdentifier.BlackShulkerBox,
    BlockIdentifier.BrownShulkerBox,
    BlockIdentifier.RedShulkerBox,
    BlockIdentifier.OrangeShulkerBox,
    BlockIdentifier.YellowShulkerBox,
    BlockIdentifier.LimeShulkerBox,
    BlockIdentifier.GreenShulkerBox,
    BlockIdentifier.CyanShulkerBox,
    BlockIdentifier.LightBlueShulkerBox,
    BlockIdentifier.BlueShulkerBox,
    BlockIdentifier.PurpleShulkerBox,
    BlockIdentifier.MagentaShulkerBox,
    BlockIdentifier.PinkShulkerBox
  ];

  public onOpen(silent?: boolean): void {
    // Call the super method
    super.onOpen();

    // If silent is true, return
    if (silent) return;

    // Create a new BlockEventPacket
    const event = new BlockEventPacket();
    event.position = this.block.position;
    event.type = BlockEventType.ChangeState;
    event.data = 1;

    // Create a new LevelSoundEventPacket
    const sound = new LevelSoundEventPacket();
    sound.position = BlockPosition.toVector3f(this.block.position);
    sound.event = LevelSoundEvent.ShulkerBoxOpen;
    sound.data = this.block.permutation.networkId;
    sound.actorIdentifier = String();
    sound.isBabyMob = false;
    sound.isGlobal = false;
    sound.uniqueActorId = -1n;

    // Broadcast the packets to the dimension
    this.dimension.broadcast(event, sound);
  }

  public onClose(silent?: boolean): void {
    // Call the super method
    super.onClose();

    // If silent is true, return
    if (silent) return;

    // Create a new BlockEventPacket
    const event = new BlockEventPacket();
    event.position = this.block.position;
    event.type = BlockEventType.ChangeState;
    event.data = 0;

    // Create a new LevelSoundEventPacket
    const sound = new LevelSoundEventPacket();
    sound.position = BlockPosition.toVector3f(this.block.position);
    sound.event = LevelSoundEvent.ShulkerBoxClosed;
    sound.data = this.block.permutation.networkId;
    sound.actorIdentifier = String();
    sound.isBabyMob = false;
    sound.isGlobal = false;
    sound.uniqueActorId = -1n;

    // Broadcast the packets to the dimension
    this.dimension.broadcast(event, sound);
  }
}

export { BlockShulkerBoxTrait };
