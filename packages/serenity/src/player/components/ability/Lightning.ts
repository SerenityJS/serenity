import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerLightningComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.Lightning;

	public readonly flag = AbilityLayerFlag.Lightning;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerLightningComponent };
