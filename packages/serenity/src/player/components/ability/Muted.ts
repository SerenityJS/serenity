import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerMutedComponent extends PlayerAbilityComponent {
	public readonly type = AbilitySet.Muted;

	public readonly flag = AbilityLayerFlag.Muted;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerMutedComponent };
