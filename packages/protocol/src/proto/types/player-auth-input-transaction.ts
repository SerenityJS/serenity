import { BinaryStream, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

import { InputData } from "../../enums";

import { InputTransaction } from "./input-transaction";

import type { PlayerAuthInputData } from "./player-auth-input-data";

export class PlayerAuthInputTransaction extends DataType {
  public inputTransaction: InputTransaction;

  public constructor(inputTransaction: InputTransaction) {
    super();
    this.inputTransaction = inputTransaction;
  }

  public static write(
    stream: BinaryStream,
    value: InputTransaction,
    options: PacketDataTypeOptions<PlayerAuthInputData>
  ) {
    // Since v2168, the transaction is an optional with a presence flag,
    // which is set when the input data has the item interaction flag
    const present =
      options.parameter?.hasFlag(InputData.PerformItemInteraction) ?? false;
    stream.writeBool(present);
    if (present) InputTransaction.write(stream, value);
  }

  public static read(
    stream: BinaryStream,
    _options?: PacketDataTypeOptions<PlayerAuthInputData>
  ): InputTransaction | null {
    // Since v2168, the transaction is an optional with a presence flag
    if (!stream.readBool()) return null;
    return InputTransaction.read(stream);
  }
}
