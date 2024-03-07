import { Attribute } from '@serenityjs/bedrock-protocol';
import { PlayerAttributeComponent } from './Attribute.js';

class PlayerExperienceComponent extends PlayerAttributeComponent {
	/**
	 * The identifier of the component
	 */
	public readonly identifier = Attribute.PlayerExperience;

	/**
	 * The minimum experience level allowed for the player.
	 */
	public readonly effectiveMin = 0;

	/**
	 * The maximum experience level allowed for the player.
	 */
	public readonly effectiveMax = 1;

	/**
	 * The default experience level of the player.
	 */
	public readonly defaultValue = 0;

	/**
	 * The current experience level of the player.
	 */
	public currentValue = this.defaultValue;
}

export { PlayerExperienceComponent };
