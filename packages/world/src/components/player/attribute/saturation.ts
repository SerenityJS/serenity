import { AttributeName } from "@serenityjs/protocol";

import { EntityAttributeComponent } from "../../entity/attribute/attribute";

import type { Player } from "../../../player";

class PlayerSaturationComponent extends EntityAttributeComponent {
	public static readonly identifier = AttributeName.PlayerSaturation;

	public readonly effectiveMin: number = 0;
	public readonly effectiveMax: number = 20;
	public readonly defaultValue: number = 20;

	public constructor(player: Player) {
		super(player, PlayerSaturationComponent.identifier);
		this.setCurrentValue(this.defaultValue, false);
	}

	public onTick(): void {}

	public get saturation(): number {
		return this.getCurrentValue();
	}

	public set saturation(newSaturationLevel: number) {
		this.setCurrentValue(newSaturationLevel, true);
	}
}

export { PlayerSaturationComponent };
