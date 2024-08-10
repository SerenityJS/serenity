import { EntityIdentifier } from "@serenityjs/entity";
import { AbilityIndex, Gamemode } from "@serenityjs/protocol";

import { PlayerComponent } from "./player-component";

import type { Player } from "../../player";

class PlayerAbilityComponent extends PlayerComponent {
	public static readonly identifier = "minecraft:ability";

	public static readonly types = [EntityIdentifier.Player];

	public constructor(player: Player) {
		super(player, PlayerAbilityComponent.identifier);

		// Get weather the player is an operator or not.
		const op = player.isOp();
		const mayfly = player.gamemode === Gamemode.Creative;

		// Assign the default values.
		this.player.abilities.set(AbilityIndex.Build, true);
		this.player.abilities.set(AbilityIndex.Mine, true);
		this.player.abilities.set(AbilityIndex.DoorsAndSwitches, true);
		this.player.abilities.set(AbilityIndex.OpenContainers, true);
		this.player.abilities.set(AbilityIndex.AttackPlayers, true);
		this.player.abilities.set(AbilityIndex.AttackMobs, true);
		this.player.abilities.set(AbilityIndex.OperatorCommands, op);
		this.player.abilities.set(AbilityIndex.Teleport, op);
		this.player.abilities.set(AbilityIndex.Invulnerable, false);
		this.player.abilities.set(AbilityIndex.Flying, false);
		this.player.abilities.set(AbilityIndex.MayFly, mayfly);
		this.player.abilities.set(AbilityIndex.InstantBuild, true);
		this.player.abilities.set(AbilityIndex.Lightning, false);
		this.player.abilities.set(AbilityIndex.FlySpeed, true);
		this.player.abilities.set(AbilityIndex.WalkSpeed, true);
		this.player.abilities.set(AbilityIndex.Muted, false);
		this.player.abilities.set(AbilityIndex.WorldBuilder, op);
		this.player.abilities.set(AbilityIndex.NoClip, false);
		this.player.abilities.set(AbilityIndex.PrivilegedBuilder, false);
		this.player.abilities.set(AbilityIndex.Count, false);
	}
}

export { PlayerAbilityComponent };
