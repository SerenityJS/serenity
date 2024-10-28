import {
  ClientboundCloseFormPacket,
  ModalFormRequestPacket,
  ModalFormType
} from "@serenityjs/protocol";

import { Player } from "../entity";

type FormResult<T> = (response: T | null, error: Error | null) => void;

class Form<T> {
  /**
   * The pending forms that are currently being submitted.
   */
  public static readonly pending = new Map<number, FormResult<never>>();

  /**
   * The next form id to use when creating a new form.
   */
  public static formId = 0;

  /**
   * The type of form.
   */
  public readonly type!: ModalFormType;

  /**
   * Shows the form to a player.
   * @param player The player to show the form to.
   * @returns The form response; the value of the form.
   */
  public show(player: Player, result: FormResult<T>): this {
    // Get the form payload from the class.
    const payload = JSON.stringify(this);

    // Create a new ModalFormRequestPacket.
    const packet = new ModalFormRequestPacket();

    // Assign the properties to the packet.
    packet.id = ++Form.formId;
    packet.payload = payload;

    // Send the packet to the player.
    player.send(packet);

    // Add the form to the pending forms.
    Form.pending.set(packet.id, result);

    // Return the form.
    return this;
  }

  /**
   * Closes the form for a player.
   * @param player The player to close the form for.
   */
  public close(player: Player): void {
    // Create a new ClientboundCloseFormPacket
    const packet = new ClientboundCloseFormPacket();

    // Send the packet to the player.
    player.send(packet);
  }
}

export { Form };
