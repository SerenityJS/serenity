import {
	AbilityLayerFlag,
	AbilityLayerType,
	CommandPermissionLevel,
	PermissionLevel,
	UpdateAbilities,
} from '@serenityjs/bedrock-protocol';
import type { Logger } from '../../console';
import type { Player } from '../Player';
import { DEFAULT_ABILITIES } from './Defaults';

/**
 * The ability manager for a player.
 */
class Abilities {
	/**
	 * The player this ability manager belongs to.
	 */
	protected readonly player: Player;
	protected readonly logger: Logger;

	// Initialize all abilities to their default values.
	protected [AbilityLayerFlag.FlySpeed] = false;
	protected [AbilityLayerFlag.WalkSpeed] = false;
	protected [AbilityLayerFlag.MayFly] = false;
	protected [AbilityLayerFlag.Flying] = false;
	protected [AbilityLayerFlag.NoClip] = false;
	protected [AbilityLayerFlag.OperatorCommands] = false;
	protected [AbilityLayerFlag.Teleport] = false;
	protected [AbilityLayerFlag.Invulnerable] = false;
	protected [AbilityLayerFlag.Muted] = false;
	protected [AbilityLayerFlag.WorldBuilder] = false;
	protected [AbilityLayerFlag.InstantBuild] = false;
	protected [AbilityLayerFlag.Lightning] = false;
	protected [AbilityLayerFlag.Build] = false;
	protected [AbilityLayerFlag.Mine] = false;
	protected [AbilityLayerFlag.DoorsAndSwitches] = false;
	protected [AbilityLayerFlag.OpenContainers] = false;
	protected [AbilityLayerFlag.AttackPlayers] = false;
	protected [AbilityLayerFlag.AttackMobs] = false;

	/**
	 * Creates a new ability manager.
	 *
	 * @param player The player this ability manager belongs to.
	 */
	public constructor(player: Player) {
		this.player = player;
		this.logger = player.network.logger;
	}

	/**
	 * Sets the default abilities for the player.
	 */
	public setDefaults(): void {
		// First we will create a new updated abilities packet.
		const update = new UpdateAbilities();
		update.entityUniqueId = 0n; // TODO: add entity unique id to player
		update.permissionLevel = PermissionLevel.Member;
		update.commandPersmissionLevel = CommandPermissionLevel.Normal;
		update.abilities = [
			{
				type: AbilityLayerType.Base,
				flags: DEFAULT_ABILITIES,
				flySpeed: 0.05,
				walkSpeed: 0.1,
			},
		];

		// Then we will update the abilities of the player.
		for (const ability of update.abilities) {
			for (const entry of ability.flags) {
				(this as any)[entry.flag] = entry.value;
			}
		}

		// Finally we will send the abilities packet.
		void this.player.session.send(update);
	}

	/**
	 * Sets an ability for the player.
	 *
	 * @param flag The ability flag.
	 * @param value The ability value.
	 */
	public setAbility(flag: AbilityLayerFlag, value: boolean): void {
		// First we will check if the ability is valid.
		if (!(flag in AbilityLayerFlag)) {
			this.logger.debug(`Attempted to set invalid ability flag ${flag}!`);
		}

		// Then we will create a new updated abilities packet.
		const update = new UpdateAbilities();
		update.entityUniqueId = 0n; // TODO: add entity unique id to player
		update.permissionLevel = PermissionLevel.Member;
		update.commandPersmissionLevel = CommandPermissionLevel.Normal;
		update.abilities = [
			{
				type: AbilityLayerType.Base,
				flags: [
					{
						flag,
						value,
					},
				],
				flySpeed: 0.05,
				walkSpeed: 0.1,
			},
		];

		// Then we will update the abilities of the player.
		(this as any)[flag] = value;

		// Finally we will send the abilities packet.
		// TODO: Possibly await this? Allow the event loop to handle this?
		void this.player.session.send(update);
	}

	/**
	 * Gets an ability for the player.
	 *
	 * @param flag The ability flag.
	 */
	public getAbility(flag: AbilityLayerFlag): boolean {
		// First we will check if the ability is valid.
		if (!(flag in AbilityLayerFlag)) {
			this.logger.debug(`Attempted to get invalid ability flag ${flag}!`);
		}

		// Then we will return the ability value.
		return (this as any)[flag];
	}
}

export { Abilities };
