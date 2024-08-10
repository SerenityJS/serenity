import { AttributeName } from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { EntityAttributeComponent } from "../../entity/attribute/attribute";

import type { Player } from "../../../player";

class PlayerExhaustionComponent extends EntityAttributeComponent {
	public static readonly identifier = AttributeName.PlayerExhaustion;

	public static readonly types = [EntityIdentifier.Player];

	public readonly effectiveMin: number = 0;
	public readonly effectiveMax: number = 5;
	public readonly defaultValue: number = 0;

	public constructor(player: Player) {
		super(player, PlayerExhaustionComponent.identifier);
		this.setCurrentValue(this.defaultValue, false);
	}

	public onTick(): void {}

	public set exhaustion(newExhaustionLevel: number) {
		this.setCurrentValue(newExhaustionLevel, true);
	}

	public get exhaustion(): number {
		return this.getCurrentValue();
	}
}

export { PlayerExhaustionComponent };
