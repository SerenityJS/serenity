import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerFlySpeedComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.FlySpeed;

	public readonly flag = AbilityLayerFlag.FlySpeed;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerFlySpeedComponent };
