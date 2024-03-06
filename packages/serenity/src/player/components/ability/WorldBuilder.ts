import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerWorldBuilderComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.WorldBuilder;

	public readonly flag = AbilityLayerFlag.WorldBuilder;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerWorldBuilderComponent };
