import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { CameraSetInstruction } from "./camera-instruction-set";
import { CameraFadeInstruction } from "./camera-instruction-fade";
import { OptionalIO } from "./optional";
import { CameraTargetInstruction } from "./camera-instruction-target";
import { CameraFOVInstruction } from "./camera-instruction-fov";

class CameraInstructions extends DataType {
  public Set?: CameraSetInstruction;
  public Clear?: boolean;
  public Fade?: CameraFadeInstruction;
  public Target?: CameraTargetInstruction;
  public RemoveTarget?: boolean;
  public FOV?: CameraFOVInstruction;

  public constructor(
    Set?: CameraSetInstruction,
    Clear?: boolean,
    Fade?: CameraFadeInstruction,
    Target?: CameraTargetInstruction,
    RemoveTarget?: boolean,
    FOV?: CameraFOVInstruction
  ) {
    super();
    this.Set = Set;
    this.Clear = Clear;
    this.Fade = Fade;
    this.Target = Target;
    this.RemoveTarget = RemoveTarget;
    this.FOV = FOV;
  }

  public static write(stream: BinaryStream, value: CameraInstructions): void {
    OptionalIO.write<CameraSetInstruction>(
      stream,
      CameraSetInstruction.write,
      value.Set
    );

    OptionalIO.write<boolean>(
      stream,
      (_, value) => stream.writeBool(value),
      value.Clear
    );

    OptionalIO.write<CameraFadeInstruction>(
      stream,
      CameraFadeInstruction.write,
      value.Fade
    );

    OptionalIO.write<CameraTargetInstruction>(
      stream,
      CameraTargetInstruction.write,
      value.Target
    );

    OptionalIO.write<boolean>(
      stream,
      (_, value) => stream.writeBool(value),
      value.RemoveTarget
    );

    OptionalIO.write<CameraFOVInstruction>(
      stream,
      CameraFOVInstruction.write,
      value.FOV
    );
  }
}

export { CameraInstructions };
