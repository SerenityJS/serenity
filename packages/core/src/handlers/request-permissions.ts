import {
  RequestPermissionsPacket,
  Packet,
  PermissionFlag,
  AbilityIndex
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class RequestPermissionsHandler extends NetworkHandler {
  public static readonly packet = Packet.RequestPermissions;

  public handle(
    packet: RequestPermissionsPacket,
    connection: Connection
  ): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Get the target player from the actor unique ID
    const target = player.dimension.getEntity(packet.actorUniqueId);

    // Check if the target player exists, and is a player
    if (!target || !target.isPlayer()) throw new Error("Invalid target player");

    // Get the permission flags
    const canBuild = packet.getFlag(PermissionFlag.Build);
    const canMine = packet.getFlag(PermissionFlag.Mine);
    const canUseDnS = packet.getFlag(PermissionFlag.DoorsAndSwitches);
    const canOpenContainers = packet.getFlag(PermissionFlag.OpenContainers);
    const canAttackPlayers = packet.getFlag(PermissionFlag.AttackPlayers);
    const canAttackMobs = packet.getFlag(PermissionFlag.AttackMobs);
    const canUseOC = packet.getFlag(PermissionFlag.OperatorCommands);
    const canTeleport = packet.getFlag(PermissionFlag.Teleport);

    // Set the permission flags for the target player
    target.abilities.superSet(AbilityIndex.Build, canBuild);
    target.abilities.superSet(AbilityIndex.Mine, canMine);
    target.abilities.superSet(AbilityIndex.DoorsAndSwitches, canUseDnS);
    target.abilities.superSet(AbilityIndex.OpenContainers, canOpenContainers);
    target.abilities.superSet(AbilityIndex.AttackPlayers, canAttackPlayers);
    target.abilities.superSet(AbilityIndex.AttackMobs, canAttackMobs);
    target.abilities.superSet(AbilityIndex.OperatorCommands, canUseOC);
    target.abilities.superSet(AbilityIndex.Teleport, canTeleport);

    // Send the abilities to the target player
    target.abilities.update();
  }
}

export { RequestPermissionsHandler };
