import {
  ServerboundDataStorePacket,
  Packet,
  ClientboundDataDrivenUIClosePacket
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class ServerboundDataStoreHandler extends NetworkHandler {
  public static readonly packet = Packet.ServerboundDataStore;

  public handle(
    packet: ServerboundDataStorePacket,
    connection: Connection
  ): void {
    // Get the player from the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    console.log(packet.update);

    const close = new ClientboundDataDrivenUIClosePacket();
    player.send(close);
  }
}

export { ServerboundDataStoreHandler };
