import { BinaryStream, Endianness, DataType } from "@serenityjs/binarystream";

class CameraFadeDuration extends DataType {
  public fadeInTime: number;
  public holdTime: number;
  public fadeOutTime: number;

  public constructor(fadeIn: number, holdDuration: number, fadeOut: number) {
    super();
    this.fadeInTime = fadeIn;
    this.holdTime = holdDuration;
    this.fadeOutTime = fadeOut;
  }

  public static write(stream: BinaryStream, value: CameraFadeDuration): void {
    stream.writeFloat32(value.fadeInTime, Endianness.Little);
    stream.writeFloat32(value.holdTime, Endianness.Little);
    stream.writeFloat32(value.fadeOutTime, Endianness.Little);
  }
}

export { CameraFadeDuration };
