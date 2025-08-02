import { PacketDataTypeOptions } from "@serenityjs/raknet";
import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { InteractAction } from "../../enums";

import { Vector3f } from "./vector3f";

class InteractPosition extends DataType {
  public static read(
    stream: BinaryStream,
    options?: PacketDataTypeOptions<InteractAction>
  ): Vector3f | null {
    // Check if the action is InteractUpdate or StopRiding.
    if (
      options?.parameter === InteractAction.InteractUpdate ||
      options?.parameter === InteractAction.StopRiding
    ) {
      return Vector3f.read(stream);
    }

    // Return null if the action is not InteractUpdate or StopRiding.
    return null;
  }

  public static write(
    stream: BinaryStream,
    value: Vector3f,
    options?: PacketDataTypeOptions<InteractAction>
  ): void {
    // Check if the action is InteractUpdate or StopRiding.
    if (
      options?.parameter === InteractAction.InteractUpdate ||
      options?.parameter === InteractAction.StopRiding
    ) {
      Vector3f.write(stream, value);
    }
  }
}

export { InteractPosition };
