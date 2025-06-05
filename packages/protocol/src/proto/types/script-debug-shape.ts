import { DataType } from "@serenityjs/raknet";
import { BinaryStream, Endianness } from "@serenityjs/binarystream";

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
    this.text = text;
    this.boxBound = boxBound;
    this.lineEndLocation = lineEndLocation;
    this.arrowHeadLength = arrowHeadLength;
    this.arrowHeadRadius = arrowHeadRadius;
    this.numSegments = numSegments;
  }

  public static read(stream: BinaryStream): Array<ScriptDebugShape> {
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

      // Check if the shape contains a text
      if (stream.readBool()) {
        // Read the shape text
        shape.text = stream.readVarString();
      }

      // Check if the shape contains a box bound
      if (stream.readBool()) {
        // Read the shape box bound
        shape.boxBound = Vector3f.read(stream);
      }

      // Check if the shape contains a line end location
      if (stream.readBool()) {
        // Read the shape line end location
        shape.lineEndLocation = Vector3f.read(stream);
      }

      // Check if the shape contains an arrow head length
      if (stream.readBool()) {
        // Read the shape arrow head length
        shape.arrowHeadLength = stream.readFloat32(Endianness.Little);
      }

      // Check if the shape contains an arrow head radius
      if (stream.readBool()) {
        // Read the shape arrow head radius
        shape.arrowHeadRadius = stream.readFloat32(Endianness.Little);
      }

      // Check if the shape contains a number of segments
      if (stream.readBool()) {
        // Read the shape number of segments
        shape.numSegments = stream.readUint8();
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
    // Write the amount of shapes
    stream.writeVarInt(value.length);

    // Loop through the shapes
    for (const shape of value) {
      // Write the shape runtime id
      stream.writeVarLong(shape.runtimeId);

      // Check if the shape contains a type
      if (shape.type) {
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
      if (shape.scale) {
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
      if (shape.totalTimeLeft) {
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

      // Check if the shape contains a text
      if (shape.text) {
        stream.writeBool(true);
        stream.writeVarString(shape.text);
      } else {
        stream.writeBool(false);
      }

      // Check if the shape contains a box bound
      if (shape.boxBound) {
        stream.writeBool(true);
        Vector3f.write(stream, shape.boxBound);
      } else {
        stream.writeBool(false);
      }

      // Check if the shape contains a line end location
      if (shape.lineEndLocation) {
        stream.writeBool(true);
        Vector3f.write(stream, shape.lineEndLocation);
      } else {
        stream.writeBool(false);
      }

      // Check if the shape contains an arrow head length
      if (shape.arrowHeadLength) {
        stream.writeBool(true);
        stream.writeFloat32(shape.arrowHeadLength, Endianness.Little);
      } else {
        stream.writeBool(false);
      }

      // Check if the shape contains an arrow head radius
      if (shape.arrowHeadRadius) {
        stream.writeBool(true);
        stream.writeFloat32(shape.arrowHeadRadius, Endianness.Little);
      } else {
        stream.writeBool(false);
      }

      // Check if the shape contains a number of segments
      if (shape.numSegments) {
        stream.writeBool(true);
        stream.writeUint8(shape.numSegments);
      } else {
        stream.writeBool(false);
      }
    }
  }
}

export { ScriptDebugShape };
