import { Proto, Serialize } from "@serenityjs/raknet";
import { CompoundTag } from "@serenityjs/nbt";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

/**
 * Sends the jigsaw structure rules used by client side jigsaw structure world generation.
 * Clients disconnect ("Missing structure data from server") if this is not sent before the StartGame packet.
 */
@Proto(Packet.JigsawStructureData)
class JigsawStructureDataPacket extends DataPacket {
  /**
   * The jigsaw structure rules, holding the "processors", "template_pools", "jigsaws" and "structure_sets" lists.
   */
  @Serialize(CompoundTag, { varint: true }) public data!: CompoundTag;
}

export { JigsawStructureDataPacket };
