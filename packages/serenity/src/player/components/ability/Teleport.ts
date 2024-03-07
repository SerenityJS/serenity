import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerTeleportComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.Teleport;

	public readonly flag = AbilityLayerFlag.Teleport;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerTeleportComponent };
