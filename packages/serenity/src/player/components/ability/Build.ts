import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerBuildComponent extends PlayerAbilityComponent {
	public readonly type = AbilitySet.Build;

	public readonly flag = AbilityLayerFlag.Build;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerBuildComponent };
