import {
  ClientboundDataStorePacket,
  DataStoreUpdate
} from "@serenityjs/protocol";

import {
  BooleanProperty,
  DataDrivenProperty,
  LongProperty,
  StringProperty
} from "./properties";

type ListenerType = StringProperty | LongProperty | BooleanProperty;
type Listener<T> = (data: T) => void | ListenerType;

class Observable<T extends string | number | boolean> {
  /**
   * A set of listeners that are associated with the observable element, which can be used to handle user interactions and trigger specific actions when certain events occur.
   */
  private readonly listeners: Set<Listener<T>> = new Set();

  /**
   * The current value of the observable element.
   */
  private value: T;

  public constructor(value: T) {
    this.value = value;
  }

  public getValue(): T {
    return this.value;
  }

  public setValue(value: T): void {
    // Set the new value of the observable element.
    this.value = value;

    // Notify all listeners of the new value value before updating the internal value property, allowing them to react to the change as needed.
    for (const listener of this.listeners) {
      // Get the property returned by the listener function.
      const element = listener(value);

      // Check if the returned value is a data-driven property.
      if (!(element instanceof DataDrivenProperty)) continue;

      // Get the root screen of the element, which is the top-level screen that contains the element within its hierarchy.
      const screen = element.getRootScreen();
      if (!screen) continue;

      // Create a new data store update with the updated value and the path of the property within the object hierarchy, allowing for proper referencing and access when serialized and deserialized.
      const update = new DataStoreUpdate(
        screen.identifier.split(":")[0] ?? "minecraft",
        screen.property,
        element.getPath(),
        value,
        1,
        1
      );

      // Send the data store update to all viewers of the screen, allowing them to receive and process the update as needed.
      for (const viewer of screen.getAllViewers()) {
        // Create a new clientbound data store packet with the update and send it to the viewer.
        const packet = new ClientboundDataStorePacket();
        packet.updates = [update];

        // Send the packet to the viewer, allowing them to receive and process the update as needed.
        viewer.send(packet);
      }
    }
  }

  public subscribe(listener: Listener<T>): void {
    this.listeners.add(listener);
  }

  public unsubscribe(listener: Listener<T>): void {
    this.listeners.delete(listener);
  }
}

export { Observable };
