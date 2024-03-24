import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerInvulnerableComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.Invulnerable;

	public readonly flag = AbilityLayerFlag.Invulnerable;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerInvulnerableComponent };
