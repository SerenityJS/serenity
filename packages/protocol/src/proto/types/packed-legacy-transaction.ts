import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { ContainerId } from "../../enums";

class PackedLegacyTransaction extends DataType {
  /**
   * The container id of the transaction.
   */
  public readonly containerId: ContainerId;

  /**
   * The slots the changed during the transaction.
   */
  public readonly changedSlots: Array<number>;

  /**
   * Create a new PackedLegacyTransaction.
   * @param containerId The container id of the transaction.
   * @param changedSlots The slots the changed during the transaction.
   */
  public constructor(containerId: ContainerId, changedSlots: Array<number>) {
    super();
    this.containerId = containerId;
    this.changedSlots = changedSlots;
  }

  public static read(stream: BinaryStream): PackedLegacyTransaction {
    // Read the container id
    const containerId = stream.readInt8();

    // Read the amount of changed slots
    const amount = stream.readVarInt();

    // Create an array to store the changed slots
    const changedSlots: Array<number> = [];

    // Loop through the amount of changed slots
    for (let index = 0; index < amount; index++) {
      // Read the changed slot
      const slot = stream.readUint8();

      // Push the changed slot to the array
      changedSlots.push(slot);
    }

    // Return a new PackedLegacyTransaction
    return new this(containerId, changedSlots);
  }

  public static write(
    stream: BinaryStream,
    value: PackedLegacyTransaction
  ): void {
    // Write the container id
    stream.writeInt8(value.containerId);

    // Write the amount of changed slots
    stream.writeVarInt(value.changedSlots.length);

    // Loop through the changed slots
    for (const slot of value.changedSlots) {
      // Write the changed slot
      stream.writeUint8(slot);
    }
  }
}

export { PackedLegacyTransaction };
