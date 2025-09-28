import { NpcRequestPacket, NpcRequestType, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { DialogueForm, DialogueFormProperties } from "../ui";
import { EntityNpcTrait } from "../entity";

class NpcRequestHandler extends NetworkHandler {
  public static readonly packet = Packet.NpcRequest;

  public handle(packet: NpcRequestPacket, connection: Connection): void {
    // Get the player from the connection.
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Check if the packet has properties
    const hasProperties = packet.scene.length > 0;

    // Get the form properties from the packet scene.
    const { formId, fromTrait } = hasProperties
      ? (JSON.parse(packet.scene) as DialogueFormProperties)
      : { formId: -1, fromTrait: null }; // Provide default values.

    // Check if the form id is -1 and the from trait is null.
    // If so, we can indicate that the form that request is to modify the contents of the dialogue.
    // But, we need to check if the targeted entity has a npc trait. If not, then we should close the form.
    if (formId === -1 && fromTrait === null) {
      // Get the entity from the packet unique entity id.
      const entity = player.dimension.getEntity(packet.runtimeActorId, true);

      // Check if the entity exists.
      if (!entity)
        throw new Error(
          `Entity with runtime id ${packet.runtimeActorId} not found.`
        );

      // Check if the entity has a npc trait.
      if (!entity.hasTrait(EntityNpcTrait))
        return DialogueForm.closeForm(player, entity.uniqueId);

      // Get the npc trait from the entity.
      const npc = entity.getTrait(EntityNpcTrait);

      // Switch the packet type to handle the npc request.
      switch (packet.type) {
        case NpcRequestType.SetName: {
          // Update the entity name tag with the packet actions.
          entity.setNametag(packet.actions);
          break;
        }

        case NpcRequestType.SetInteractText: {
          // Update the npc dialogue with the packet actions.
          npc.dialogue = packet.actions;
          break;
        }
      }

      return;
    }

    // Get the form from the player's pending forms.
    // And check if the form exists, if not delete the form.
    const form = player.pendingForms.get(formId);
    if (!form) return void player.pendingForms.delete(formId);

    // Get the form instance from the form.
    const instance = form.instance as DialogueForm;
    // Check if the form response was derived from a trait.
    if (fromTrait) {
      switch (packet.type) {
        case NpcRequestType.ExecuteAction: {
          // Get the button index from the packet.
          const index = packet.index as number;

          // Call the form result with the index.
          return form.result(index as unknown as null, null);
        }
      }
    } else {
      // Check if the action was to click a button.
      // If not, return the form result with a null value.
      if (packet.type !== NpcRequestType.ExecuteAction) return;

      // Call the form result with the packet index.
      form.result(packet.index as unknown as null, null);

      // Close the form for the player.
      instance.close(player);

      // Delete the form from the pending forms map.
      player.pendingForms.delete(formId);
    }
  }
}

export { NpcRequestHandler };
