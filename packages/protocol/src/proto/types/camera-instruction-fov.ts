import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { EasingType } from "../../enums";

class CameraFOVInstruction extends DataType {
  public fieldOfView: number;
  public easeTime: number;
  public easeType: EasingType;
  public clear: boolean;

  public constructor(
    fov: number,
    easeTime: number,
    easingType: number,
    clear: boolean
  ) {
    super();
    this.fieldOfView = fov;
    this.easeTime = easeTime;
    this.easeType = easingType;
    this.clear = clear;
  }

  public static write(stream: BinaryStream, value: CameraFOVInstruction): void {
    stream.writeFloat32(value.fieldOfView, Endianness.Little);
    stream.writeFloat32(value.easeTime, Endianness.Little);
    stream.writeUint8(value.easeType);
    stream.writeBool(value.clear);
  }
}

export { CameraFOVInstruction };
