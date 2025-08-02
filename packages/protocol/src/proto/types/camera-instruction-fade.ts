import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { CameraFadeDuration } from "./camera-fade-duration";
import { Vector3f } from "./vector3f";

class CameraFadeInstruction extends DataType {
  public duration?: CameraFadeDuration;
  public color?: Vector3f;

  public constructor(duration?: CameraFadeDuration, color?: Vector3f) {
    super();
    this.duration = duration;
    this.color = color;
  }

  public static write(
    _stream: BinaryStream,
    _value: CameraFadeInstruction
  ): void {
    // Optional.write(stream, value.duration, undefined, null, CameraFadeDuration);
    // Optional.write(stream, value.color, undefined, null, Vector3f);
  }
}

export { CameraFadeInstruction };
