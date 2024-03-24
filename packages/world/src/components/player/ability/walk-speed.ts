import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerWalkSpeedComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.WalkSpeed;

	public readonly flag = AbilityLayerFlag.WalkSpeed;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerWalkSpeedComponent };
