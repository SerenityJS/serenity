import {
	AbilityLayerFlag,
	AbilityLayerType,
	AbilitySet,
	UpdateAbilitiesPacket
} from "@serenityjs/protocol";

import { PlayerComponent } from "../player-component";
import { Player } from "../../../player";

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

	/**
	 * The current value of the ability.
	 */
	public abstract currentValue: boolean;

	public constructor(player: Player, identifier: AbilitySet) {
		super(player, identifier);
		this.identifier = identifier;
	}

	/**
	 * Sets the current value of the ability.
	 * @param value The value to set.
	 */
	public setCurrentValue(value: boolean): void {
		// Set the current value
		this.currentValue = value;

		// Create a new UpdateAbilitiesPacket
		const packet = new UpdateAbilitiesPacket();

		// Set the packet properties
		packet.entityUniqueId = this.player.unique;
		packet.permissionLevel = 2; // TODO
		packet.commandPersmissionLevel = 2; // TODO
		packet.abilities = [
			{
				type: AbilityLayerType.Base,
				flags: this.player.getAbilities().map((component) => {
					return {
						flag: component.flag,
						value: component.currentValue
					};
				}),
				flySpeed: 0.05,
				walkSpeed: 0.1
			}
		];

		// Broadcast the packet to the world.
		this.player.dimension.world.broadcast(packet);
	}

	/**
	 * Resets the ability to the default value.
	 */
	public resetToDefaultValue(): void {
		this.setCurrentValue(this.defaultValue);
	}
}

export { PlayerAbilityComponent };
