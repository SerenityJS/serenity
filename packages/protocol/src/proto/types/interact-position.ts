import { DataType } from "@serenityjs/raknet";

import { InteractAction } from "../../enums";

import { Vector3f } from "./vector3f";

import type { BinaryStream } from "@serenityjs/binarystream";

class InteractPosition extends DataType {
  public static read(
    stream: BinaryStream,
    _: 0,
    action: InteractAction
  ): Vector3f | null {
    // Check if the action is InteractUpdate or StopRiding.
    if (
      action === InteractAction.InteractUpdate ||
      action === InteractAction.StopRiding
    ) {
      return Vector3f.read(stream);
    }

    // Return null if the action is not InteractUpdate or StopRiding.
    return null;
  }

  public static write(
    stream: BinaryStream,
    value: Vector3f,
    _: 0,
    action: InteractAction
  ): void {
    // Check if the action is InteractUpdate or StopRiding.
    if (
      action === InteractAction.InteractUpdate ||
      action === InteractAction.StopRiding
    ) {
      Vector3f.write(stream, value);
    }
  }
}

export { InteractPosition };
