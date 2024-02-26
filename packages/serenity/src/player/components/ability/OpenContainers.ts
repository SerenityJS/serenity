import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerOpenContainersComponent extends PlayerAbilityComponent {
	public readonly type = AbilitySet.OpenContainers;

	public readonly flag = AbilityLayerFlag.OpenContainers;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerOpenContainersComponent };
