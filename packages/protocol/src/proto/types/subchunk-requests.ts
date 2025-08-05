import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

export class SubChunkRequests extends DataType {
  public readonly x: number; // Int8
  public readonly y: number; // Int8
  public readonly z: number; // Int8

  constructor(x: number, y: number, z: number) {
    super();
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public static read(stream: BinaryStream): Array<SubChunkRequests> {
    let requests: Array<SubChunkRequests> = [];
    const count = stream.readUint32(Endianness.Little);
    for (let i = 0; i < count; i++) {
      requests.push(new SubChunkRequests(
        stream.readInt8(), 
        stream.readInt8(), 
        stream.readInt8())
      );
    }
    return requests;
  }

  public static write(stream: BinaryStream, value: Array<SubChunkRequests>): void {
    stream.writeUint32(value.length, Endianness.Little);
    for (const request of value) {
      stream.writeInt8(request.x);
      stream.writeInt8(request.y);
      stream.writeInt8(request.z);
    }
  }
}