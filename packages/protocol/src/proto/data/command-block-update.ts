import { Proto, Serialize } from "@serenityjs/raknet";
import { Bool, Endianness, Uint32, VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { CommandBlockActorRuntimeId, CommandBlockSettings } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.CommandBlockUpdate)
class CommandBlockUpdatePacket extends DataPacket {
  @Serialize(Bool) public isBlock!: boolean;

  @Serialize(CommandBlockActorRuntimeId, { parameter: "isBlock" })
  public actorRuntimeId!: bigint | null;

  @Serialize(CommandBlockSettings, { parameter: "isBlock" })
  public settings!: CommandBlockSettings | null;

  @Serialize(VarString) public command!: string;
  @Serialize(VarString) public lastOutput!: string;
  @Serialize(VarString) public customName!: string;
  @Serialize(VarString) public filteredName!: string;
  @Serialize(Bool) public trackOutput!: boolean;
  @Serialize(Uint32, { endian: Endianness.Little }) public tickDelay!: number;
  @Serialize(Bool) public executeFirstTick!: boolean;
}

export { CommandBlockUpdatePacket };
