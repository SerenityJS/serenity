import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerFlyingComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.Flying;

	public readonly flag = AbilityLayerFlag.Flying;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerFlyingComponent };
