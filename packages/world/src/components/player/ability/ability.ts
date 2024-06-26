import { PlayerComponent } from "../player-component";

import type { AbilityLayerFlag, AbilitySet } from "@serenityjs/protocol";
import type { Player } from "../../../player";

abstract class PlayerAbilityComponent extends PlayerComponent {
	/**
	 * The identifier of the ability.
	 */
	public readonly identifier: AbilitySet;

	/**
	 * The flag of the ability. (For protocol purposes)
	 */
	public abstract readonly flag: AbilityLayerFlag;

	/**
	 * The default value of the ability.
	 */
	public abstract readonly defaultValue: boolean;

	public constructor(player: Player, identifier: AbilitySet) {
		super(player, identifier);
		this.identifier = identifier;
	}

	/**
	 * Gets the current value of the ability.
	 * @returns The current value of the ability.
	 */
	public getCurrentValue(): boolean {
		// Get the ability
		const ability = this.player.getAbility(this.flag);

		// Check if the ability exists
		if (!ability)
			throw new Error(`The player "${this.flag}" ability was not found.`);

		// Return the value of the ability
		return ability.value;
	}

	/**
	 * Sets the current value of the ability.
	 * @param value The value to set.
	 */
	public setCurrentValue(value: boolean, sync = true): void {
		// Check if the player has the ability
		if (this.player.hasAbility(this.flag)) {
			// Update the ability
			this.player.setAbility(this.flag, value, sync);
		} else {
			// Add the ability
			this.player.createAbility(this.flag, value, sync);
		}
	}

	/**
	 * Resets the ability to the default value.
	 */
	public resetToDefaultValue(): void {
		this.setCurrentValue(this.defaultValue);
	}
}

export { PlayerAbilityComponent };
