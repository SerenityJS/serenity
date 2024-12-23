import {
  ClientboundCloseFormPacket,
  ModalFormRequestPacket,
  ModalFormType,
  ServerSettingsResponsePacket
} from "@serenityjs/protocol";

import { Player } from "../entity";

type FormResult<T> = (response: T | null, error: Error | null) => void;

interface FormParticipant<T> {
  player: Player;
  result: FormResult<T>;
}

class Form<T> {
  /**
   * The next form id to use when creating a new form.
   */
  public static formId = 0;

  /**
   * The form id of the form.
   */
  protected readonly formId = ++Form.formId;

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
    packet.id = this.formId;
    packet.payload = payload;

    // Send the packet to the player.
    player.send(packet);

    // Add the player to the pending forms map.
    player.pendingForms.set(this.formId, { player, result });

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

  public update(player: Player): void {
    // Check if the form has a pending response
    if (!player.pendingForms.has(this.formId)) return;

    // Get the pending responses
    const pending = player.pendingForms.get(this.formId);

    // Verify that the pending responses exist
    if (!pending) return;

    // Create a new ServerSettingsResponsePacket
    const packet = new ServerSettingsResponsePacket();

    // Assign the properties to the packet
    packet.formId = this.formId;
    packet.payload = JSON.stringify(this);

    // Send the packet to the players
    player.send(packet);
  }
}

export { Form, FormParticipant };
