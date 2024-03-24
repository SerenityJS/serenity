import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerMayFlyComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.MayFly;

	public readonly flag = AbilityLayerFlag.MayFly;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerMayFlyComponent };
