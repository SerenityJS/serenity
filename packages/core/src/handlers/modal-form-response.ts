import {
  ModalFormCanceledReason,
  ModalFormResponsePacket,
  Packet
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { Form } from "../forms";

class ModalFormResponseHandler extends NetworkHandler {
  public static readonly packet = Packet.ModalFormResponse;

  public handle(packet: ModalFormResponsePacket, connection: Connection): void {
    // Get the player from the connection.
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Get the pending form.
    const form = Form.pending.get(packet.id);

    // If the form is not found, throw an error.
    if (!form)
      throw new Error(
        `Failed to fetch form with id ${packet.id}, broadcasted to ${player.username}`
      );

    // Delete the pending form.
    Form.pending.delete(packet.id);

    // Check if the form was cancelled.
    if (packet.canceled) {
      // Return the form with an error.
      return form(
        null,
        new Error(
          `Form was canceled by the player. Reason: ${ModalFormCanceledReason[packet.reason as ModalFormCanceledReason]}`
        )
      );
    } else {
      // Parse the form response.
      const response = JSON.parse(packet.data as string);

      // Return the form with the response.
      return form(response, null);
    }
  }
}

export { ModalFormResponseHandler };
