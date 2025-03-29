import { Vector3f } from "@serenityjs/protocol";

import { Player } from "../../entity";
import { EntityIdentifier, ItemIdentifier } from "../../enums";

import { ItemTrait } from "./trait";

class ItemShooterTrait<T extends ItemIdentifier> extends ItemTrait<T> {
  public static readonly identifier = "shooter";
  public static readonly types = [ItemIdentifier.Bow, ItemIdentifier.Crossbow];

  /**
   * The world tick when the item was charged.
   */
  public chargeTick: bigint = -1n;

  public async onRelease(player: Player): Promise<void> {
    // Calculate the power based on the current world tick and the charge tick
    const power = Number(player.dimension.world.currentTick - this.chargeTick);

    await player.sendMessage(`Power: ${power}`);

    // Reset the charge tick to -1 when the item is released
    this.chargeTick = -1n;

    // Check if the power is less than 1 tick
    if (power <= 1) return;

    const { x, y, z } = player.position;
    const { headYaw, pitch } = player.rotation;

    const headYawRad = (headYaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;

    const dx = -Math.sin(headYawRad) * Math.cos(pitchRad);
    const dy = -Math.sin(pitchRad) / 2; // Adjusted for better trajectory
    const dz = Math.cos(headYawRad) * Math.cos(pitchRad);

    const entity = await player.dimension.spawnEntity(
      EntityIdentifier.Arrow,
      new Vector3f(x, y + 0.75, z) // Spawn slightly above the player
    );

    return entity.setMotion(
      new Vector3f((dx * power) / 3, (dy * power) / 3, (dz * power) / 3)
    );
  }

  public onStartUse(player: Player): void {
    // Set the charge tick to the current world tick when the item is used
    if (this.chargeTick === -1n) {
      this.chargeTick = player.dimension.world.currentTick;
    }
  }
}

export { ItemShooterTrait };
