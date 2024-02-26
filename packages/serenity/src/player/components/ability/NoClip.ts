import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerNoClipComponent extends PlayerAbilityComponent {
	public readonly type = AbilitySet.NoClip;

	public readonly flag = AbilityLayerFlag.NoClip;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerNoClipComponent };
