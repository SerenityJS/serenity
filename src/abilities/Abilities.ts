import { AbilityLayerFlag, AbilityLayerType, UpdateAbilities, Attributes } from '@serenityjs/protocol';
import type { Logger } from '../logger';
import type { Player } from '../player';
import { DefaultAbilities } from './Defaults';

class PlayerAbilities {
	private readonly player: Player;
	private readonly logger: Logger;

	private [AbilityLayerFlag.FlySpeed] = false;
	private [AbilityLayerFlag.WalkSpeed] = false;
	private [AbilityLayerFlag.MayFly] = false;
	private [AbilityLayerFlag.Flying] = false;
	private [AbilityLayerFlag.NoClip] = false;
	private [AbilityLayerFlag.OperatorCommands] = false;
	private [AbilityLayerFlag.Teleport] = false;
	private [AbilityLayerFlag.Invulnerable] = false;
	private [AbilityLayerFlag.Muted] = false;
	private [AbilityLayerFlag.WorldBuilder] = false;
	private [AbilityLayerFlag.InstantBuild] = false;
	private [AbilityLayerFlag.Lightning] = false;
	private [AbilityLayerFlag.Build] = false;
	private [AbilityLayerFlag.Mine] = false;
	private [AbilityLayerFlag.DoorsAndSwitches] = false;
	private [AbilityLayerFlag.OpenContainers] = false;
	private [AbilityLayerFlag.AttackPlayers] = false;
	private [AbilityLayerFlag.AttackMobs] = false;

	public constructor(player: Player, logger: Logger) {
		this.player = player;
		this.logger = logger;
	}

	/**
	 *
	 * **setDefaults**
	 *
	 * Sets all the abilities to their default values.
	 *
	 * @returns
	 */
	public setDefaults(): void {
		// Create a new UpdateAttributes packet
		const update = new UpdateAbilities();
		update.uniqueId = this.player.runtimeId;
		update.permissionLevel = 1; // TODO
		update.commandsPermission = 0; // TODO
		update.abilities = [
			{
				type: AbilityLayerType.Base,
				flags: DefaultAbilities,
				flySpeed: this.player.attributes.getAttribute(Attributes.Movement), // TODO: change this
				walkSpeed: this.player.attributes.getAttribute(Attributes.Movement),
			},
		];
		// Loop through all the attributes
		for (const ability of update.abilities[0].flags) {
			// Set the attribute to the default value
			(this as any)[ability.flag] = ability.value;
		}

		// Send the packet to the player
		return this.player.sendPacket(update);
	}

	/**
	 * **getAbility**
	 *
	 * @param {AbilityLayerFlag} ability - The ability to get.
	 * @returns {boolean} - The value of the ability.
	 */
	public getAbility(ability: AbilityLayerFlag): boolean {
		return (this as any)[ability];
	}

	/**
	 * **setAbility**
	 *
	 * Sets the value of an ability for the player.
	 *
	 * @param {AbilityLayerFlag} ability - The ability to set.
	 * @param {boolean} value - The value to set the ability to.
	 * @returns
	 */
	public setAbility(ability: AbilityLayerFlag, value: boolean): void {
		// Get the default value for the attribute
		const def = DefaultAbilities.find((x) => x.flag === ability);
		if (!def) {
			return this.logger.error(`Failed to find default value for abilty "${ability}"!`);
		}

		def.value = value;
		(this as any)[ability] = value;

		// Assign the new abilities
		const flags = [...DefaultAbilities.filter((x) => x.flag !== ability), def];

		// Create a new UpdateAbilities packet
		const update = new UpdateAbilities();
		update.uniqueId = this.player.runtimeId;
		update.permissionLevel = 1; // TODO
		update.commandsPermission = 0; // TODO
		update.abilities = [
			{
				type: AbilityLayerType.Base,
				flags,
				flySpeed: this.player.attributes.getAttribute(Attributes.Movement), // TODO: change this
				walkSpeed: this.player.attributes.getAttribute(Attributes.Movement),
			},
		];

		// Send the packet to the player
		return this.player.sendPacket(update);
	}

	public mayBuild(): boolean {
		return this.getAbility(AbilityLayerFlag.Build);
	}

	public setMayBuild(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.Build, value);
	}

	public mayMine(): boolean {
		return this.getAbility(AbilityLayerFlag.Mine);
	}

	public setMayMine(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.Mine, value);
	}

	public mayUseDoorsAndSwitches(): boolean {
		return this.getAbility(AbilityLayerFlag.DoorsAndSwitches);
	}

	public setMayUseDoorsAndSwitches(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.DoorsAndSwitches, value);
	}

	public mayOpenContainers(): boolean {
		return this.getAbility(AbilityLayerFlag.OpenContainers);
	}

	public setMayOpenContainers(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.OpenContainers, value);
	}

	public mayAttackPlayers(): boolean {
		return this.getAbility(AbilityLayerFlag.AttackPlayers);
	}

	public setMayAttackPlayers(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.AttackPlayers, value);
	}

	public mayAttackMobs(): boolean {
		return this.getAbility(AbilityLayerFlag.AttackMobs);
	}

	public setMayAttackMobs(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.AttackMobs, value);
	}

	public mayUseOperatorCommands(): boolean {
		return this.getAbility(AbilityLayerFlag.OperatorCommands);
	}

	public setMayUseOperatorCommands(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.OperatorCommands, value);
	}

	public mayTeleport(): boolean {
		return this.getAbility(AbilityLayerFlag.Teleport);
	}

	public setMayTeleport(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.Teleport, value);
	}

	public isInvulnerable(): boolean {
		return this.getAbility(AbilityLayerFlag.Invulnerable);
	}

	public setInvulnerable(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.Invulnerable, value);
	}

	public isFlying(): boolean {
		return this.getAbility(AbilityLayerFlag.Flying);
	}

	public setFlying(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.Flying, value);
	}

	public mayFly(): boolean {
		return this.getAbility(AbilityLayerFlag.MayFly);
	}

	public setMayFly(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.MayFly, value);
	}

	public mayInstantBuild(): boolean {
		return this.getAbility(AbilityLayerFlag.InstantBuild);
	}

	public setMayInstantBuild(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.InstantBuild, value);
	}

	public mayLightning(): boolean {
		return this.getAbility(AbilityLayerFlag.Lightning);
	}

	public setMayLightning(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.Lightning, value);
	}

	public isMuted(): boolean {
		return this.getAbility(AbilityLayerFlag.Muted);
	}

	public setMuted(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.Muted, value);
	}

	public isWorldBuilder(): boolean {
		return this.getAbility(AbilityLayerFlag.WorldBuilder);
	}

	public setWorldBuilder(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.WorldBuilder, value);
	}

	public isNoClip(): boolean {
		return this.getAbility(AbilityLayerFlag.NoClip);
	}

	public setNoClip(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.NoClip, value);
	}

	public isPrivilegedBuilder(): boolean {
		return this.getAbility(AbilityLayerFlag.PrivilegedBuilder);
	}

	public setPrivilegedBuilder(value: boolean): void {
		return this.setAbility(AbilityLayerFlag.PrivilegedBuilder, value);
	}
}

export { PlayerAbilities };
