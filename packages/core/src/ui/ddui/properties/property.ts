import { DataStorePropertyValueType } from "@serenityjs/protocol";

import { Player } from "../../../entity";
import { DataDrivenScreen } from "../screen";

import { ObjectProperty } from "./object";

abstract class DataDrivenProperty<T, K = unknown> {
  /**
   * The type of the property, used for serialization and deserialization purposes.
   */
  public abstract readonly type: DataStorePropertyValueType;

  /**
   * The path of the property within the object hierarchy.
   */
  protected readonly parent: ObjectProperty | null = null;

  /**
   * A set of listeners that are associated with the observable element, which can be used to handle user interactions and trigger specific actions when certain events occur.
   * Each listener is represented by a function, which can be used to define the behavior and response of the observable element to specific events or interactions within the user interface.
   */
  private listeners: Set<(player: Player, data: K | T) => void> = new Set();

  /**
   * A counter that keeps track of the number of times the listeners have been triggered, which can be used for various purposes such as debugging, analytics, or controlling the flow of events within the user interface based on the number of interactions that have occurred.
   */
  protected triggerCount = 0n;

  /**
   * The name of the property, used for identification and referencing purposes.
   */
  public name: string;

  /**
   * The value of the property, which can be of various types depending on the specific implementation and use case.
   * This value is used for storing and retrieving data associated with the property.
   */
  public value: T;

  /**
   * Create a new data-driven property with the given name and value.
   * @param name The name of the property, used for identification and referencing purposes.
   * @param value The value of the property, which can be of various types depending on the specific implementation and use case.
   * @param parent The parent property of the current property, which can be used to establish a hierarchical relationship between properties and allow for proper referencing and access within the object hierarchy when serialized and deserialized.
   * This value is used for storing and retrieving data associated with the property.
   */
  protected constructor(
    name: string,
    value: T,
    parent: ObjectProperty | null = null
  ) {
    // Assign the name and value of the property
    this.name = name;
    this.value = value;

    // Set the path of the property based on the parent path and the name of the property, allowing it to be properly referenced and accessed within the object hierarchy when serialized and deserialized.
    this.parent = parent;
  }

  /**
   * Add a listener function to the set of listeners associated with the observable element, allowing it to respond to specific events or interactions within the user interface.
   * @param listener The listener function to be added, which defines the behavior and response of the observable element when certain events occur, enabling dynamic and interactive user interfaces.
   */
  public addListener(listener: (player: Player, data: K | T) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove a listener function from the set of listeners associated with the observable element, allowing it to stop responding to specific events or interactions within the user interface.
   * @param listener The listener function to be removed, which will no longer define the behavior and response of the observable element when certain events occur, allowing for dynamic control over the interactivity of the user interface.
   */
  public removeListener(listener: (player: Player, data: K | T) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Trigger all listener functions associated with the observable element, allowing it to respond to specific events or interactions within the user interface by executing the defined behavior and response of each listener function.
   * @param player The player associated with the event or interaction, which can be used to provide context and information about the user who triggered the event, enabling personalized and dynamic user interfaces based on the player's actions.
   * @param data The data to be passed to each listener function when triggered, which can be used to provide context and information about the event or interaction that occurred, enabling dynamic and responsive user interfaces based on the provided data.
   */
  public triggerListeners(player: Player, data: K | T): void {
    // Increment the trigger count each time the listeners are triggered.
    this.triggerCount++;

    // Iterate through each listener function in the set of listeners and execute it with the provided data.
    for (const listener of this.listeners) listener(player, data);
  }

  /**
   * Get the path of the property within the object hierarchy, which can be used for proper referencing and access when serialized and deserialized.
   * @returns The path of the property within the object hierarchy, which is constructed based on the parent path and the name of the property.
   */
  public getPath(): string {
    // If the property has a parent, recursively get the path of the parent and append the name of the current property to it, allowing for proper referencing and access within the object hierarchy when serialized and deserialized.
    if (this.parent) {
      // Get the path of the parent property.
      const parentPath = this.parent.getPath();

      // If the name of the parent is 0 in length, dont include it in the path, which indicates that it is the root property of the object hierarchy.
      if (this.parent.name.length === 0) return this.name;

      // Check if the name of the property is an integer, which indicates that it is an array index.
      if (Number.isInteger(Number(this.name)))
        return `${parentPath}[${this.name}]`;
      // Otherwise, return the path of the parent property followed by a dot and the name of the current property, indicating a nested property within the object hierarchy.
      else return `${parentPath}.${this.name}`;
    }

    // If the property does not have a parent, return its name as the path.
    return this.name;
  }

  /**
   * Get the data store information for the property, which includes the identifier of the root screen and the path of the property within the object hierarchy, allowing for proper referencing and access when serialized and deserialized.
   * @returns A tuple containing the identifier of the root screen and the path of the property within the object hierarchy, which can be used for proper referencing and access when serialized and deserialized.
   */
  public getRootScreen(): DataDrivenScreen | null {
    // If the property has a parent, recursively get the data store information from the parent, allowing it to be properly referenced and accessed within the object hierarchy when serialized and deserialized.
    if (this.parent) return this.parent.getRootScreen();

    // Return null if no parent is found.
    return null;
  }
}

export { DataDrivenProperty };
