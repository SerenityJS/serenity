import { Endianness, BinaryStream, DataType } from "@serenityjs/binarystream";

import { CameraSetEasing } from "./camera-set-easing";
import { Vector3f } from "./vector3f";
import { Vector2f } from "./vector2f";
import { OptionalIO } from "./optional";

class CameraSetInstruction extends DataType {
  public runtimeId: number;
  public easing?: CameraSetEasing;
  public position?: Vector3f;
  public rotation?: Vector2f;
  public facing?: Vector3f;
  public viewOffset?: Vector2f;
  public entityOffset?: Vector3f;
  public isDefault?: boolean;
  public ignoreStartingValuesComponent: boolean;

  public constructor(
    runtimeId: number,
    ignoreStartingValuesComponent: boolean,
    easing?: CameraSetEasing,
    position?: Vector3f,
    rotation?: Vector2f,
    facing?: Vector3f,
    viewOffset?: Vector2f,
    entityOffset?: Vector3f,
    isDefault?: boolean
  ) {
    super();
    this.runtimeId = runtimeId;
    this.ignoreStartingValuesComponent = ignoreStartingValuesComponent;
    this.easing = easing;
    this.position = position;
    this.rotation = rotation;
    this.facing = facing;
    this.viewOffset = viewOffset;
    this.entityOffset = entityOffset;
    this.isDefault = isDefault;
  }

  public static write(stream: BinaryStream, value: CameraSetInstruction): void {
    stream.writeInt32(value.runtimeId, Endianness.Little);

    OptionalIO.write<CameraSetEasing>(
      stream,
      CameraSetEasing.write,
      value.easing
    );

    OptionalIO.write<Vector3f>(stream, Vector3f.write, value.position);

    OptionalIO.write<Vector2f>(stream, Vector2f.write, value.rotation);

    OptionalIO.write<Vector3f>(stream, Vector3f.write, value.facing);

    OptionalIO.write<Vector2f>(stream, Vector2f.write, value.viewOffset);

    OptionalIO.write<Vector3f>(stream, Vector3f.write, value.entityOffset);

    OptionalIO.write<boolean>(
      stream,
      (_, value) => stream.writeBool(value),
      value.isDefault
    );

    OptionalIO.write<boolean>(
      stream,
      (_, value) => stream.writeBool(value),
      value.ignoreStartingValuesComponent
    );
  }
}

export { CameraSetInstruction };
