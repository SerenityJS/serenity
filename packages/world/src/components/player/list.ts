import {
	PlayerListAction,
	PlayerListPacket,
	PlayerListRecord
} from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { PlayerStatus, type Player } from "../../player";

import { PlayerComponent } from "./player-component";

class PlayerListComponent extends PlayerComponent {
	public static readonly identifier = "minecraft:player_list";

	public static readonly types = [EntityIdentifier.Player];

	/**
	 * The collective set of all the players that are displayed in the player list.
	 */
	public readonly players: Set<string> = new Set();

	public constructor(player: Player) {
		super(player, PlayerListComponent.identifier);
	}

	public onTick(): void {
		// Check if the player is spawned
		if (this.player.status !== PlayerStatus.Spawned) return;

		// Get the current tick of the world
		const currentTick = this.player.dimension.world.currentTick;

		// Check if the current tick is divisible by 20
		// We don't need this running every tick
		if (currentTick % 20n !== 0n) return;

		// Get all the players in the player's world
		const players = this.player.dimension.world.getPlayers();

		// Filter out the players that are already in the player list & if the player is spawned
		const adding = players.filter(
			(player) =>
				!this.players.has(player.uuid) && player.status === PlayerStatus.Spawned
		);

		// Create a new player list packet for the players that need to be added to the player list
		const add = new PlayerListPacket();
		add.action = PlayerListAction.Add;
		add.records = adding.map((player) => ({
			uniqueId: player.unique,
			uuid: player.uuid,
			xuid: player.xuid,
			username: player.username,
			skin: player.skin,
			platformBuild: player.device.os,
			platformChatIdentifier: "",
			isHost: false,
			isVisitor: false,
			isTeacher: false
		}));

		// Filter out the players that need to be removed from the player list
		const removing = [...this.players].filter(
			(uuid) => !players.some((x) => x.uuid === uuid)
		);

		// Create a new player list packet for the players that need to be removed from the player list
		const remove = new PlayerListPacket();
		remove.action = PlayerListAction.Remove;
		remove.records = removing.map((uuid) => new PlayerListRecord(uuid));

		// Send the player list packets to the player
		if (add.records.length > 0) this.player.session.send(add);
		if (remove.records.length > 0) this.player.session.send(remove);

		// Update the player list
		for (const player of adding) this.players.add(player.uuid);

		// Update the player list
		for (const uuid of removing) this.players.delete(uuid);
	}
}

export { PlayerListComponent };
