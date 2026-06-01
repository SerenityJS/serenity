import { BinaryStream, Endianness, DataType } from "@serenityjs/binarystream";

import { ScriptDebugShapeType } from "../../enums";

import { Vector3f } from "./vector3f";
import { Color } from "./color";

class ScriptDebugShape extends DataType {
  public readonly runtimeId: bigint;
  public type?: ScriptDebugShapeType;
  public location?: Vector3f;
  public scale?: number;
  public rotation?: Vector3f;
  public totalTimeLeft?: number;
  public color?: Color;
  public dimensionId?: number;
  public attachedToEntityId?: bigint;
  public text?: string;
  public boxBound?: Vector3f;
  public lineEndLocation?: Vector3f;
  public arrowHeadLength?: number;
  public arrowHeadRadius?: number;
  public numSegments?: number;

  public constructor(
    runtimeId: bigint,
    type?: ScriptDebugShapeType,
    location?: Vector3f,
    scale?: number,
    rotation?: Vector3f,
    totalTimeLeft?: number,
    color?: Color,
    dimensionId?: number,
    attachedToEntityId?: bigint,
    text?: string,
    boxBound?: Vector3f,
    lineEndLocation?: Vector3f,
    arrowHeadLength?: number,
    arrowHeadRadius?: number,
    numSegments?: number
  ) {
    super();
    this.runtimeId = runtimeId;
    this.type = type;
    this.location = location;
    this.scale = scale;
    this.rotation = rotation;
    this.totalTimeLeft = totalTimeLeft;
    this.color = color;
    this.dimensionId = dimensionId;
    this.attachedToEntityId = attachedToEntityId;
    this.text = text;
    this.boxBound = boxBound;
    this.lineEndLocation = lineEndLocation;
    this.arrowHeadLength = arrowHeadLength;
    this.arrowHeadRadius = arrowHeadRadius;
    this.numSegments = numSegments;
  }

  public static read(stream: BinaryStream): Array<ScriptDebugShape> {
    const PAYLOAD_NONE = 0;
    const PAYLOAD_ARROW = 1;
    const PAYLOAD_TEXT = 2;
    const PAYLOAD_BOX = 3;
    const PAYLOAD_LINE = 4;
    const PAYLOAD_CIRCLE_OR_SPHERE = 5;

    // Prepare the array to hold the shapes
    const shapes: Array<ScriptDebugShape> = [];

    // Read the number of shapes
    const amount = stream.readVarInt();

    // Loop through the number of shapes
    for (let i = 0; i < amount; i++) {
      // Read the shape runtime id
      const runtimeId = stream.readVarLong();

      // Create a new shape
      const shape = new this(runtimeId);

      // Check if the shape contains a type
      if (stream.readBool()) {
        // Read the shape type
        shape.type = stream.readUint8();
      }

      // Check if the shape contains a location
      if (stream.readBool()) {
        // Read the shape location
        shape.location = Vector3f.read(stream);
      }

      // Check if the shape contains a scale
      if (stream.readBool()) {
        // Read the shape scale
        shape.scale = stream.readFloat32(Endianness.Little);
      }

      // Check if the shape contains a rotation
      if (stream.readBool()) {
        // Read the shape rotation
        shape.rotation = Vector3f.read(stream);
      }

      // Check if the shape contains a total time left
      if (stream.readBool()) {
        // Read the shape total time left
        shape.totalTimeLeft = stream.readFloat32(Endianness.Little);
      }

      // Check if the shape contains a color
      if (stream.readBool()) {
        // Read the shape color
        shape.color = Color.read(stream);
      }

      // Check if the shape contains a dimension id
      if (stream.readBool()) {
        shape.dimensionId = stream.readVarInt();
      }

      // Check if the shape contains attached actor runtime id
      if (stream.readBool()) {
        shape.attachedToEntityId = stream.readVarLong();
      }

      const payloadType = stream.readVarInt();
      switch (payloadType) {
        case PAYLOAD_NONE:
          break;
        case PAYLOAD_ARROW:
          if (stream.readBool()) shape.lineEndLocation = Vector3f.read(stream);
          if (stream.readBool()) {
            shape.arrowHeadLength = stream.readFloat32(Endianness.Little);
          }
          if (stream.readBool()) {
            shape.arrowHeadRadius = stream.readFloat32(Endianness.Little);
          }
          if (stream.readBool()) shape.numSegments = stream.readUint8();
          break;
        case PAYLOAD_TEXT:
          shape.text = stream.readVarString();
          break;
        case PAYLOAD_BOX:
          shape.boxBound = Vector3f.read(stream);
          break;
        case PAYLOAD_LINE:
          shape.lineEndLocation = Vector3f.read(stream);
          break;
        case PAYLOAD_CIRCLE_OR_SPHERE:
          shape.numSegments = stream.readUint8();
          break;
      }

      // Add the shape to the array
      shapes.push(shape);
    }

    // Read the shapes that were read
    return shapes;
  }

