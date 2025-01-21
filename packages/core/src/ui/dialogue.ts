import {
  ActorDataId,
  ActorDataType,
  DataItem,
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

class DialogueForm extends Form<number> {
  public readonly type = ModalFormType.Dialogue;

  /**
   * The target entity that the dialogue is focused on.
   */
  public readonly target: Entity;

  /**
   * The title of the form.
   */
  public title: string = "";

  /**
   * The dialogue content of the form.
   */
  public content: string = "";

  /**
   * The buttons of the dialogue form.
   */
  public readonly buttons: Array<DialogueFormButton> = [];

  /**
   * Creates a new dialogue form.
   * @param target The target entity that the dialogue is focused on.
   */
  public constructor(target: Entity) {
    super();

    // Set the properties of the dialogue form.
    this.target = target;
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

  public show(player: Player, result: FormResult<number>): this {
    // Check if the target has a NPC metadata.
    if (!this.target.metadata.has(ActorDataId.HasNpc)) {
      // Create the data item for the NPC metadata.
      const data = new DataItem(ActorDataId.HasNpc, ActorDataType.Byte, 1);

      // Set the NPC metadata to the target.
      this.target.metadata.set(ActorDataId.HasNpc, data);
    }

    // Map the buttons to the dialogue buttons.
    const buttons = this.buttons.map((button) => {
      return {
        button_name: button.text,
        text: button.text,
        mode: 0,
        type: 1,
        data: []
      };
    });

    // Create a new NpcDialoguePacket.
    const packet = new NpcDialoguePacket();
    packet.uniqueEntityId = this.target.uniqueId;
    packet.action = NpcDialogueAction.Open;
    packet.dialogue = this.content;
    packet.scene = JSON.stringify({ formId: this.formId });
    packet.name = this.title;
    packet.json = JSON.stringify(buttons);

    // Add the form to the pending forms map.
    player.pendingForms.set(this.formId, { player, result, instance: this });

    // Send the packet to the player.
    player.send(packet);

    // Return the form instance.
    return this;
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
}

export { DialogueForm };
