import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerCountComponent extends PlayerAbilityComponent {
	public readonly type = AbilitySet.Count;

	public readonly flag = AbilityLayerFlag.Count;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerCountComponent };
