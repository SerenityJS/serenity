import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerOperatorCommandsComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.OperatorCommands;

	public readonly flag = AbilityLayerFlag.OperatorCommands;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerOperatorCommandsComponent };
