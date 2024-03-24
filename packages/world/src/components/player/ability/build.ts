import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerBuildComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.Build;

	public readonly flag = AbilityLayerFlag.Build;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerBuildComponent };
