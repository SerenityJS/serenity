import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { Vector2f } from "./vector2f";
import { Vector3f } from "./vector3f";

interface CameraSplineInstructionRotation {
  keyframeValues: Vector3f;
  keyframeTimes: number;
}

class CameraSplineInstruction extends DataType {
  public totalTime: number;
  public type: number;
  public curve: Vector3f;
  public progressKeyframes: Vector2f;
  public rotationOption: Array<CameraSplineInstructionRotation>;

  public constructor(
    totalTime: number,
    type: number,
    curve: Vector3f,
    progressKeyframes: Vector2f,
    rotationOption: Array<CameraSplineInstructionRotation>
  ) {
    super();

    this.totalTime = totalTime;
    this.type = type;
    this.curve = curve;
    this.progressKeyframes = progressKeyframes;
    this.rotationOption = rotationOption;
  }

  public static write(
    stream: BinaryStream,
    value: CameraSplineInstruction
  ): void {
    stream.writeFloat32(value.totalTime);
    stream.writeUint8(value.type);
    Vector3f.write(stream, value.curve);
    Vector2f.write(stream, value.progressKeyframes);

    stream.writeVarInt(value.rotationOption.length);
    for (const { keyframeValues, keyframeTimes } of value.rotationOption) {
      Vector3f.write(stream, keyframeValues);
      stream.writeFloat32(keyframeTimes);
    }
  }
}

export { CameraSplineInstruction, CameraSplineInstructionRotation };
