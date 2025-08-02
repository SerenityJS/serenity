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
    if (!options.parameter?.hasFlag(InputData.PerformItemInteraction)) return;
    InputTransaction.write(stream, value);
  }

  public static read(
    stream: BinaryStream,
    options: PacketDataTypeOptions<PlayerAuthInputData>
  ): InputTransaction | null {
    if (!options.parameter?.hasFlag(InputData.PerformItemInteraction))
      return null;
    return InputTransaction.read(stream);
  }
}
