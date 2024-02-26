import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerAttackPlayersComponent extends PlayerAbilityComponent {
	public readonly type = AbilitySet.AttackPlayers;

	public readonly flag = AbilityLayerFlag.AttackPlayers;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerAttackPlayersComponent };
