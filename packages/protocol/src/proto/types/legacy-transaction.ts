import { BinaryStream, DataType } from "@serenityjs/binarystream";

import type { ContainerId } from "../../enums";

interface Transactions {
  containerId: ContainerId;
  changedSlots: Array<number>;
}

/**
 * The LegacyTransaction class is used to represent a legacy transaction.
 * This system is still used for some inventory related transactions.
 */
class LegacyTransaction extends DataType {
  /**
   * The request identifier of the legacy transaction.
   */
  public readonly request: number;

  /**
   * The actions of the legacy transaction.
   * If the request identifier is 0, then this value will not be present.
   */
  public readonly actions: Array<Transactions> | null;

  /**
   * Creates an instance of LegacyTransaction.
   *
   * @param request The request identifier of the legacy transaction.
   * @param actions The actions of the legacy transaction.
   */
  public constructor(request: number, actions?: Array<Transactions> | null) {
    super();
    this.request = request;
    this.actions = actions ?? null;
  }

  public static read(stream: BinaryStream): LegacyTransaction {
    // Read the request id.
    const request = stream.readZigZag();

    // If the request id is 0, then no transactions are present.
    if (request === 0) {
      // Return a new instance of the LegacyTransaction class.
      return new LegacyTransaction(request);
    }

    // Prepare an array to store the transactions.
    const transactions: Array<Transactions> = [];

    // Read the number of transactions.
    // And iterate through the transactions.
    const amount = stream.readVarInt();
    for (let index = 0; index < amount; index++) {
      // Read the container id.
      const containerId = stream.readUint8();

      // Read the number of changed slots.
      // And iterate through the changed slots.
      const changedSlots: Array<number> = [];
      const changedSlotsAmount = stream.readVarInt();
      for (let index = 0; index < changedSlotsAmount; index++) {
        // Read the changed slot.
        const changedSlot = stream.readUint8();

        // Push the changed slot to the changed slots array.
        changedSlots.push(changedSlot);
      }

      // Push the transaction to the transactions array.
      transactions.push({
        containerId,
        changedSlots
      });
    }

    // Return a new instance of the LegacyTransaction class.
    return new LegacyTransaction(request, transactions);
  }

  public static write(stream: BinaryStream, value: LegacyTransaction): void {
    // Write the request id.
    stream.writeZigZag(value.request);

    // If the request id is 0, then no actions are present.
    if (value.request === 0) {
      // Return.
      return;
    }

    // Check if the actions are present.
    if (value.actions === null) {
      throw new Error("actions are not present.");
    }

    // Write the number of actions.
    stream.writeVarInt(value.actions.length);

    // Iterate through the actions.
    for (const transaction of value.actions) {
      // Write the container id.
      stream.writeUint8(transaction.containerId);

      // Write the number of changed slots.
      stream.writeVarInt(transaction.changedSlots.length);

      // Iterate through the changed slots.
      for (const changedSlot of transaction.changedSlots) {
        // Write the changed slot.
        stream.writeUint8(changedSlot);
      }
    }
  }
}

export { LegacyTransaction };
