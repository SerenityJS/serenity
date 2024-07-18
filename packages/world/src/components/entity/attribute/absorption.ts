import { AttributeName } from "@serenityjs/protocol";

import { EntityAttributeComponent } from "./attribute";

import type { Player } from "../../../player";

class PlayerAbsorptionComponent extends EntityAttributeComponent {
	public static readonly identifier = AttributeName.Absorption;

	public readonly effectiveMin: number = 0;
	public readonly effectiveMax: number = 512;
	public readonly defaultValue: number = 0;

	public constructor(player: Player) {
		super(player, PlayerAbsorptionComponent.identifier);
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { PlayerAbsorptionComponent };
