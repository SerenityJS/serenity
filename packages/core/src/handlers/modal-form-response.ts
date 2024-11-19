import {
  ModalFormCanceledReason,
  ModalFormResponsePacket,
  Packet
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { Form } from "../ui";

class ModalFormResponseHandler extends NetworkHandler {
  public static readonly packet = Packet.ModalFormResponse;

  public handle(packet: ModalFormResponsePacket, connection: Connection): void {
    // Get the player from the connection.
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Get the pending form.
    const pending = Form.pending.get(packet.id);

    // If the form is not found, throw an error.
    if (!pending)
      throw new Error(
        `Failed to fetch form with id ${packet.id}, broadcasted to ${player.username}`
      );

    // Check if the player is in the pending form.
    const participant = pending.get(player.uniqueId);

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

    // Remove the participant from the pending form.
    pending.delete(player.uniqueId);

    // If the pending form is empty, delete it.
    if (pending.size === 0) Form.pending.delete(packet.id);
  }
}

export { ModalFormResponseHandler };
