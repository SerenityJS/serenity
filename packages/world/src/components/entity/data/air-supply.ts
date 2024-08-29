import {
	ActorDamageCause,
	ActorDataId,
	ActorDataType,
	EffectType,
	Gamemode
} from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { EntityDataComponent } from "./data";

import type { Entity } from "../../../entity";

class EntityAirSupplyComponent extends EntityDataComponent {
	public static readonly identifier = "minecraft:air_supply";
	public static readonly types = [EntityIdentifier.Player];

	public readonly key = ActorDataId.AirSupply;
	public readonly type = ActorDataType.Short;
	public readonly minValue = 0;
	public maxValue = 300;
	public readonly defaultValue = 300;

	public readonly breathing = this.entity.getComponent("minecraft:breathing");

	public constructor(entity: Entity) {
		super(entity, EntityAirSupplyComponent.identifier);

		this.setCurrentValue(this.defaultValue, false);
	}

	public onTick(): void {
		// Check if the entity is alive.
		// If the entity isn't alive, we will skip the logic.
		if (!this.entity.isAlive) return;

		const enchantmentCheck = true;

		// Check if the entity is a player and if the player is in creative mode
		if (this.entity.isPlayer() && this.entity.gamemode === Gamemode.Creative)
			return;

		// ? Check if the player cannot breath
		if (!this.canBreath()) {
			// Set the entity to not breathing
			this.breathing.setCurrentValue(false, true);

			// TODO: Add Breathing enchantment modifier
			if (!enchantmentCheck) return;
			// ? Reduce the air supply time
			this.airTicks--;

			// ? -20 is when the player starts drowning
			if (this.airTicks > -20) return;
			if (!this.entity.isAlive) return;
			this.airTicks = 0;

			// Get the cause of the damage
			const cause = this.entity.isSwimming
				? ActorDamageCause.Drowning
				: ActorDamageCause.Suffocation;

			this.entity.applyDamage(2, cause);
			return;
		}
		// ? If the player can breath, and the air supply time is less than the max time, recover air time
		if (this.airTicks < this.maxValue) {
			this.airTicks += 5;
			return;
		} else if (this.airTicks >= this.maxValue)
			this.breathing.setCurrentValue(true, true);
	}

	public canBreath(): boolean {
		// Check if the entity has breathable effects
		if (
			this.entity.hasEffect(EffectType.WaterBreathing) ||
			this.entity.hasEffect(EffectType.ConduitPower)
		)
			return true;

		// Get the players position
		const { x, y, z } = this.entity.position.floor();

		// Get the block at the players position
		const block = this.entity.dimension.getBlock(x, y, z);

		// Check if the block is air
		if (block.isAir()) return true;

		// Check if the block is liquid
		if (block.isLiquid()) return false;

		// Return if the block is solid
		return !block.isSolid();
	}

	public get airTicks(): number {
		return this.getCurrentValue() as number;
	}

	public set airTicks(newAirTicks: number) {
		const sync = this.entity.getWorld().currentTick % 10n == 0n;
		this.setCurrentValue(newAirTicks, sync);
	}
}

export { EntityAirSupplyComponent };
