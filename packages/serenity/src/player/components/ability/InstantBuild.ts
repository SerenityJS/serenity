import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerInstantBuildComponent extends PlayerAbilityComponent {
	public readonly type = AbilitySet.InstantBuild;

	public readonly flag = AbilityLayerFlag.InstantBuild;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerInstantBuildComponent };
