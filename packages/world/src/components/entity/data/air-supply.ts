import {
	ActorDamageCause,
	ActorDataId,
	ActorDataType,
	EffectType,
	Gamemode
} from "@serenityjs/protocol";
import { BlockIdentifier } from "@serenityjs/block";
import { EntityIdentifier } from "@serenityjs/entity";

import { EntityDataComponent } from "./data";

import type { Entity } from "../../../entity";

class EntityAirSupplyComponent extends EntityDataComponent {
	public static readonly identifier = "minecraft:air_supply";
	public static readonly types: Array<EntityIdentifier> = [
		EntityIdentifier.Player
	];

	public readonly key = ActorDataId.AirSupply;
	public readonly type = ActorDataType.Short;
	public readonly minValue = 0;
	public maxValue = 300;
	public readonly defaultValue = 300;

	public constructor(entity: Entity) {
		super(entity, EntityAirSupplyComponent.identifier);

		this.setCurrentValue(this.defaultValue, false);
	}

	public onTick(): void {
		const enchantmentCheck = true;
		const entityBreathingComponent = this.entity.getComponent(
			"minecraft:breathing"
		);

		if (this.entity.isPlayer() && this.entity.gamemode == Gamemode.Creative)
			return;
		// ? Check if the player cannot breath
		if (!this.canBreath()) {
			entityBreathingComponent.setCurrentValue(false, true);

			// TODO: Add Breathing enchantment modifier
			if (!enchantmentCheck) return;
			// ? Reduce the air supply time
			this.airTicks--;

			// ? -20 is when the player starts drowning
			if (this.airTicks > -20) return;
			if (!this.entity.isAlive) return;
			this.airTicks = 0;

			this.entity.applyDamage(2, ActorDamageCause.Drowning);
			return;
		}
		// ? If the player can breath, and the air supply time is less than the max time, recover air time
		if (this.airTicks < this.maxValue) {
			this.airTicks += 5;
			return;
		} else if (this.airTicks >= this.maxValue)
			entityBreathingComponent.setCurrentValue(true, true);
	}

	public canBreath(): boolean {
		const breathingEffects = [
			EffectType.WaterBreathing,
			EffectType.ConduitPower
		];
		const { x, y, z } = this.entity.position.floor();

		// ? Check if the player has any respiration effect, or if the block on his head is other than air (Temporal, check for block collisions)
		return (
			breathingEffects.some((effect) => this.entity.hasEffect(effect)) ||
			this.entity.dimension.getBlock(x, y, z).getType().identifier ==
				BlockIdentifier.Air
		);
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
