import { Proto, Serialize } from "@serenityjs/raknet";
import { Endianness, Float32, VarInt } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import {
  EntityDiagnosticTimingInfo,
  MemoryCategoryCounter,
  SystemDiagnosticTimingInfo,
  TypeArray,
  WhiskerScopeDataSummary
} from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ServerboundDiagnosticPacket)
class ServerboundDiagnosticsPacket extends DataPacket {
  @Serialize(Float32, { endian: Endianness.Little }) public fps!: number;
  @Serialize(Float32, { endian: Endianness.Little })
  public serverSimTickTime!: number;
  @Serialize(Float32, { endian: Endianness.Little })
  public clientSimTickTime!: number;
  @Serialize(Float32, { endian: Endianness.Little })
  public beginFrameTime!: number;
  @Serialize(Float32, { endian: Endianness.Little }) public inputTime!: number;
  @Serialize(Float32, { endian: Endianness.Little }) public renderTime!: number;
  @Serialize(Float32, { endian: Endianness.Little })
  public endFrameTime!: number;
  @Serialize(Float32, { endian: Endianness.Little })
  public remainderTimePercent!: number;
  @Serialize(Float32, { endian: Endianness.Little })
  public unaccountedTimePercent!: number;
  @Serialize(TypeArray(MemoryCategoryCounter, VarInt))
  public memoryCategoryValues!: Array<MemoryCategoryCounter>;
  @Serialize(TypeArray(EntityDiagnosticTimingInfo, VarInt))
  public entityDiagnostics!: Array<EntityDiagnosticTimingInfo>;
  @Serialize(TypeArray(SystemDiagnosticTimingInfo, VarInt))
  public systemDiagnostics!: Array<SystemDiagnosticTimingInfo>;
  @Serialize(TypeArray(WhiskerScopeDataSummary, VarInt))
  public whiskerScopes!: Array<WhiskerScopeDataSummary>;
}

export { ServerboundDiagnosticsPacket };
