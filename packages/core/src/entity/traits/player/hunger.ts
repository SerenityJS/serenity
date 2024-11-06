import {
  ActorDamageCause,
  Attribute,
  AttributeName,
  Gamemode
} from "@serenityjs/protocol";

import { Player } from "../../player";
import { EntityIdentifier } from "../../../enums";
import { EntityHealthTrait } from "../attribute";

import { PlayerTrait } from "./trait";
import { PlayerExhaustionTrait } from "./exhaustion";
import { PlayerSaturationTrait } from "./saturation";

class PlayerHungerTrait extends PlayerTrait {
  public static readonly identifier = "hunger";
  public static readonly types: Array<EntityIdentifier> = [
    EntityIdentifier.Player
  ];

  private readonly starveableGamemodes = [
    Gamemode.Adventure,
    Gamemode.Survival
  ];

  private exhaustionTrait?: PlayerExhaustionTrait;
  private saturationTrait?: PlayerSaturationTrait;
  private timer: number = 0;

  public onTick(): void {
    if (
      !this.player.isAlive ||
      !this.starveableGamemodes.includes(this.player.gamemode)
    )
      return;
    const playerHealthTrait = this.player.getTrait(EntityHealthTrait);

    this.timer++;

    if (this.timer >= 80) this.timer = 0;
    if (this.timer == 0) {
      if (
        this.food >= 18 &&
        playerHealthTrait.currentValue < playerHealthTrait.effectiveMax
      ) {
        playerHealthTrait.set(playerHealthTrait.currentValue + 1);
        this.exhaust(6);
      } else if (this.food <= 0) {
        playerHealthTrait.applyDamage(1, ActorDamageCause.Starve);
      }
    }
  }

  public onSpawn(): void {
    this.exhaustionTrait = this.entity.getTrait(PlayerExhaustionTrait);
    this.saturationTrait = this.entity.getTrait(PlayerSaturationTrait);

    if (!this.exhaustionTrait || !this.saturationTrait)
      this.player.removeTrait(PlayerHungerTrait);

    if (this.entity.attributes.has(AttributeName.PlayerHunger)) return;
    this.entity.attributes.set(
      AttributeName.PlayerHunger,
      new Attribute(0, 20, 20, 0, 20, 20, AttributeName.PlayerHunger, [])
    );
  }

  public exhaust(amount: number): void {
    if (!this.saturationTrait || !this.exhaustionTrait) return;
    this.exhaustionTrait.exhaustion += amount;

    while (this.exhaustionTrait.exhaustion >= 4) {
      this.exhaustionTrait.exhaustion -= 4;

      if (this.saturationTrait.saturation > 0) {
        this.saturationTrait.saturation = Math.max(
          0,
          this.saturationTrait.saturation - 1
        );
        continue;
      }
      if (this.food > 0) this.food--;
    }
  }

  public get food(): number {
    return this.entity.attributes.get(AttributeName.PlayerHunger)!.current;
  }

  public set food(food: number) {
    this.entity.attributes.get(AttributeName.PlayerHunger)!.current = food;
  }

  public isHungry(): boolean {
    return (
      this.food < this.entity.attributes.get(AttributeName.PlayerHunger)!.max
    );
  }
}

export { PlayerHungerTrait };
