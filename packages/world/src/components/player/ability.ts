import { AbilityIndex, Gamemode } from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { PlayerComponent } from "./player-component";

import type { CompoundTag } from "@serenityjs/nbt";
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

	public static serialize(
		nbt: CompoundTag,
		component: PlayerAbilityComponent
	): void {
		// Iterate over the abilities and serialize them.
		for (const [index, value] of component.player.abilities) {
			nbt.createByteTag(AbilityIndex[index], value ? 1 : 0);
		}
	}

	public static deserialize(
		nbt: CompoundTag,
		player: Player
	): PlayerAbilityComponent {
		// Create a new player ability component.
		const component = new PlayerAbilityComponent(player);

		// Deserialize the abilities.
		for (const index of Object.values(AbilityIndex)) {
			// Get the value of the ability.
			const value = nbt.getTag(AbilityIndex[index as AbilityIndex])
				?.value as number;

			// Set the ability if the value is not undefined.
			if (value !== undefined) {
				player.setAbility(index as AbilityIndex, value === 1);
			}
		}

		// Return the component.
		return component;
	}
}

export { PlayerAbilityComponent };
