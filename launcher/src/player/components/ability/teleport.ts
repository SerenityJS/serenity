import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerTeleportComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.Teleport;

	public readonly flag = AbilityLayerFlag.Teleport;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerTeleportComponent };
