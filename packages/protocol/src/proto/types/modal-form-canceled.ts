import { BinaryStream, DataType } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

import type { ModalFormCanceledReason } from "../../enums";

class ModalFormCanceled extends DataType {
  public static override read(
    stream: BinaryStream,
    options?: PacketDataTypeOptions<boolean>
  ): ModalFormCanceledReason | null {
    // Check if the canceled is true.
    return options?.parameter ? stream.readUint8() : null;
  }

  public static override write(
    stream: BinaryStream,
    value: ModalFormCanceledReason | null,
    options?: PacketDataTypeOptions<boolean>
  ): void {
    // Check if the canceled is true.
    if (options?.parameter) {
      // Write the id field.
      stream.writeUint8(value!);
    }
  }
}

export { ModalFormCanceled };
