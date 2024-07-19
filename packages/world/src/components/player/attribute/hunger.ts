import {
	ActorDamageCause,
	ActorEventIds,
	ActorEventPacket,
	AttributeName,
	Gamemode
} from "@serenityjs/protocol";

import { EntityAttributeComponent } from "../../entity/attribute/attribute";

import type { PlayerSaturationComponent } from "./saturation";
import type { PlayerExhaustionComponent } from "./exhaustion";
import type { Player } from "../../../player";

class PlayerHungerComponent extends EntityAttributeComponent {
	public static readonly identifier = AttributeName.PlayerHunger;

	public readonly effectiveMin: number = 0;
	public readonly effectiveMax: number = 20;
	public readonly defaultValue: number = 20;
	private tickTimer: number = 0;
	private saturationComponent: PlayerSaturationComponent;
	private exhaustionComponent: PlayerExhaustionComponent;

	public constructor(player: Player) {
		if (!player.isPlayer()) throw new Error("Cannot use hunger in entities!");
		super(player, PlayerHungerComponent.identifier);

		this.saturationComponent = player.getComponent(
			"minecraft:player.saturation"
		);
		this.exhaustionComponent = player.getComponent(
			"minecraft:player.exhaustion"
		);
		super.setCurrentValue(this.defaultValue, false);
	}

	public onTick(): void {
		if (!this.entity.isPlayer() || !this.entity.isAlive) return;
		if (this.entity.gamemode == Gamemode.Creative) return;
		const entityCurrentHealth = this.entity.getHealth();
		const entityHealthComponent = this.entity.getComponent("minecraft:health");

		this.tickTimer++;
		// difficulty modifier

		// Exhaust player if its running (Temporary)
		if (this.entity.isSprinting) this.exhaust(0.05);

		// Reset tick timer after 4 seconds
		if (this.tickTimer >= 80) this.tickTimer = 0;
		if (this.tickTimer == 0) {
			if (
				this.food >= 18 &&
				entityCurrentHealth < entityHealthComponent.effectiveMax
			) {
				entityHealthComponent.increaseValue(1);
				this.exhaust(6);
			} else if (this.food <= 0) {
				// add starve depending on difficulty
				entityHealthComponent.applyDamage(1, ActorDamageCause.Starve);
			}
		}
		if (this.food <= 6) {
			//Disable Sprinting
		}
	}

	public exhaust(amount: number): void {
		// ! TEMPORARY IMPLEMENTATION
		let currentExhaustion = this.exhaustionComponent.exhaustion;
		currentExhaustion += amount;

		while (currentExhaustion >= 4) {
			currentExhaustion -= 4;

			if (this.saturationComponent.saturation > 0) {
				this.saturationComponent.saturation = Math.max(
					0,
					this.saturationComponent.saturation - 1
				);
				continue;
			}
			if (this.food > 0) this.decreaseValue(1);
		}

		this.exhaustionComponent.exhaustion = currentExhaustion;
	}

	public setCurrentValue(newFoodLevel: number): void {
		// Check if the new value modifies the food function
		const oldFoodValue = this.food;
		const functionRanges = [17, 6, 0];
		super.setCurrentValue(newFoodLevel, true);

		for (const range of functionRanges) {
			if (oldFoodValue > range === newFoodLevel > range) continue;
			// Reset the tick timer
			this.tickTimer = 0;
			break;
		}
	}

	// ? Getters And Setters
	/* public set food(newFoodLevel: number) {
		this.setCurrentValue(newFoodLevel, true);
	} */

	public get food(): number {
		return this.getCurrentValue();
	}

	public get maxFood(): number {
		return this.effectiveMax;
	}

	public get isHungry(): boolean {
		return this.food < this.maxFood;
	}
}

export { PlayerHungerComponent };
