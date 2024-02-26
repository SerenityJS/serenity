import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerFlySpeedComponent extends PlayerAbilityComponent {
	public readonly type = AbilitySet.FlySpeed;

	public readonly flag = AbilityLayerFlag.FlySpeed;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerFlySpeedComponent };
