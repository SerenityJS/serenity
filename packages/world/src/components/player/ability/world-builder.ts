import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerWorldBuilderComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.WorldBuilder;

	public readonly flag = AbilityLayerFlag.WorldBuilder;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerWorldBuilderComponent };
