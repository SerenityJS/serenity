import {
  Endianness,
  Uint64,
  ZigZag,
  VarString
} from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { type NpcDialogueAction, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.NpcDialogue)
class NpcDialoguePacket extends DataPacket {
  @Serialize(Uint64, Endianness.Little) public uniqueEntityId!: bigint;
  @Serialize(ZigZag) public action!: NpcDialogueAction;
  @Serialize(VarString) public dialogue!: string;
  @Serialize(VarString) public scene!: string;
  @Serialize(VarString) public name!: string;
  @Serialize(VarString) public json!: string;
}

export { NpcDialoguePacket };
