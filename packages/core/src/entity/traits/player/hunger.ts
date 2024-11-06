import {
  ActorDamageCause,
  AttributeName,
  Gamemode
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { EntityAttributeTrait, EntityHealthTrait } from "../attribute";
import { Entity } from "../../entity";

import { PlayerExhaustionTrait } from "./exhaustion";
import { PlayerSaturationTrait } from "./saturation";

class PlayerHungerTrait extends EntityAttributeTrait {
  public static readonly identifier = "hunger";
  public static readonly types: Array<EntityIdentifier> = [
    EntityIdentifier.Player
  ];

  private readonly starveableGamemodes = [
    Gamemode.Adventure,
    Gamemode.Survival
  ];

  public readonly effectiveMax: number = 20;
  public readonly effectiveMin: number = 0;
  public readonly defaultValue: number = 20;
  public readonly attribute: AttributeName = AttributeName.PlayerHunger;

  private exhaustionTrait?: PlayerExhaustionTrait;
  private saturationTrait?: PlayerSaturationTrait;
  private timer: number = 0;

  public constructor(entity: Entity) {
    super(entity);
    if (!entity.isPlayer()) entity.removeTrait(PlayerHungerTrait);
  }

  public onTick(): void {
    if (
      !this.entity.isAlive ||
      !this.entity.isPlayer() ||
      !this.starveableGamemodes.includes(this.entity.gamemode)
    )
      return;
    const playerHealthTrait = this.entity.getTrait(EntityHealthTrait);

    this.timer++;

    if (this.timer >= 80) this.timer = 0;
    if (this.timer == 0) {
      if (
        this.currentValue >= 18 &&
        playerHealthTrait.currentValue < playerHealthTrait.effectiveMax
      ) {
        playerHealthTrait.set(playerHealthTrait.currentValue + 1);
        this.exhaust(6);
      } else if (this.currentValue <= 0) {
        playerHealthTrait.applyDamage(1, ActorDamageCause.Starve);
      }
    }
  }

  public onSpawn(): void {
    this.exhaustionTrait = this.entity.getTrait(PlayerExhaustionTrait);
    this.saturationTrait = this.entity.getTrait(PlayerSaturationTrait);

    if (!this.exhaustionTrait || !this.saturationTrait)
      this.entity.removeTrait(PlayerHungerTrait);
  }

  public exhaust(amount: number): void {
    if (!this.saturationTrait || !this.exhaustionTrait) return;
    this.exhaustionTrait.increase(amount);

    while (this.exhaustionTrait.currentValue >= 4) {
      this.exhaustionTrait.decrease(4);

      if (this.saturationTrait.currentValue > 0) {
        this.saturationTrait.set(
          Math.max(0, this.saturationTrait.currentValue - 1)
        );
        continue;
      }
      if (this.currentValue > 0) this.currentValue--;
    }
  }

  public isHungry(): boolean {
    return this.currentValue < this.effectiveMax;
  }
}

export { PlayerHungerTrait };
