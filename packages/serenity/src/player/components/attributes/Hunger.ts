import { Attribute } from '@serenityjs/bedrock-protocol';
import { PlayerAttributeComponent } from './Attribute.js';

class PlayerHungerComponent extends PlayerAttributeComponent {
	/**
	 * The identifier of the component
	 */
	public readonly identifier = Attribute.PlayerHunger;

	/**
	 * The minimum health allowed for the entity.
	 */
	public readonly effectiveMin = 0;

	/**
	 * The maximum health allowed for the entity.
	 */
	public readonly effectiveMax = 20;

	/**
	 * The default health for the entity.
	 */
	public readonly defaultValue = 20;

	/**
	 * The current health of the entity.
	 */
	public currentValue = this.defaultValue;
}

export { PlayerHungerComponent };
