import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerMineComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.Mine;

	public readonly flag = AbilityLayerFlag.Mine;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerMineComponent };
