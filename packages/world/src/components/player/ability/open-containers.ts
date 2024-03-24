import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerOpenContainersComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.OpenContainers;

	public readonly flag = AbilityLayerFlag.OpenContainers;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerOpenContainersComponent };
