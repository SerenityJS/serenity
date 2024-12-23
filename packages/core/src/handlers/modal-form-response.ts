import {
  ModalFormCanceledReason,
  ModalFormResponsePacket,
  Packet
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class ModalFormResponseHandler extends NetworkHandler {
  public static readonly packet = Packet.ModalFormResponse;

  public handle(packet: ModalFormResponsePacket, connection: Connection): void {
    // Get the player from the connection.
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Get the pending form.
    const participant = player.pendingForms.get(packet.id);

    // If the player is not found, throw an error.
    if (!participant)
      throw new Error(
        `Failed to fetch participant with id ${player.uniqueId}, broadcasted to ${player.username}`
      );

    // Check if the form was cancelled.
    if (packet.canceled) {
      // Return the form with an error.
      participant.result(
        null,
        new Error(
          `Form was canceled by the player. Reason: ${ModalFormCanceledReason[packet.reason as ModalFormCanceledReason]}`
        )
      );
    } else {
      // Parse the form response.
      const response = JSON.parse(packet.data as string);

      // Return the form with the response.
      participant.result(response, null);
    }
    player.pendingForms.delete(packet.id);
  }
}

export { ModalFormResponseHandler };
