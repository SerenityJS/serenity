import { ServerboundDataStorePacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { DataDrivenProperty, ObjectProperty } from "../ui";

class ServerboundDataStoreHandler extends NetworkHandler {
  public static readonly packet = Packet.ServerboundDataStore;

  public handle(
    packet: ServerboundDataStorePacket,
    connection: Connection
  ): void {
    // Get the player from the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Get the screen associated with the property being updated
    const screen = player.screens.get(packet.update.property);

    // Check if the screen exists
    if (screen) {
      // Prepare to navigate through the object's properties
      let target: DataDrivenProperty<unknown> = screen as ObjectProperty;

      // Split the path of the update to navigate to the specific property being updated
      const path = packet.update.path.split(".");

      for (const segment of path) {
        // Parse the segment to get the property name and optional index
        const [name, index] = this.parsePath(segment);

        // Check if the target is an ObjectProperty to navigate its properties
        if (!(target instanceof ObjectProperty)) break;

        // Fetch the property by name
        const property = target.getProperty(name);
        if (!property) continue;

        // Check if an index is specified and the property is an ObjectProperty
        if (index !== null && property instanceof ObjectProperty) {
          // Fetch the subproperty at the specified index if the property is an ObjectProperty
          const subproperty = property.getProperty(index.toString());

          // Set the target to the subproperty if it exists
          if (subproperty) target = subproperty as DataDrivenProperty<unknown>;
        } else {
          // If the property is not an ObjectProperty, we cannot navigate further
          target = property as DataDrivenProperty<unknown>;
        }
      }

      // Trigger the listeners of the target property with the new value from the packet
      target.triggerListeners(player, packet.update.value);
    }
  }

  /**
   * Parse a path from a string representation.
   * @param path The string representation of the value.
   */
  private parsePath(value: string): [string, number | null] {
    // Match the value against the regex to extract the name and optional index.
    const match = value.match(/^([a-zA-Z_]+)(\[(\d+)\])?$/);
    if (!match) return [value, null];

    // Extract the name and index from the match groups.
    const name = match[1] as string;
    const index = match[3] ? Number.parseInt(match[3], 10) : null;

    // Return the name and index as a tuple.
    return [name, index];
  }
}

export { ServerboundDataStoreHandler };
