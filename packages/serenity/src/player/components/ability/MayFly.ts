import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerMayFlyComponent extends PlayerAbilityComponent {
	public readonly type = AbilitySet.MayFly;

	public readonly flag = AbilityLayerFlag.MayFly;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerMayFlyComponent };
