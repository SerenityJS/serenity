import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerPrivilegedBuilderComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.PrivilegedBuilder;

	public readonly flag = AbilityLayerFlag.PrivilegedBuilder;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerPrivilegedBuilderComponent };
