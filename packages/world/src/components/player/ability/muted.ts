import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerMutedComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.Muted;

	public readonly flag = AbilityLayerFlag.Muted;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerMutedComponent };
