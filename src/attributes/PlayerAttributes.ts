import { Attributes, UpdateAttributes } from '@serenityjs/protocol';
import type { Logger } from '../logger';
import type { Player } from '../player';
import { AttributesDefaults } from './Defaults';

class PlayerAttributes {
	private readonly player: Player;
	private readonly logger: Logger;

	private [Attributes.Absorption] = 0;
	private [Attributes.PlayerSaturation] = 0;
	private [Attributes.PlayerExhaustion] = 0;
	private [Attributes.KnockbackResistence] = 0;
	private [Attributes.Health] = 0;
	private [Attributes.Movement] = 0;
	private [Attributes.FollowRange] = 0;
	private [Attributes.PlayerHunger] = 0;
	private [Attributes.AttackDamage] = 0;
	private [Attributes.PlayerLevel] = 0;
	private [Attributes.PlayerExperience] = 0;
	private [Attributes.UnderwaterMovement] = 0;
	private [Attributes.Luck] = 0;
	private [Attributes.FallDamage] = 0;
	private [Attributes.HorseJumpStrength] = 0;
	private [Attributes.ZombieSpawnReinforcements] = 0;
	private [Attributes.LavaMovement] = 0;

	public constructor(player: Player, logger: Logger) {
		this.player = player;
		this.logger = logger;
	}

	/**
	 * **setDefaults**
	 *
	 * Sets all the attributes to their default values.
	 *
	 * @returns
	 */
	public setDefaults(): void {
		// Create a new UpdateAttributes packet
		const update = new UpdateAttributes();
		update.runtimeId = this.player.runtimeId;
		update.tick = this.player.world.tick;
		update.attributes = AttributesDefaults;
		// Loop through all the attributes
		for (const attribute of update.attributes) {
			// Set the attribute to the default value
			this[attribute.name] = attribute.default;
		}

		// Send the packet to the player
		return this.player.sendPacket(update);
	}

	/**
	 * **getAttribute**
	 *
	 * Gets the value of an attribute for the player.
	 *
	 * @param attribute - The attribute to get
	 * @returns {number} - The value of the attribute
	 */
	public getAttribute(attribute: Attributes): number {
		return this[attribute];
	}

	/**
	 * **setAttribute**
	 *
	 * Sets the value of an attribute for the player.
	 *
	 * @param {Attributes} attribute - The attribute to set
	 * @param {number} value - The value to set the attribute to
	 * @returns
	 */
	public setAttribute(attribute: Attributes, value: number): void {
		// Get the default value for the attribute
		const def = AttributesDefaults.find((x) => x.name === attribute);
		if (!def) {
			return this.logger.error(`Failed to find default value for attribute "${attribute}"!`);
		}

		// Set the attribute to the new value
		def.current = value;
		this[attribute] = value;

		// Create a new UpdateAttributes packet
		const update = new UpdateAttributes();
		update.runtimeId = this.player.runtimeId;
		update.tick = this.player.world.tick;
		update.attributes = [];

		// Send the packet to the player
		return this.player.sendPacket(update);
	}
}

export { PlayerAttributes };
