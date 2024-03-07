import { Attribute } from '@serenityjs/bedrock-protocol';
import { PlayerAttributeComponent } from './Attribute.js';

class PlayerLevelComponent extends PlayerAttributeComponent {
	/**
	 * The identifier of the component
	 */
	public readonly identifier = Attribute.PlayerLevel;

	/**
	 * The minimum level allowed for the player.
	 */
	public readonly effectiveMin = 0;

	/**
	 * The maximum level allowed for the player.
	 */
	public readonly effectiveMax = 24_791;

	/**
	 * The default level of the player.
	 */
	public readonly defaultValue = 0;

	/**
	 * The current level of the player.
	 */
	public currentValue = this.defaultValue;
}

export { PlayerLevelComponent };
