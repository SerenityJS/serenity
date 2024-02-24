import {
	AbilityLayerFlag,
	AbilityLayerType,
	CommandPermissionLevel,
	PermissionLevel,
	Attribute,
	UpdateAttributes,
} from '@serenityjs/bedrock-protocol';
import type { Logger } from '../../console/index.js';
import type { Player } from '../Player.js';
import { DEFAULT_ATTRIBUTES } from './Defaults.js';

/**
 * The attributes manager for a player.
 */
class Attributes {
	/**
	 * The player this atributes manager belongs to.
	 */
	protected readonly player: Player;
	protected readonly logger: Logger;

	// Initialize all atributes to their default values.
	protected [Attribute.Absorption] = 0;
	protected [Attribute.PlayerSaturation] = 0;
	protected [Attribute.PlayerExhaustion] = 0;
	protected [Attribute.KnockbackResistence] = 0;
	protected [Attribute.Health] = 0;
	protected [Attribute.Movement] = 0;
	protected [Attribute.FollowRange] = 0;
	protected [Attribute.PlayerHunger] = 0;
	protected [Attribute.AttackDamage] = 0;
	protected [Attribute.PlayerLevel] = 0;
	protected [Attribute.PlayerExperience] = 0;
	protected [Attribute.UnderwaterMovement] = 0;
	protected [Attribute.Luck] = 0;
	protected [Attribute.FallDamage] = 0;
	protected [Attribute.HorseJumpStrength] = 0;
	protected [Attribute.ZombieSpawnReinforcements] = 0;
	protected [Attribute.LavaMovement] = 0;

	/**
	 * Creates a new atributes manager.
	 *
	 * @param player The player this atributes manager belongs to.
	 */
	public constructor(player: Player) {
		this.player = player;
		this.logger = player.network.logger;
	}

	/**
	 * Sets the default Atributes for the player.
	 */
	public setDefaults(): void {
		// First we will create a new updated Atributes packet.
		const update = new UpdateAttributes();
		update.runtimeEntityId = this.player.runtimeId;
		update.attributes = DEFAULT_ATTRIBUTES;
		update.tick = 0n; // TODO: implement ticking

		// Then we will update the Atributes of the player.
		for (const attribute of update.attributes) {
			this[attribute.name] = attribute.current;
		}

		// Finally we will send the Atributes packet.
		this.player.session.send(update);
	}

	/**
	 * Sets an attribute for the player.
	 *
	 * @param attribute The attribute to set.
	 * @param value The value to set the attribute to.
	 */
	public setAttribute(attribute: Attribute, value: number): void {
		// First we will check if the ability is valid.
		if (!(attribute in Attribute)) {
			this.logger.debug(`Attempted to set invalid attribute ${attribute}!`);
		}

		// Then we will update the abilities of the player.
		this[attribute] = value;

		// Then we will create a new updated abilities packet.
		const update = new UpdateAttributes();
		update.runtimeEntityId = this.player.runtimeId;
		update.attributes = DEFAULT_ATTRIBUTES.map((entry) => {
			return {
				...entry,
				current: this[entry.name as Attribute],
			};
		});
		update.tick = 0n; // TODO: implement ticking

		// Finally we will send the abilities packet.
		this.player.session.send(update);
	}

	/**
	 * Gets an attribute for the player.
	 *
	 * @param attribute The attribute to get.
	 */
	public getAttribute(attribute: Attribute): number {
		// First we will check if the ability is valid.
		if (!(attribute in Attribute)) {
			this.logger.debug(`Attempted to get invalid attribute ${attribute}!`);
		}

		// Then we will return the abilities of the player.
		return this[attribute];
	}
}

export { Attributes };
