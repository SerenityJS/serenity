import { AttributeName } from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { EntityAttributeComponent } from "../../entity/attribute/attribute";

import type { Player } from "../../../player";

class PlayerExperienceLevelComponent extends EntityAttributeComponent {
	public static readonly identifier = AttributeName.PlayerLevel;

	public static readonly types = [EntityIdentifier.Player];

	public readonly effectiveMin: number = 0;
	/**
	 * Maximum XP Level visible?
	 */
	public readonly effectiveMax: number = 24_792;
	public readonly defaultValue: number = 0;

	public constructor(player: Player) {
		super(player, PlayerExperienceLevelComponent.identifier);
		this.setCurrentValue(this.defaultValue, false);
	}

	public toExperience(): number {
		let totalExperience = 0;
		switch (true) {
			case this.level <= 16: {
				totalExperience = this.level ** 2 + 6 * this.level;
				break;
			}
			case this.level > 16 && this.level <= 31: {
				totalExperience = 2.5 * this.level ** 2 - 40.5 * this.level + 360;
				break;
			}
			case this.level > 31: {
				totalExperience = 4.5 * this.level ** 2 - 162.5 * this.level + 2220;
				break;
			}
		}
		return totalExperience;
	}

	public set level(newExperienceLevel: number) {
		this.setCurrentValue(newExperienceLevel, true);
	}

	public get level(): number {
		return this.getCurrentValue();
	}
}

export { PlayerExperienceLevelComponent };
