import { Packet, TextPacket } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class TextHandler extends NetworkHandler {
  public static readonly packet = Packet.Text;

  public handle(packet: TextPacket, connection: Connection): void {
    const player = this.serenity.players.get(connection);

    if (!player) return connection.disconnect();
    player.dimension.world.broadcast(packet);
  }
}

export { TextHandler };
