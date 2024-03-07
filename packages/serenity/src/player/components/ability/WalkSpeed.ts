import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerWalkSpeedComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.WalkSpeed;

	public readonly flag = AbilityLayerFlag.WalkSpeed;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerWalkSpeedComponent };
