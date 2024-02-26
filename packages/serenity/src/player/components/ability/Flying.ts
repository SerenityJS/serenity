import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerFlyingComponent extends PlayerAbilityComponent {
	public readonly type = AbilitySet.Flying;

	public readonly flag = AbilityLayerFlag.Flying;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerFlyingComponent };
