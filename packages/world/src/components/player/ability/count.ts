import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerCountComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.Count;

	public readonly flag = AbilityLayerFlag.Count;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerCountComponent };
