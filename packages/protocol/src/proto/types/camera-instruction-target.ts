import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { Vector3f } from "./vector3f";
import { OptionalIO } from "./optional";

class CameraTargetInstruction extends DataType {
  public targetUniqueId: bigint;

  public cameraOffset?: Vector3f;

  public constructor(target: bigint, cameraOffset?: Vector3f) {
    super();
    this.targetUniqueId = target;
    this.cameraOffset = cameraOffset;
  }

  public static write(
    stream: BinaryStream,
    value: CameraTargetInstruction
  ): void {
    OptionalIO.write(stream, Vector3f.write, value.cameraOffset);

    stream.writeInt64(value.targetUniqueId);
  }
}

export { CameraTargetInstruction };
