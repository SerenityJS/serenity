import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerFlySpeedComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.FlySpeed;

	public readonly flag = AbilityLayerFlag.FlySpeed;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerFlySpeedComponent };
