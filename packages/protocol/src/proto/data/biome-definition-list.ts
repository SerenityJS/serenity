import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { BiomeDefinitionList, BiomeStringList } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.BiomeDefinitionList)
class BiomeDefinitionListPacket extends DataPacket {
  /**
   * The biome definitions in the packet.
   */
  @Serialize(BiomeDefinitionList)
  public definitions!: Array<BiomeDefinitionList>;

  /**
   * The biome identifiers in the packet.
   */
  @Serialize(BiomeStringList)
  public identifiers!: Array<string>;
}

export { BiomeDefinitionListPacket };
