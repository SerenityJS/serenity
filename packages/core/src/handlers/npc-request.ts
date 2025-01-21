import { NpcRequestPacket, NpcRequestType, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class NpcRequestHandler extends NetworkHandler {
  public static readonly packet = Packet.NpcRequest;

  public handle(packet: NpcRequestPacket, connection: Connection): void {
    // Get the player from the connection.
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Get the form id from the packet.
    const formId = JSON.parse(packet.scene).formId;

    // Get the form from the player's pending forms.
    const form = player.pendingForms.get(formId);
    if (!form) return;

    switch (packet.type) {
      // Return if the packet type is not an execute action.
      default:
        return;

      case NpcRequestType.ExecuteAction: {
        // Call the form result with the packet index.
        form.result(packet.index as unknown as null, null);
        break;
      }
    }

    // Close the form for the player.
    form.instance.close(player);
  }
}

export { NpcRequestHandler };
