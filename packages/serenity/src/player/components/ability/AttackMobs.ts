import { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { PlayerAbilityComponent } from './Ability.js';

class PlayerAttackMobsComponent extends PlayerAbilityComponent {
	public readonly identifier = AbilitySet.AttackMobs;

	public readonly flag = AbilityLayerFlag.AttackMobs;

	public readonly defaultValue = true;

	public currentValue = this.defaultValue;
}

export { PlayerAttackMobsComponent };
