import { Proto, Serialize } from "@serenityjs/raknet";
import { Bool, Endianness, Uint32, VarString } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { CommandBlockActorRuntimeId, CommandBlockSettings } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.CommandBlockUpdate)
class CommandBlockUpdatePacket extends DataPacket {
  @Serialize(Bool) public isBlock!: boolean;

  @Serialize(CommandBlockActorRuntimeId, 0, "isBlock") public actorRuntimeId!:
    | bigint
    | null;

  @Serialize(CommandBlockSettings, 0, "isBlock")
  public settings!: CommandBlockSettings | null;

  @Serialize(VarString) public command!: string;
  @Serialize(VarString) public lastOutput!: string;
  @Serialize(VarString) public customName!: string;
  @Serialize(Bool) public trackOutput!: boolean;
  @Serialize(Uint32, Endianness.Little) public tickDelay!: number;
  @Serialize(Bool) public executeFirstTick!: boolean;
}

export { CommandBlockUpdatePacket };
