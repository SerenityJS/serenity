import {
  ActorDamageCause,
  ActorDataId,
  ActorDataType,
  ActorFlag,
  DataItem,
  EffectType,
  Gamemode
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";

import { EntityTrait } from "./trait";
import { EntityHealthTrait } from "./attribute";

class EntityAirSupplyTrait extends EntityTrait {
  public static readonly identifier = "air_supply";

  public static readonly types = [EntityIdentifier.Player];

  public onTick(): void {
    // Check if the entity is not alive or is not breathing.
    if (!this.entity.isAlive || !this.entity.flags.get(ActorFlag.Breathing))
      return;

    if (
      this.entity.isPlayer() &&
      this.entity.gamemode != Gamemode.Survival &&
      this.entity.gamemode != Gamemode.Adventure
    )
      return;

    // Get the current air ticks of the entity.
    const currentAirTicks = this.getAirSupplyTicks();
    if (!this.canBreathe()) {
      // The air supply is reduced by 1 tick.
      // If the entity air supply reaches -20, it starts drowning

      this.setAirSupplyTicks(currentAirTicks - 1);
      if (currentAirTicks > -20) return;
      // Reset the air supply to 0.
      this.setAirSupplyTicks(0);

      // Check if the entity has a health trait.
      // If the entity has a health trait, apply damage to the entity.
      if (!this.entity.hasTrait(EntityHealthTrait)) return;

      // Get the health trait of the entity.
      const health = this.entity.getTrait(EntityHealthTrait);

      // Apply damage to the entity based on the entity's current state.
      health.applyDamage(
        0.5,
        undefined,
        this.entity.isSwimming
          ? ActorDamageCause.Drowning
          : ActorDamageCause.Suffocation
      );
    }

    // If the entity air supply is full then return.
    if (currentAirTicks >= 300) return;
    this.setAirSupplyTicks(currentAirTicks + 5);
    // The entity can breathe, so we need to increment the air supply.
  }

  private canBreathe(): boolean {
    const blockAtHead = this.entity.dimension.getBlock(
      this.entity.position.floor()
    );

    return (
      (!blockAtHead.isLiquid && !blockAtHead.isSolid) ||
      this.entity.hasEffect(EffectType.WaterBreathing)
    );
  }

  public onSpawn(): void {
    // Check if the entity has a metadata flag value for gravity
    if (!this.entity.flags.has(ActorFlag.Breathing)) {
      // Set the entity flag for gravity
      this.entity.flags.set(ActorFlag.Breathing, true);
    }

    if (!this.entity.metadata.has(ActorDataId.AirSupply)) {
      // Set the default air supply value
      this.setAirSupplyTicks(300);
    }
  }

  public getAirSupplyTicks(): number {
    const airSupplyData = this.entity.metadata.get(ActorDataId.AirSupply);

    if (airSupplyData) {
      return airSupplyData.value as number;
    }

    return 0;
  }

  public setAirSupplyTicks(ticks: number): void {
    // Create the air supply data item.
    const airSupplyData = new DataItem(
      ActorDataId.AirSupply,
      ActorDataType.Short,
      ticks
    );

    // Update the current air supply data
    this.entity.metadata.set(ActorDataId.AirSupply, airSupplyData);
  }
}

export { EntityAirSupplyTrait };
