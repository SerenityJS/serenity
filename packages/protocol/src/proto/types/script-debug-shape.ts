import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { ScriptDebugShapeType } from "../../enums";

import { Color } from "./color";
import { Vector2f } from "./vector2f";
import { Vector3f } from "./vector3f";

class ScriptDebugShape extends DataType {
  public readonly runtimeId: bigint;
  public type?: ScriptDebugShapeType;
  public location?: Vector3f;
  public scale?: number;
  public rotation?: Vector3f;
  public totalTimeLeft?: number;
  public color?: Color;
  public text?: string;
  public boxBound?: Vector3f;
  public lineEndLocation?: Vector3f;
  public arrowHeadLength?: number;
  public arrowHeadRadius?: number;
  public numSegments?: number;
  public cylinderRadiusX?: Vector2f;
  public cylinderRadiusZ?: Vector2f;
  public cylinderHeight?: number;
  public pyramidWidth?: number;
  public pyramidDepth?: number;
  public pyramidHeight?: number;
  public ellipsoidRadii?: Vector3f;
  public ellipsoidSegmentsPerAxis?: number;
  public coneRadii?: Vector2f;
  public coneHeight?: number;

  public constructor(
    runtimeId: bigint,
    type?: ScriptDebugShapeType,
    location?: Vector3f,
    scale?: number,
    rotation?: Vector3f,
    totalTimeLeft?: number,
    color?: Color,
    text?: string,
    boxBound?: Vector3f,
    lineEndLocation?: Vector3f,
    arrowHeadLength?: number,
    arrowHeadRadius?: number,
    numSegments?: number,
    cylinderRadiusX?: Vector2f,
    cylinderRadiusZ?: Vector2f,
    cylinderHeight?: number,
    pyramidWidth?: number,
    pyramidDepth?: number,
    pyramidHeight?: number,
    ellipsoidRadii?: Vector3f,
    ellipsoidSegmentsPerAxis?: number,
    coneRadii?: Vector2f,
    coneHeight?: number
  ) {
    super();
    this.runtimeId = runtimeId;
    this.type = type;
    this.location = location;
    this.scale = scale;
    this.rotation = rotation;
    this.totalTimeLeft = totalTimeLeft;
    this.color = color;
    this.text = text;
    this.boxBound = boxBound;
    this.lineEndLocation = lineEndLocation;
    this.arrowHeadLength = arrowHeadLength;
    this.arrowHeadRadius = arrowHeadRadius;
    this.numSegments = numSegments;
    this.cylinderRadiusX = cylinderRadiusX;
    this.cylinderRadiusZ = cylinderRadiusZ;
    this.cylinderHeight = cylinderHeight;
    this.pyramidWidth = pyramidWidth;
    this.pyramidDepth = pyramidDepth;
    this.pyramidHeight = pyramidHeight;
    this.ellipsoidRadii = ellipsoidRadii;
    this.ellipsoidSegmentsPerAxis = ellipsoidSegmentsPerAxis;
    this.coneRadii = coneRadii;
    this.coneHeight = coneHeight;
  }

  public static read(stream: BinaryStream): Array<ScriptDebugShape> {
    const shapes: Array<ScriptDebugShape> = [];
    const amount = stream.readVarInt();

    for (let i = 0; i < amount; i++) {
      const runtimeId = stream.readVarLong();
      const shape = new this(runtimeId);

      if (stream.readBool()) {
        shape.type = stream.readUint8();
      }

      if (stream.readBool()) {
        shape.location = Vector3f.read(stream);
      }

      if (stream.readBool()) {
        shape.scale = stream.readFloat32(Endianness.Little);
      }

      if (stream.readBool()) {
        shape.rotation = Vector3f.read(stream);
      }

      if (stream.readBool()) {
        shape.totalTimeLeft = stream.readFloat32(Endianness.Little);
      }

      if (stream.readBool()) {
        shape.color = Color.read(stream);
      }

      if (stream.readBool()) {
        shape.text = stream.readVarString();
      }

      if (stream.readBool()) {
        shape.boxBound = Vector3f.read(stream);
      }

      if (stream.readBool()) {
        shape.lineEndLocation = Vector3f.read(stream);
      }

      if (stream.readBool()) {
        shape.arrowHeadLength = stream.readFloat32(Endianness.Little);
      }

      if (stream.readBool()) {
        shape.arrowHeadRadius = stream.readFloat32(Endianness.Little);
      }

      if (stream.readBool()) {
        shape.numSegments = stream.readUint8();
      }

      if (stream.readBool()) {
        shape.cylinderRadiusX = Vector2f.read(stream);
      }

      if (stream.readBool()) {
        shape.cylinderRadiusZ = Vector2f.read(stream);
      }

      if (stream.readBool()) {
        shape.cylinderHeight = stream.readFloat32(Endianness.Little);
      }

      if (stream.readBool()) {
        shape.pyramidWidth = stream.readFloat32(Endianness.Little);
      }

      if (stream.readBool()) {
        shape.pyramidDepth = stream.readFloat32(Endianness.Little);
      }

      if (stream.readBool()) {
        shape.pyramidHeight = stream.readFloat32(Endianness.Little);
      }

      if (stream.readBool()) {
        shape.ellipsoidRadii = Vector3f.read(stream);
      }

      if (stream.readBool()) {
        shape.ellipsoidSegmentsPerAxis = stream.readUint8();
      }

      if (stream.readBool()) {
        shape.coneRadii = Vector2f.read(stream);
      }

      if (stream.readBool()) {
        shape.coneHeight = stream.readFloat32(Endianness.Little);
      }

      shapes.push(shape);
    }

    return shapes;
  }

