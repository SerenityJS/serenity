import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerDoorsAndSwitchesComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.DoorsAndSwitches;

	public readonly flag = AbilityLayerFlag.DoorsAndSwitches;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerDoorsAndSwitchesComponent };
