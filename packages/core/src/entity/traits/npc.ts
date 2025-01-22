import {
  ActorDataId,
  ActorDataType,
  DataItem,
  Gamemode
} from "@serenityjs/protocol";

import { EntityIdentifier, EntityInteractMethod } from "../../enums";
import { JSONLikeObject } from "../../types";
import { Player } from "../player";
import { DialogueForm } from "../../ui";
import { Entity } from "../entity";

import { EntityTrait } from "./trait";

interface EntityNpcDialogueComponent extends JSONLikeObject {
  /**
   * The title of the npc dialogue.
   */
  title: string;

  /**
   * The dialogue content of the npc.
   */
  dialogue: string;

  /**
   * The buttons of the npc dialogue. [ButtonName, Command]
   */
  buttons: Array<[string, string]>;
}

const DefaultOptions: EntityNpcDialogueComponent = {
  title: "NPC",
  dialogue: "",
  buttons: []
};

class EntityNpcTrait extends EntityTrait {
  public static readonly identifier = "npc";
  public static readonly types = [EntityIdentifier.Npc];

  /**
   * The component used to store the npc dialogue form data.
   */
  public get component(): EntityNpcDialogueComponent {
    return this.entity.getComponent("npc") as EntityNpcDialogueComponent;
  }

  /**
   * The component used to store the npc dialogue form data.
   */
  public set component(value: EntityNpcDialogueComponent) {
    this.entity.setComponent<EntityNpcDialogueComponent>("npc", value);
  }

  /**
   * The title of the npc dialogue form.
   */
  public get title(): string {
    return this.component.title;
  }

  /**
   * The title of the npc dialogue form.
   */
  public set title(value: string) {
    this.component.title = value;
  }

  /**
   * The dialogue content of the npc dialogue form.
   */
  public get dialogue(): string {
    return this.component.dialogue;
  }

  /**
   * The dialogue content of the npc dialogue form.
   */
  public set dialogue(value: string) {
    this.component.dialogue = value;
  }

  /**
   * The buttons of the npc dialogue form.
   */
  public get buttons(): Array<[string, string]> {
    return this.component.buttons;
  }

  /**
   * The buttons of the npc dialogue form.
   */
  public set buttons(value: Array<[string, string]>) {
    this.component.buttons = value;
  }

  public constructor(
    entity: Entity,
    options?: Partial<EntityNpcDialogueComponent>
  ) {
    super(entity);

    // Set the options of the trait with the default options
    this.component = {
      ...DefaultOptions,
      ...options
    } as EntityNpcDialogueComponent;
  }

  /**
   * Adds a button to the npc dialogue form.
   * @param text The text of the button.
   * @returns The index of the button.
   */
  public addButton(text: string, command = ""): number {
    // Add the button to the npc dialogue form
    this.component.buttons.push([text, command]);

    // Return the index of the button
    return this.component.buttons.length - 1;
  }

  public onAdd(): void {
    // Check if the entity has a npc component
    if (this.entity.hasComponent(this.identifier)) return;

    // Add the npc component to the entity
    this.entity.addComponent<EntityNpcDialogueComponent>(this.identifier, {
      title: "NPC",
      dialogue: "",
      buttons: []
    });

    // Create a new metadata item for the npc component
    const metadata = new DataItem(ActorDataId.HasNpc, ActorDataType.Byte, 1);

    // Add the metadata item to the entity
    this.entity.metadata.set(ActorDataId.HasNpc, metadata);
  }

  public onRemove(): void {
    // Remove the npc component from the entity
    this.entity.removeComponent(this.identifier);

    // Remove the metadata item from the entity
    this.entity.metadata.delete(ActorDataId.HasNpc);
  }

  public onInteract(player: Player, method: EntityInteractMethod): void {
    // Check if the player is in creative mode and attacking the entity
    if (
      method === EntityInteractMethod.Attack &&
      player.gamemode === Gamemode.Creative
    ) {
      // Remove the entity from the dimension
      this.entity.despawn();
    }

    // Check if the entity is not being interacted with (right-click)
    if (method !== EntityInteractMethod.Interact) return;

    // Create a new dialogue form for the entity, and indicate that it is from a trait
    const form = new DialogueForm(this.entity, true);
    form.title = this.title;
    form.content = this.dialogue;

    // Add the buttons to the dialogue form
    for (const [text] of this.buttons) form.button(text);

    // Show the form to the player
    form.show(player, (index, error) => {
      // Check if the index is null or an error occurred
      if (index === null || error) return;

      // Get the command from the button index
      const command = this.buttons[index] ? this.buttons[index][1] : "";

      // Execute the command if it is not empty
      if (command.length > 0) player.executeCommand(command);

      // Close the form for the player
      return form.close(player);
    });
  }
}

export { EntityNpcTrait, EntityNpcDialogueComponent };
