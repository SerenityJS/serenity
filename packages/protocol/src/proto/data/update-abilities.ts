import { Endianness, Int64, Uint8 } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import {
  type CommandPermissionLevel,
  Packet,
  type PermissionLevel
} from "../../enums";
import { AbilityLayer } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdateAbilities)
class UpdateAbilitiesPacket extends DataPacket {
  @Serialize(Int64, { endian: Endianness.Little })
  public entityUniqueId!: bigint;

  @Serialize(Uint8) public permissionLevel!: PermissionLevel;
  @Serialize(Uint8) public commandPermissionLevel!: CommandPermissionLevel;
  @Serialize(AbilityLayer) public abilities!: Array<AbilityLayer>;
}

export { UpdateAbilitiesPacket };
