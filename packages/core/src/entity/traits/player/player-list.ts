import {
  Color,
  PlayerListAction,
  PlayerListPacket,
  PlayerListRecord
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { EntityDespawnOptions, EntitySpawnOptions, Player } from "../../..";

import { PlayerTrait } from "./trait";

class PlayerListTrait extends PlayerTrait {
  public static readonly identifier = "player_list";

  public static readonly types = [EntityIdentifier.Player];

  /**
   * The players that are being displayed in the player list.
   */
  public readonly players = new Set<string>();

  /**
   * Clears the player list.
   */
  public clear(player?: Player): void {
    // Remove all the players from the player list
    const remove = new PlayerListPacket();
    remove.action = PlayerListAction.Remove;
    remove.records = player
      ? [new PlayerListRecord(player.uuid)]
      : [...this.players].map((uuid) => new PlayerListRecord(uuid));

    // Clear the player list
    this.players.clear();

    // Send the remove packet to the player
    this.player.send(remove);
  }

  public update(player: Player, toRemove: boolean): void {
    // If a player left, we are going to remove it from the player list
    if (toRemove) {
      const removePacket = new PlayerListPacket();
      removePacket.action = PlayerListAction.Remove;
      removePacket.records = [new PlayerListRecord(player.uuid)];
      this.players.delete(player.uuid);
      return this.player.send(removePacket);
    }
    // If a player joined, then we are going to add it with all its information
    const addPacket = new PlayerListPacket();
    addPacket.action = PlayerListAction.Add;
    addPacket.records = [
      {
        uniqueId: player.uniqueId,
        uuid: player.uuid,
        xuid: player.xuid,
        username: player.username,
        skin: player.skin.getSerialized(),
        platformBuild: player.clientSystemInfo.os,
        platformChatIdentifier: "",
        isHost: false,
        isVisitor: false,
        isTeacher: false,
        locatorColor: new Color(0, 0, 0, 0)
      }
    ];

    this.players.add(player.uuid);
    this.player.send(addPacket);
  }

  public onSpawn(details: EntitySpawnOptions): void {
    // We only want to sync all of the player list if the player is joining to the server
    if (!details.initialSpawn) return;

    // Create a new player list packet for the players that need to be added to the player list
    const add = new PlayerListPacket();
    add.action = PlayerListAction.Add;
    add.records = [];

    for (const player of this.player.dimension.world.getPlayers()) {
      if (this.players.has(player.uuid)) continue;
      add.records.push({
        uniqueId: player.uniqueId,
        uuid: player.uuid,
        xuid: player.xuid,
        username: player.username,
        skin: player.skin.getSerialized(),
        platformBuild: player.clientSystemInfo.os,
        platformChatIdentifier: "",
        isHost: false,
        isVisitor: false,
        isTeacher: false,
        locatorColor: new Color(0, 0, 0, 0)
      });
    }

    this.player.send(add);
  }

  public onDespawn(details: EntityDespawnOptions): void {
    if (details.disconnected) this.clear();
  }

  public onRemove(): void {
    // Clear the player list
    this.clear();
  }
}

export { PlayerListTrait };
