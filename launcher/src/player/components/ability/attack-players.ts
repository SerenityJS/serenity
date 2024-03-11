import { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";

import { PlayerAbilityComponent } from "./ability";

class PlayerAttackPlayersComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.AttackPlayers;

	public readonly flag = AbilityLayerFlag.AttackPlayers;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerAttackPlayersComponent };
