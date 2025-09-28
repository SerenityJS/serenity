import { ActorDataId, ActorDataType, Gamemode } from "@serenityjs/protocol";

import { EntityIdentifier, EntityInteractMethod } from "../../enums";
import { JSONLikeObject } from "../../types";
import { Player } from "../player";
import { DialogueForm } from "../../ui";
import { Entity } from "../entity";

import { EntityTrait } from "./trait";

interface EntityNpcDialogueProperty extends JSONLikeObject {
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

const DefaultOptions: EntityNpcDialogueProperty = {
  title: "NPC",
  dialogue: "",
  buttons: []
};

class EntityNpcTrait extends EntityTrait {
  public static readonly identifier = "npc";
  public static readonly types = [EntityIdentifier.Npc];
  public static readonly components = ["minecraft:npc"];

  /**
   * The property used to store the npc dialogue form data.
   */
  public get property(): EntityNpcDialogueProperty {
    return this.entity
      .getStorage()
      .getDynamicProperty("npc") as EntityNpcDialogueProperty;
  }

  /**
   * The property used to store the npc dialogue form data.
   */
  public set property(value: EntityNpcDialogueProperty) {
    this.entity
      .getStorage()
      .setDynamicProperty<EntityNpcDialogueProperty>("npc", value);
  }

  /**
   * The title of the npc dialogue form.
   */
  public get title(): string {
    return this.property.title;
  }

  /**
   * The title of the npc dialogue form.
   */
  public set title(value: string) {
    this.property.title = value;
  }

  /**
   * The dialogue content of the npc dialogue form.
   */
  public get dialogue(): string {
    return this.property.dialogue;
  }

  /**
   * The dialogue content of the npc dialogue form.
   */
  public set dialogue(value: string) {
    this.property.dialogue = value;
  }

  /**
   * The buttons of the npc dialogue form.
   */
  public get buttons(): Array<[string, string]> {
    return this.property.buttons;
  }

  /**
   * The buttons of the npc dialogue form.
   */
  public set buttons(value: Array<[string, string]>) {
    this.property.buttons = value;
  }

  public constructor(
    entity: Entity,
    options?: Partial<EntityNpcDialogueProperty>
  ) {
    super(entity);

    // Set the options of the trait with the default options
    this.property = {
      ...DefaultOptions,
      ...options
    } as EntityNpcDialogueProperty;
  }

  /**
   * Adds a button to the npc dialogue form.
   * @param text The text of the button.
   * @returns The index of the button.
   */
  public addButton(text: string, command = ""): number {
    // Add the button to the npc dialogue form
    this.property.buttons.push([text, command]);

    // Return the index of the button
    return this.property.buttons.length - 1;
  }

  public onAdd(): void {
    // Check if the entity has a npc component
    if (this.entity.getStorage().hasDynamicProperty(this.identifier)) return;

    // Add the npc component to the entity
    this.entity
      .getStorage()
      .setDynamicProperty<EntityNpcDialogueProperty>(this.identifier, {
        title: "NPC",
        dialogue: "",
        buttons: []
      });

    // Add the metadata item to the entity
    this.entity.metadata.setActorMetadata(
      ActorDataId.HasNpc,
      ActorDataType.Byte,
      1
    );
  }

  public onRemove(): void {
    // Remove the npc component from the entity
    this.entity.getStorage().removeDynamicProperty(this.identifier);

    // Remove the metadata item from the entity
    this.entity.metadata.setActorMetadata(ActorDataId.HasNpc, null);
  }

  public onInteract(player: Player, method: EntityInteractMethod): void {
    // Check if the player is in creative mode and attacking the entity
    if (
      method === EntityInteractMethod.Attack &&
      player.getGamemode() === Gamemode.Creative
    ) {
      // Remove the entity from the dimension
      this.entity.despawn();
    }

    // Check if the entity is not being interacted with (right-click)
    if (method !== EntityInteractMethod.Interact) return;

    // Create a new dialogue form for the entity, and indicate that it is from a trait
    const form = new DialogueForm(this.entity, this.title, this.dialogue, true);

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

export { EntityNpcTrait, EntityNpcDialogueProperty };