  public static write(
    stream: BinaryStream,
    value: Array<ScriptDebugShape>
  ): void {
    stream.writeVarInt(value.length);

    for (const shape of value) {
      stream.writeVarLong(shape.runtimeId);

      if (shape.type !== undefined) {
        stream.writeBool(true);
        stream.writeUint8(shape.type);
      } else {
        stream.writeBool(false);
      }

      if (shape.location) {
        stream.writeBool(true);
        Vector3f.write(stream, shape.location);
      } else {
        stream.writeBool(false);
      }

      if (shape.scale !== undefined) {
        stream.writeBool(true);
        stream.writeFloat32(shape.scale, Endianness.Little);
      } else {
        stream.writeBool(false);
      }

      if (shape.rotation) {
        stream.writeBool(true);
        Vector3f.write(stream, shape.rotation);
      } else {
        stream.writeBool(false);
      }

      if (shape.totalTimeLeft !== undefined) {
        stream.writeBool(true);
        stream.writeFloat32(shape.totalTimeLeft, Endianness.Little);
      } else {
        stream.writeBool(false);
      }

      if (shape.color) {
        stream.writeBool(true);
        Color.write(stream, shape.color);
      } else {
        stream.writeBool(false);
      }

      if (shape.text !== undefined) {
        stream.writeBool(true);
        stream.writeVarString(shape.text);
      } else {
        stream.writeBool(false);
      }

      if (shape.boxBound) {
        stream.writeBool(true);
        Vector3f.write(stream, shape.boxBound);
      } else {
        stream.writeBool(false);
      }

      if (shape.lineEndLocation) {
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

      if (shape.cylinderRadiusX) {
        stream.writeBool(true);
        Vector2f.write(stream, shape.cylinderRadiusX);
      } else {
        stream.writeBool(false);
      }

      if (shape.cylinderRadiusZ) {
        stream.writeBool(true);
        Vector2f.write(stream, shape.cylinderRadiusZ);
      } else {
        stream.writeBool(false);
      }

      if (shape.cylinderHeight !== undefined) {
        stream.writeBool(true);
        stream.writeFloat32(shape.cylinderHeight, Endianness.Little);
      } else {
        stream.writeBool(false);
      }

      if (shape.pyramidWidth !== undefined) {
        stream.writeBool(true);
        stream.writeFloat32(shape.pyramidWidth, Endianness.Little);
      } else {
        stream.writeBool(false);
      }

      if (shape.pyramidDepth !== undefined) {
        stream.writeBool(true);
        stream.writeFloat32(shape.pyramidDepth, Endianness.Little);
      } else {
        stream.writeBool(false);
      }

      if (shape.pyramidHeight !== undefined) {
        stream.writeBool(true);
        stream.writeFloat32(shape.pyramidHeight, Endianness.Little);
      } else {
        stream.writeBool(false);
      }

      if (shape.ellipsoidRadii) {
        stream.writeBool(true);
        Vector3f.write(stream, shape.ellipsoidRadii);
      } else {
        stream.writeBool(false);
      }

      if (shape.ellipsoidSegmentsPerAxis !== undefined) {
        stream.writeBool(true);
        stream.writeUint8(shape.ellipsoidSegmentsPerAxis);
      } else {
        stream.writeBool(false);
      }

      if (shape.coneRadii) {
        stream.writeBool(true);
        Vector2f.write(stream, shape.coneRadii);
      } else {
        stream.writeBool(false);
      }

      if (shape.coneHeight !== undefined) {
        stream.writeBool(true);
        stream.writeFloat32(shape.coneHeight, Endianness.Little);
      } else {
        stream.writeBool(false);
      }
    }
  }
}

export { ScriptDebugShape };
