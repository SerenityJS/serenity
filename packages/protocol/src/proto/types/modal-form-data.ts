import { PacketDataTypeOptions } from "@serenityjs/raknet";
import { BinaryStream, DataType } from "@serenityjs/binarystream";

class ModalFormData extends DataType {
  public static override read(
    stream: BinaryStream,
    options?: PacketDataTypeOptions<boolean>
  ): string | null {
    // Check if the response is true.
    return options?.parameter ? stream.readVarString() : null;
  }

  public static override write(
    stream: BinaryStream,
    value: string | null,
    options?: PacketDataTypeOptions<boolean>
  ): void {
    // Check if the response is true.
    if (options?.parameter) {
      // Write the id field.
      stream.writeVarString(value!);
    }
  }
}

export { ModalFormData };
