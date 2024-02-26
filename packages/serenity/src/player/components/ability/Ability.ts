import type { AbilityLayerFlag, AbilitySet } from '@serenityjs/bedrock-protocol';
import { Player } from '../../Player.js';
import { PlayerComponent } from '../Component.js';

abstract class PlayerAbilityComponent extends PlayerComponent {
	/**
	 * The type of the ability.
	 */
	public abstract readonly type: AbilitySet;

	/**
	 * The flag of the ability. (For protocol purposes)
	 */
	public abstract readonly flag: AbilityLayerFlag;

	/**
	 * The default value of the ability.
	 */
	public abstract readonly defaultValue: boolean;

	/**
	 * The current value of the ability.
	 */
	public abstract currentValue: boolean;

	/**
	 * Initializes the ability component.
	 *
	 * @param player - The player this component is attached to.
	 */
	public constructor(player: Player) {
		super(player);
	}

	/**
	 * Sets the current value of the ability.
	 *
	 * @param value - The value to set.
	 */
	public setCurrentValue(value: boolean): void {
		// Set the current value to the given value.
		this.currentValue = value;

		// Check if the entity is a player.
		if (this.entity instanceof Player) {
			// Update the player's abilities.
			this.entity.dimension.world.updateAbilities(this.entity);
		} else {
			throw new TypeError('Non player entities can not have an ability component.');
		}
	}

	/**
	 * Resets the current value of the ability to the default value.
	 */
	public resetToDefaultValue(): void {
		// Set the current value to the default value.
		this.currentValue = this.defaultValue;

		// Check if the entity is a player.
		if (this.entity instanceof Player) {
			// Update the player's abilities.
			this.entity.dimension.world.updateAbilities(this.entity);
		} else {
			throw new TypeError('Non player entities can not have an ability component.');
		}
	}
}

export { PlayerAbilityComponent };
