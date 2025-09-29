import {
  ActorDataId,
  ActorDataType,
  ModalFormType,
  NpcDialogueAction,
  NpcDialoguePacket
} from "@serenityjs/protocol";

import { Entity, Player } from "../entity";

import { Form, FormResult } from "./form";

interface DialogueFormButton {
  /**
   * The text displayed on the button.
   */
  text: string;
}

interface DialogueFormProperties {
  /**
   * The form id of the dialogue form.
   */
  formId: number;

  /**
   * Whether the dialogue form is from a trait.
   */
  fromTrait: boolean;
}

class DialogueForm extends Form<number> {
  public readonly type = ModalFormType.Dialogue;

  /**
   * The target entity that the dialogue is focused on.
   */
  public readonly target: Entity;

  /**
   * The dialogue content of the form.
   */
  public content: string;

  /**
   * Whether the dialogue form is from a trait.
   */
  public fromTrait: boolean;

  /**
   * The buttons of the dialogue form.
   */
  public readonly buttons: Array<DialogueFormButton> = [];

  /**
   * Creates a new dialogue form.
   * @param target The target entity that the dialogue is focused on.
   * @param title The title of the dialogue form.
   * @param content The content of the dialogue form.
   * @param fromTrait Whether the dialogue form is from a trait.
   */
  public constructor(
    target: Entity,
    title: string,
    content?: string,
    fromTrait = false
  ) {
    super(title);

    // Set the properties of the dialogue form.
    this.target = target;
    this.content = content ?? String();
    this.fromTrait = fromTrait;
  }

  /**
   * Adds a button to the dialogue form.
   * @param text The text of the button.
   * @returns The current instance of the dialogue form.
   */
  public button(text: string): this {
    // Push the button to the buttons array.
    this.buttons.push({ text });

    // Return this instance.
    return this;
  }

  /**
   * Shows the dialogue synchronously to a player.
   * @param player The player to show the form to.
   * @param result The result callback to call when the form is submitted.
   */
  public show(player: Player, result: FormResult<number>): void;

  /**
   * Shows the dialogue asynchronously to a player.
   * @param player The player to show the form to.
   * @returns A promise that resolves with the form response or an error.
   * @note If the form is cancelled, it resolves with an error.
   * @note If the form is submitted, it resolves with the form response.
   */
  public show(player: Player): Promise<number | Error>;

  // Overloaded method to handle both synchronous and asynchronous form showing
  public show(
    player: Player,
    result?: FormResult<number>
  ): void | Promise<number | Error> {
    // Check if the target has a NPC metadata.
    if (!this.target.metadata.hasActorMetadata(ActorDataId.HasNpc)) {
      // Set the NPC metadata to the target.
      this.target.metadata.setActorMetadata(
        ActorDataId.HasNpc,
        ActorDataType.Byte,
        1
      );
    }

    // Map the buttons to the dialogue buttons.
    const buttons = this.buttons.map((button) => ({
      button_name: button.text,
      text: button.text,
      mode: 0,
      type: 1,
      data: []
    }));

    // Create a new NpcDialoguePacket.
    const packet = new NpcDialoguePacket();
    packet.uniqueEntityId = this.target.uniqueId;
    packet.action = NpcDialogueAction.Open;
    packet.dialogue = this.content;

    // Create the dialogue form properties
    const properties: DialogueFormProperties = {
      formId: this.formId,
      fromTrait: this.fromTrait
    };

    // Set the scene to the form id and from trait.
    packet.scene = JSON.stringify(properties);
    packet.name = this.title;
    packet.json = JSON.stringify(buttons);

    // Check if a result callback is provided
    if (result) {
      // Add the form to the player's pending forms.
      player.pendingForms.set(this.formId, {
        player,
        result,
        instance: this
      });

      // Send the packet to the player.
      player.send(packet);
    } else {
      // Return a promise that resolves with the form response.
      return new Promise((resolve) => {
        // Add the form to the player's pending forms with resolve and reject functions.
        player.pendingForms.set(this.formId, {
          player,
          result: (response, error) => {
            // If there is an error, resolve with an error
            if (error) resolve(error);
            // Otherwise, resolve with the response
            else resolve(response as unknown as number);
          },
          instance: this
        });

        // Send the packet to the player.
        player.send(packet);
      });
    }
  }

  public close(player: Player): void {
    // Create a new NpcDialoguePacket.
    const packet = new NpcDialoguePacket();
    packet.uniqueEntityId = this.target.uniqueId;
    packet.action = NpcDialogueAction.Close;
    packet.dialogue = String();
    packet.scene = JSON.stringify({ formId: this.formId });
    packet.name = String();
    packet.json = String();

    // Send the packet to the player.
    player.send(packet);
  }

  public static closeForm(player: Player, id: bigint): void {
    // Create a new NpcDialoguePacket.
    const packet = new NpcDialoguePacket();
    packet.uniqueEntityId = id;
    packet.action = NpcDialogueAction.Close;
    packet.dialogue = String();
    packet.scene = JSON.stringify({ formId: -1 });
    packet.name = String();
    packet.json = String();

    // Send the packet to the player.
    player.send(packet);
  }
}

export { DialogueForm, DialogueFormButton, DialogueFormProperties };
