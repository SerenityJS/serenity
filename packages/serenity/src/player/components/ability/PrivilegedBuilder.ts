import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerPrivilegedBuilderComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.PrivilegedBuilder;

	public readonly flag = AbilityLayerFlag.PrivilegedBuilder;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerPrivilegedBuilderComponent };
