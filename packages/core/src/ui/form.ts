import {
  ClientboundCloseFormPacket,
  ModalFormRequestPacket,
  ModalFormType,
  ServerSettingsResponsePacket
} from "@serenityjs/protocol";

import { Player } from "../entity";

/**
 * The result of a form submission.
 */
type FormResult<T> = (response: T | null, error: Error | null) => void;

/**
 * The participant of a form.
 */
interface FormParticipant<T> {
  player: Player;
  result: FormResult<T>;
  instance: Form<unknown>;
}

class Form<T> {
  /**
   * The next form id to use when creating a new form.
   */
  private static formId = 0;

  /**
   * The form id of the form.
   */
  protected readonly formId = ++Form.formId;

  /**
   * The type of form.
   */
  public readonly type!: ModalFormType;

  /**
   * The title of the form.
   */
  public title: string;

  /**
   * Create a new server-side form.
   * @param title The title of the form.
   */
  public constructor(title: string) {
    // Assign the form title
    this.title = title;
  }

  /**
   * Show the form synchronously to a player.
   * @param player The player to show the form to.
   * @param result The result callback to call when the form is submitted.
   */
  public show(player: Player, result: FormResult<T>): void;

  /**
   * Show the form asynchronously to a player.
   * @param player The player to show the form to.
   * @returns A promise that resolves with the form response or an error.
   * @note If the form is cancelled, it resolves with an error.
   * @note If the form is submitted, it resolves with the form response.
   */
  public show(player: Player): Promise<T | Error>;

  // Overloaded method to handle both synchronous and asynchronous form showing
  public show(
    player: Player,
    result?: FormResult<T>
  ): void | Promise<T | Error> {
    // Get the form payload from the class.
    const payload = JSON.stringify(this);

    // Create a new ModalFormRequestPacket.
    const packet = new ModalFormRequestPacket();

    // Assign the properties to the packet.
    packet.id = this.formId;
    packet.payload = payload;

    // Send the packet to the player.
    player.send(packet);

    // If a result callback is provided
    if (result) {
      // Add the form to the player's pending forms.
      player.pendingForms.set(this.formId, {
        player,
        result,
        instance: this
      });
    }
    // Otherwise, return a promise that resolves with the form response.
    else {
      return new Promise((resolve) => {
        // Add the form to the player's pending forms with resolve and reject functions.
        player.pendingForms.set(this.formId, {
          player,
          result: (response, error) => {
            // If there is an error, resolve with null
            if (error) resolve(error);
            // Otherwise, resolve with the response
            else resolve(response as T);
          },
          instance: this
        });
      });
    }
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

  /**
   * Updates the form for a player.
   * @param player The player to update the form for.
   */
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

export { Form, FormParticipant, FormResult };
