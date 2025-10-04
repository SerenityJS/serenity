import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { Vector3f } from "./vector3f";
import { Vector2f } from "./vector2f";
import { OptionalIO } from "./optional";
import { CameraPresetAimAssistDefinition } from "./camera-preset-aim-assist-definition";

import type { CameraAudioListener, CameraControlScheme } from "../../enums";

class CameraPreset extends DataType {
  public name: string;
  public parent: string;
  public position?: Vector3f;
  public rotation?: Vector2f;
  public rotationSpeed?: number;
  public snapToTarget?: boolean;
  public horizontalRotationLimit?: Vector2f;
  public verticalRotationLimit?: Vector2f;
  public continueTargeting?: boolean;
  public blockListeningRadius?: number;
  public viewOffset?: Vector2f;
  public entityOffset?: Vector3f;
  public radius?: number;
  public yawLimitMin?: number;
  public yawLimitMax?: number;
  public listener?: CameraAudioListener;
  public effects?: boolean;
  public aimAssist?: CameraPresetAimAssistDefinition;
  public controlScheme?: CameraControlScheme;

  public constructor(
    name: string,
    parent: string,
    position?: Vector3f,
    rotation?: Vector2f,
    rotationSpeed?: number,
    snapToTarget?: boolean,
    horizontalRotationLimit?: Vector2f,
    verticalRotationLimit?: Vector2f,
    continueTargeting?: boolean,
    blockListeningRadius?: number,
    viewOffset?: Vector2f,
    entityOffset?: Vector3f,
    radius?: number,
    yawLimitMin?: number,
    yawLimitMax?: number,
    listener?: CameraAudioListener,
    effects?: boolean,
    aimAssist?: CameraPresetAimAssistDefinition,
    controlScheme?: CameraControlScheme
  ) {
    super();
    this.name = name;
    this.parent = parent;
    this.position = position;
    this.rotation = rotation;
    this.rotationSpeed = rotationSpeed;
    this.snapToTarget = snapToTarget;
    this.horizontalRotationLimit = horizontalRotationLimit;
    this.verticalRotationLimit = verticalRotationLimit;
    this.continueTargeting = continueTargeting;
    this.blockListeningRadius = blockListeningRadius;
    this.viewOffset = viewOffset;
    this.entityOffset = entityOffset;
    this.radius = radius;
    this.yawLimitMin = yawLimitMin;
    this.yawLimitMax = yawLimitMax;
    this.listener = listener;
    this.effects = effects;
    this.aimAssist = aimAssist;
    this.controlScheme = controlScheme;
  }

  public static write(
    stream: BinaryStream,
    presets: Array<CameraPreset>
  ): void {
    stream.writeVarInt(presets.length);
    for (const preset of presets) {
      stream.writeVarString(preset.name);
      stream.writeVarString(preset.parent);

      OptionalIO.write(
        stream,
        (_, value) => stream.writeFloat32(value, Endianness.Little),
        preset.position?.x
      ); // position x

      OptionalIO.write(
        stream,
        (_, value) => stream.writeFloat32(value, Endianness.Little),
        preset.position?.y
      ); // position y

      OptionalIO.write(
        stream,
        (_, value) => stream.writeFloat32(value, Endianness.Little),
        preset.position?.z
      ); // position z

      OptionalIO.write(
        stream,
        (_, value) => stream.writeFloat32(value, Endianness.Little),
        preset.rotation?.x
      ); // rotation x

      OptionalIO.write(
        stream,
        (_, value) => stream.writeFloat32(value, Endianness.Little),
        preset.rotation?.y
      ); // rotation y

      OptionalIO.write<number>(
        stream,
        (_, value) => stream.writeFloat32(value, Endianness.Little),
        preset.rotationSpeed
      ); // speed

      OptionalIO.write<boolean>(
        stream,
        (_, value) => stream.writeBool(value),
        preset.snapToTarget
      ); // snapToTarget

      OptionalIO.write<Vector2f>(
        stream,
        Vector2f.write,
        preset.horizontalRotationLimit
      );

      OptionalIO.write<Vector2f>(
        stream,
        Vector2f.write,
        preset.verticalRotationLimit
      );

      OptionalIO.write<boolean>(
        stream,
        (_, value) => stream.writeBool(value),
        preset.continueTargeting
      );

      OptionalIO.write<number>(
        stream,
        (_, value) => stream.writeFloat32(value, Endianness.Little),
        preset.blockListeningRadius
      );

      OptionalIO.write<Vector2f>(stream, Vector2f.write, preset.viewOffset); // viewOffset

      OptionalIO.write<Vector3f>(stream, Vector3f.write, preset.entityOffset); // entityOffset

      OptionalIO.write<number>(
        stream,
        (_, value) => stream.writeFloat32(value, Endianness.Little),
        preset.radius
      ); // radius

      OptionalIO.write<number>(
        stream,
        (_, value) => stream.writeFloat32(value, Endianness.Little),
        preset.yawLimitMin
      );

      OptionalIO.write<number>(
        stream,
        (_, value) => stream.writeFloat32(value, Endianness.Little),
        preset.yawLimitMax
      );

      OptionalIO.write<number>(
        stream,
        (_, value) => stream.writeUint8(value),
        preset.listener
      ); // listener

      OptionalIO.write<boolean>(
        stream,
        (_, value) => stream.writeBool(value),
        preset.effects
      ); // effects

      OptionalIO.write<CameraPresetAimAssistDefinition>(
        stream,
        CameraPresetAimAssistDefinition.write,
        preset.aimAssist
      );

      OptionalIO.write<number>(
        stream,
        (_, value) => stream.writeUint8(value),
        preset.controlScheme
      );
    }
  }
}

export { CameraPreset };
