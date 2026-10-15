import { LevelSoundEventPacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

/**
 * How far from a player the sounds they make can be, a little beyond what they reach.
 */
const SOUND_REACH = 16;

class LevelSoundEventHandler extends NetworkHandler {
  public static readonly packet = Packet.LevelSoundEvent;

  public handle(packet: LevelSoundEventPacket, connection: Connection): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Ignore sounds without a name, or further from the player than they could make them
    if (
      !packet.event ||
      packet.position.distance(player.position) > SOUND_REACH
    )
      return;

    // The client sends the sounds its player makes, like the block it is mining being hit,
    // for the server to play to everyone around, the player too.
    // Whether everyone hears the sound wherever they are is for the server to say.
    packet.isGlobal = false;

    // Broadcast the sound to the players in the dimension
    player.dimension.broadcast(packet);
  }
}

export { LevelSoundEventHandler };
