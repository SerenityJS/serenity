import {
  ClientboundCloseFormPacket,
  ModalFormRequestPacket,
  ModalFormType,
  ServerSettingsResponsePacket
} from "@serenityjs/protocol";
import { Awaitable } from "@serenityjs/emitter";

import { Player } from "../entity";

/**
 * The result of a form submission.
 */
type FormResult<T> = (
  response: T | null,
  error: Error | null
) => Awaitable<void>;

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
   * Shows the form to a player.
   * @param player The player to show the form to.
   * @returns The form response; the value of the form.
   */
  public async show(player: Player, result: FormResult<T>): Promise<this> {
    // Get the form payload from the class.
    const payload = JSON.stringify(this);

    // Create a new ModalFormRequestPacket.
    const packet = new ModalFormRequestPacket();

    // Assign the properties to the packet.
    packet.id = this.formId;
    packet.payload = payload;

    // Send the packet to the player.
    await player.send(packet);

    // Add the player to the pending forms map.
    player.pendingForms.set(this.formId, { player, result, instance: this });

    // Return the form.
    return this;
  }

  /**
   * Closes the form for a player.
   * @param player The player to close the form for.
   */
  public async close(player: Player): Promise<void> {
    // Create a new ClientboundCloseFormPacket
    const packet = new ClientboundCloseFormPacket();

    // Send the packet to the player.
    await player.send(packet);
  }

  public async update(player: Player): Promise<void> {
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
    await player.send(packet);
  }
}

export { Form, FormParticipant, FormResult };
