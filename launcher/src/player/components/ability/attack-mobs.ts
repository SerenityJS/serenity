import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerAttackMobsComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.AttackMobs;

	public readonly flag = AbilityLayerFlag.AttackMobs;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerAttackMobsComponent };
