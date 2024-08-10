import { AttributeName } from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { EntityAttributeComponent } from "../../entity/attribute/attribute";

import type { Player } from "../../../player";

class PlayerExperienceComponent extends EntityAttributeComponent {
	public static readonly identifier = AttributeName.PlayerExperience;

	public static readonly types = [EntityIdentifier.Player];

	public readonly effectiveMin: number = 0;
	/**
	 * Infinity because it converts automatically to xp levels
	 */
	public readonly effectiveMax: number = Infinity;
	public readonly defaultValue: number = 0;

	public constructor(player: Player) {
		super(player, PlayerExperienceComponent.identifier);
		this.setCurrentValue(this.defaultValue, false);
	}

	public addExperience(experienceAmount: number) {
		if (!this.entity.isPlayer()) return;
		const experienceLevelComponent = this.entity.getComponent(
			"minecraft:player.level"
		);

		// ? Add the saved experience.
		let newXp = experienceAmount + this.experience;

		// ? While the xp value is greather or equal to the required xp for the next level, do level up

		while (newXp >= this.entity.getNextLevelXp()) {
			newXp -= this.entity.getNextLevelXp();
			experienceLevelComponent.increaseValue(1);
		}
		// ? Remove the current xp and add the remaining xp value

		this.setCurrentValue(newXp, true);
	}

	public removeExperience(experienceAmount: number) {
		if (!this.entity.isPlayer()) return;
		const experienceLevelComponent = this.entity.getComponent(
			"minecraft:player.level"
		);

		// ? Add the saved experience.
		let newXp = experienceAmount - this.experience;

		// ? While the xp value is greather or equal to the previus level, do level down

		while (newXp >= this.entity.getNextLevelXp(this.entity.level - 1)) {
			newXp -= this.entity.getNextLevelXp(this.entity.level - 1);
			experienceLevelComponent.decreaseValue(1);
		}

		// ? Remove the current xp and add the remaining xp value

		this.setCurrentValue(newXp, true);
	}

	public get experience(): number {
		return this.getCurrentValue();
	}
}

export { PlayerExperienceComponent };
