import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerInstantBuildComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.InstantBuild;

	public readonly flag = AbilityLayerFlag.InstantBuild;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerInstantBuildComponent };
