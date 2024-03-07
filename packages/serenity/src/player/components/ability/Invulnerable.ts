import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerInvulnerableComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.Invulnerable;

	public readonly flag = AbilityLayerFlag.Invulnerable;

	public readonly defaultValue = false;

	public currentValue = this.defaultValue;
}

export { PlayerInvulnerableComponent };
