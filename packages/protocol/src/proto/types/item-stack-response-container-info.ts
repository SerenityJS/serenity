import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { FullContainerName } from "./full-container-name";
import { ItemStackResponseSlotInfo } from "./item-stack-response-slot-info";

class ItemStackResponseContainerInfo extends DataType {
  /**
   * The full name of the container being referred to.
   */
  public fullContainerName: FullContainerName;

  /**
   * The slots in the container.
   */
  public slots: Array<ItemStackResponseSlotInfo>;

  /**
   * Creates a new ItemStackResponseContainerInfo instance.
   * @param fullContainerName The full name of the container being referred to.
   * @param slots The slots in the container.
   */
  public constructor(
    fullContainerName: FullContainerName,
    slots: Array<ItemStackResponseSlotInfo>
  ) {
    super();
    this.fullContainerName = fullContainerName;
    this.slots = slots;
  }

  public static read(stream: BinaryStream): ItemStackResponseContainerInfo {
    // Read the full container name.
    const fullContainerName = FullContainerName.read(stream);

    // Read the number of slots.
    const slotCount = stream.readVarInt();

    // Prepare an array to store the slots.
    const slots: Array<ItemStackResponseSlotInfo> = [];

    // Loop through the number of slots.
    for (let i = 0; i < slotCount; i++) {
      // Read the slot info and add it to the array.
      const slotInfo = ItemStackResponseSlotInfo.read(stream);
      slots.push(slotInfo);
    }

    // Return the new ItemStackResponseContainerInfo instance.
    return new this(fullContainerName, slots);
  }

  public static write(
    stream: BinaryStream,
    value: ItemStackResponseContainerInfo
  ): void {
    // Write the full container name.
    FullContainerName.write(stream, value.fullContainerName);

    // Write the number of slots.
    stream.writeVarInt(value.slots.length);

    // Loop through the slots and write each one.
    for (const slot of value.slots) {
      ItemStackResponseSlotInfo.write(stream, slot);
    }
  }
}

export { ItemStackResponseContainerInfo };
