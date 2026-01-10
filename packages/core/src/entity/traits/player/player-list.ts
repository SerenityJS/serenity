import {
  Color,
  PlayerListAction,
  PlayerListPacket,
  PlayerListRecord
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { Player } from "../../..";

import { PlayerTrait } from "./trait";

class PlayerListTrait extends PlayerTrait {
  public static readonly identifier = "player_list";

  public static readonly types = [EntityIdentifier.Player];

  /**
   * The players that are being displayed in the player list.
   */
  public readonly players = new Set<string>();

  /**
   * Whether the player list syncs across worlds.
   */
  private listSyncsAcrossWorlds = false;

  /**
   * Gets whether the player list syncs across worlds.
   * @returns Whether the player list syncs across worlds.
   */
  public getListSyncsAcrossWorlds(): boolean {
    return this.listSyncsAcrossWorlds;
  }

  /**
   * Sets whether the player list syncs across worlds.
   * @param value Whether the player list syncs across worlds.
   */
  public setListSyncsAcrossWorlds(value: boolean): void {
    this.listSyncsAcrossWorlds = value;
  }

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

  /**
   * Updates a player in the player list.
   * @param player The player being updated.
   * @param shouldRemove Whether the player should be removed from the list.
   */
  public update(player: Player, shouldRemove?: boolean): void {
    // If a player left, we are going to remove it from the player list
    if (shouldRemove) {
      // Check if the player is in the player list
      if (!this.players.has(player.uuid)) return;

      // Create a new player list packet to remove the player
      const packet = new PlayerListPacket();
      packet.action = PlayerListAction.Remove;
      packet.records = [new PlayerListRecord(player.uuid)];

      // Remove the player from the player list
      this.players.delete(player.uuid);

      // Send the remove packet to the player
      return this.player.send(packet);
    }

    // Check if the player is already in the player list
    if (this.players.has(player.uuid)) return;

    // If a player joined, then we are going to add it with all its information
    const packet = new PlayerListPacket();
    packet.action = PlayerListAction.Add;
    packet.records = [
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

    // Add the player to the player list
    this.players.add(player.uuid);

    // Send the add packet to the player
    this.player.send(packet);
  }

  public onSpawn(): void {
    // Check if the player list should sync across worlds
    if (this.listSyncsAcrossWorlds) {
      // Iterate over all players in the serenity instance
      for (const player of this.player.world.serenity.getPlayers()) {
        // Fetch the player list trait
        const trait = player.getTrait(PlayerListTrait);

        // Add the player to the player list
        trait.update(this.player);

        // Add the other player to this player's list
        this.update(player);
      }
    } else {
      // Iterate over all players in the world
      for (const player of this.player.world.getPlayers()) {
        // Fetch the player list trait
        const trait = player.getTrait(PlayerListTrait);

        // Add the player to the player list
        trait.update(this.player);

        // Add the other player to this player's list
        this.update(player);
      }
    }
  }

  public onDespawn(): void {
    if (this.listSyncsAcrossWorlds) {
      // Iterate over all players in the serenity instance
      for (const player of this.player.world.serenity.getPlayers()) {
        // Fetch the player list trait
        const trait = player.getTrait(PlayerListTrait);

        // Remove the player from the player list
        trait.update(this.player, true);

        // Remove the other player from this player's list
        this.update(player, true);
      }
    } else {
      // Iterate over all players in the world
      for (const player of this.player.world.getPlayers()) {
        // Fetch the player list trait
        const trait = player.getTrait(PlayerListTrait);

        // Remove the player from the player list
        trait.update(this.player, true);

        // Remove the other player from this player's list
        this.update(player, true);
      }
    }
  }

  public onRemove(): void {
    // Clear the player list
    this.clear();
  }
}

export { PlayerListTrait };
