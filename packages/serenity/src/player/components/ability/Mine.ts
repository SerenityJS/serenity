import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerMineComponent extends PlayerAbilityComponent {
	public readonly type = AbilitySet.Mine;

	public readonly flag = AbilityLayerFlag.Mine;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerMineComponent };
