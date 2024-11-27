import { DataType } from "@serenityjs/raknet";
import { BinaryStream } from "@serenityjs/binarystream";

import { PlayerAuthInputData } from "../../../dist";
import { InputData } from "../../enums";

import { PackedLegacyTransaction } from "./packed-legacy-transaction";

class PackedItemUseLegacyInventoryTransaction extends DataType {
  /**
   * The id of the transaction.
   */
  public readonly id: number;

  /**
   * The legacy transactions of the transaction.
   */
  public readonly transactions: Array<PackedLegacyTransaction>;

  /**
   * Create a new PackedItemUseLegacyInventoryTransaction.
   * @param id The id of the transaction.
   * @param transactions The legacy transactions of the transaction.
   */
  public constructor(id: number, transactions: Array<PackedLegacyTransaction>) {
    super();
    this.id = id;
    this.transactions = transactions;
  }

  public static read(
    stream: BinaryStream,
    _: unknown,
    data: PlayerAuthInputData
  ): PackedItemUseLegacyInventoryTransaction | null {
    // Check if the input data has the item interaction flag
    if (!data.hasFlag(InputData.PerformItemInteraction)) return null;

    // Read the id of the transaction
    const id = stream.readZigZag();

    // Prepare an array to store the legacy transactions
    const transactions: Array<PackedLegacyTransaction> = [];

    // Check if the id is not 0
    if (id !== 0) {
      // Read the amount of legacy transactions
      const amount = stream.readVarInt();

      // Loop through the amount of legacy transactions
      for (let index = 0; index < amount; index++) {
        // Read the legacy transaction
        const transaction = PackedLegacyTransaction.read(stream);

        // Push the legacy transaction to the array
        transactions.push(transaction);
      }
    }

    // Return a new PackedItemUseLegacyInventoryTransaction
    return new this(id, transactions);
  }

  public static write(
    stream: BinaryStream,
    value: PackedItemUseLegacyInventoryTransaction,
    _: unknown,
    data: PlayerAuthInputData
  ): void {
    // Check if the input data has the item interaction flag
    if (!data.hasFlag(InputData.PerformItemInteraction)) return;

    // Write the id of the transaction
    stream.writeZigZag(value.id);

    // Check if the id is not 0
    if (value.id !== 0) {
      // Write the amount of legacy transactions
      stream.writeVarInt(value.transactions.length);

      // Loop through the legacy transactions
      for (const transaction of value.transactions) {
        // Write the legacy transaction
        PackedLegacyTransaction.write(stream, transaction);
      }
    }
  }
}

export { PackedItemUseLegacyInventoryTransaction };
