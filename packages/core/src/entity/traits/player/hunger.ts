import {
  ActorDamageCause,
  AttributeName,
  Gamemode
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { EntityAttributeTrait, EntityHealthTrait } from "../attribute";
import { Player } from "../../player";

class PlayerHungerTrait extends EntityAttributeTrait {
  public static readonly identifier = "hunger";
  public static readonly types = [EntityIdentifier.Player];

  public readonly player: Player;
  public readonly attribute = AttributeName.PlayerHunger;

  public saturation = 10;
  public exhaustion = 0;

  public constructor(player: Player) {
    super(player);
    this.player = player;
  }

  public onAdd(): void {
    // Call the super method
    super.onAdd({
      minimumValue: 0,
      maximumValue: 20,
      defaultValue: 20,
      currentValue: 20
    });
  }

  public onTick(): void {
    // Check if the player is alive
    if (!this.player.isAlive) return;

    // Get the gamemode of the player
    const gamemode = this.player.gamemode;

    // Check if the player is in spectator or creative mode
    if (gamemode === Gamemode.Spectator || gamemode === Gamemode.Creative)
      return;

    // Get the health trait of the player
    const health = this.player.getTrait(EntityHealthTrait);

    // Check if the player is sprinting or swimming
    if (this.player.isSprinting) this.exhaustion += 0.1;
    if (this.player.isSwimming) this.exhaustion += 0.125;

    // Check if the player is exhausted
    if (this.exhaustion >= 5) {
      // Reset the exhaustion value
      this.exhaustion -= 5;

      // Check if the saturation is greater than 0
      if (this.saturation > 0) {
        // Decrease the saturation value
        this.saturation--;
      } else if (this.currentValue > 0) {
        // Decrease the hunger value
        this.currentValue--;
      }
    }

    // Get the current tick of the world
    const currentTick = this.player.world.currentTick;

    // Check if the player is not exhausted and the current tick is divisible by 30
    if (this.currentValue > 17 && currentTick % 30n === 0n) {
      // Check if the health is less than the maximum value
      if (health.currentValue < 20) {
        // Increase the health value
        health.currentValue++;
      }
    } else if (this.currentValue === 0 && currentTick % 30n === 0n) {
      // Apply damage to the player
      health.applyDamage(1, this.player, ActorDamageCause.Starve);
    }
  }

  public onJump(): void {
    // Check if the player is alive
    if (!this.player.isAlive) return;

    // Increase the exhaustion value
    this.exhaustion += 0.2;

    // Check if the player is sprinting
    if (this.player.isSprinting) this.exhaustion += 0.5;
  }

  public reset(): void {
    // Reset the current value of the attribute to the default value
    this.currentValue = this.defaultValue;
    this.saturation = 10;
    this.exhaustion = 0;
  }
}

export { PlayerHungerTrait };
