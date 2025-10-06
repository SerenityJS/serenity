import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { EasingType } from "../../enums";

class CameraFOVInstruction extends DataType {
  public FieldOfView: number;
  public EaseTime: number;
  public EaseType: EasingType;
  public Clear: boolean;

  public constructor(
    fov: number,
    easeTime: number,
    easingType: number,
    clear: boolean
  ) {
    super();
    this.FieldOfView = fov;
    this.EaseTime = easeTime;
    this.EaseType = easingType;
    this.Clear = clear;
  }

  public static write(stream: BinaryStream, value: CameraFOVInstruction): void {
    stream.writeFloat32(value.FieldOfView, Endianness.Little);
    stream.writeFloat32(value.EaseTime, Endianness.Little);
    stream.writeUint8(value.EaseType);
    stream.writeBool(value.Clear);
  }
}

export { CameraFOVInstruction };
