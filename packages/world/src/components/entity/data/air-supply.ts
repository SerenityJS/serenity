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

		// TODO: Add enchantment check
		const enchantmentCheck = true;

		// Check if the entity is a player and if the player is in creative mode or spectator mode
		if (
			this.entity.isPlayer() &&
			(this.entity.gamemode === Gamemode.Creative ||
				this.entity.gamemode === Gamemode.Spectator)
		)
			return;

		const breathing = this.breathing.getCurrentValue();

		// Update the breathing flag if the entity cannot breath
		if (!this.canBreath() && breathing)
			this.breathing.setCurrentValue(false, true);

		// Update the breathing flag if the entity can breath
		if (this.canBreath() && !breathing)
			this.breathing.setCurrentValue(true, true);

		if (!this.canBreath()) {
			// Check if an enchantment is preventing the entity from drowning
			if (!enchantmentCheck) return;

			// Reduce the air supply time
			this.airTicks--;

			// Check if the entity is already drowning
			if (this.airTicks > -20) return;

			// Check if the entity is not alive
			if (!this.entity.isAlive) return;

			// Reset the air supply time
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
			// Increase the air supply time
			this.airTicks += 5;
		}
	}

	/**
	 * Checks if the entity can breath.
	 * @returns True if the entity can breath, false otherwise.
	 */
	public canBreath(): boolean {
		// Check if the entity has breathable effects
		if (
			this.entity.hasEffect(EffectType.WaterBreathing) ||
			this.entity.hasEffect(EffectType.ConduitPower)
		)
			return true;

		// Get the block at the players position
		const block = this.entity.dimension.getBlock(this.entity.position.floor());

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
