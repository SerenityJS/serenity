import { Proto, Serialize } from "@serenityjs/raknet";
import { Endianness, Float32 } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ServerboundDiagnosticPacket)
class ServerboundDiagnosticsPacket extends DataPacket {
  @Serialize(Float32, Endianness.Little) public fps!: number;
  @Serialize(Float32, Endianness.Little) public serverSimTickTime!: number;
  @Serialize(Float32, Endianness.Little) public clientSimTickTime!: number;
  @Serialize(Float32, Endianness.Little) public beginFrameTime!: number;
  @Serialize(Float32, Endianness.Little) public inputTime!: number;
  @Serialize(Float32, Endianness.Little) public renderTime!: number;
  @Serialize(Float32, Endianness.Little) public endFrameTime!: number;
  @Serialize(Float32, Endianness.Little) public remainderTimePercent!: number;
  @Serialize(Float32, Endianness.Little) public unaccountedTimePercent!: number;
}

export { ServerboundDiagnosticsPacket };
