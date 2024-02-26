import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerDoorsAndSwitchesComponent extends PlayerAbilityComponent {
	public readonly type = AbilitySet.DoorsAndSwitches;

	public readonly flag = AbilityLayerFlag.DoorsAndSwitches;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerDoorsAndSwitchesComponent };
