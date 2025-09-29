import { ActorFlag, EmotePacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { PlayerStartEmotingSignal, PlayerStopEmotingSignal } from "../events";

class EmoteHandler extends NetworkHandler {
  public static readonly packet = Packet.Emote;

  public handle(packet: EmotePacket, connection: Connection): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Get the dimension the player
    const dimension = player.dimension;

    // Create a new PlayerStartEmotingSignal
    const signal = new PlayerStartEmotingSignal(
      player,
      packet.emoteId,
      packet.tickLength
    ).emit();

    // Return if the signal was cancelled
    if (!signal) return;

    // Set the player's emote flag
    player.flags.setActorFlag(ActorFlag.Emoting, true);

    // Schedule the emote to stop after the tick length
    dimension.schedule(packet.tickLength).on(() => {
      // Create a new PlayerStopEmotingSignal
      new PlayerStopEmotingSignal(player, packet.emoteId).emit();

      // Clear the player's emote flag
      player.flags.setActorFlag(ActorFlag.Emoting, false);
    });

    // Broadcast the emote to all players in the dimension
    dimension.broadcastExcept(player, packet);
  }
}

export { EmoteHandler };