  public static write(
    stream: BinaryStream,
    value: Array<ScriptDebugShape>
  ): void {
    const PAYLOAD_NONE = 0;
    const PAYLOAD_ARROW = 1;
    const PAYLOAD_TEXT = 2;
    const PAYLOAD_BOX = 3;
    const PAYLOAD_LINE = 4;
    const PAYLOAD_CIRCLE_OR_SPHERE = 5;

    // Write the amount of shapes
    stream.writeVarInt(value.length);

    // Loop through the shapes
    for (const shape of value) {
      // Write the shape runtime id
      stream.writeVarLong(shape.runtimeId);

      // Check if the shape contains a type
      if (shape.type !== undefined) {
        stream.writeBool(true);
        stream.writeUint8(shape.type);
      } else {
        stream.writeBool(false);
      }

      // Check if the shape contains a location
      if (shape.location) {
        stream.writeBool(true);
        Vector3f.write(stream, shape.location);
      } else {
        stream.writeBool(false);
      }

      // Check if the shape contains a scale
      if (shape.scale !== undefined) {
        stream.writeBool(true);
        stream.writeFloat32(shape.scale, Endianness.Little);
      } else {
        stream.writeBool(false);
      }

      // Check if the shape contains a rotation
      if (shape.rotation) {
        stream.writeBool(true);
        Vector3f.write(stream, shape.rotation);
      } else {
        stream.writeBool(false);
      }

      // Check if the shape contains a total time left
      if (shape.totalTimeLeft !== undefined) {
        stream.writeBool(true);
        stream.writeFloat32(shape.totalTimeLeft, Endianness.Little);
      } else {
        stream.writeBool(false);
      }

      // Check if the shape contains a color
      if (shape.color) {
        stream.writeBool(true);
        Color.write(stream, shape.color);
      } else {
        stream.writeBool(false);
      }

      // Check if the shape contains a dimension id
      if (shape.dimensionId !== undefined) {
        stream.writeBool(true);
        stream.writeVarInt(shape.dimensionId);
      } else {
        stream.writeBool(false);
      }

      // Check if the shape contains attached actor runtime id
      if (shape.attachedToEntityId !== undefined) {
        stream.writeBool(true);
        stream.writeVarLong(shape.attachedToEntityId);
      } else {
        stream.writeBool(false);
      }

      const type = shape.type;
      if (type === undefined) {
        stream.writeVarInt(PAYLOAD_NONE);
        continue;
      }

      switch (type) {
        case ScriptDebugShapeType.Arrow:
          stream.writeVarInt(PAYLOAD_ARROW);
          if (shape.lineEndLocation !== undefined) {
            stream.writeBool(true);
            Vector3f.write(stream, shape.lineEndLocation);
          } else {
            stream.writeBool(false);
          }
          if (shape.arrowHeadLength !== undefined) {
            stream.writeBool(true);
            stream.writeFloat32(shape.arrowHeadLength, Endianness.Little);
          } else {
            stream.writeBool(false);
          }
          if (shape.arrowHeadRadius !== undefined) {
            stream.writeBool(true);
            stream.writeFloat32(shape.arrowHeadRadius, Endianness.Little);
          } else {
            stream.writeBool(false);
          }
          if (shape.numSegments !== undefined) {
            stream.writeBool(true);
            stream.writeUint8(shape.numSegments);
          } else {
            stream.writeBool(false);
          }
          break;
        case ScriptDebugShapeType.Text:
          if (shape.text !== undefined) {
            stream.writeVarInt(PAYLOAD_TEXT);
            stream.writeVarString(shape.text);
          } else {
            stream.writeVarInt(PAYLOAD_NONE);
          }
          break;
        case ScriptDebugShapeType.Box:
          if (shape.boxBound !== undefined) {
            stream.writeVarInt(PAYLOAD_BOX);
            Vector3f.write(stream, shape.boxBound);
          } else {
            stream.writeVarInt(PAYLOAD_NONE);
          }
          break;
        case ScriptDebugShapeType.Line:
          if (shape.lineEndLocation !== undefined) {
            stream.writeVarInt(PAYLOAD_LINE);
            Vector3f.write(stream, shape.lineEndLocation);
          } else {
            stream.writeVarInt(PAYLOAD_NONE);
          }
          break;
        case ScriptDebugShapeType.Circle:
        case ScriptDebugShapeType.Sphere:
          if (shape.numSegments !== undefined) {
            stream.writeVarInt(PAYLOAD_CIRCLE_OR_SPHERE);
            stream.writeUint8(shape.numSegments);
          } else {
            stream.writeVarInt(PAYLOAD_NONE);
          }
          break;
        default:
          stream.writeVarInt(PAYLOAD_NONE);
      }
    }
  }
}

export { ScriptDebugShape };
