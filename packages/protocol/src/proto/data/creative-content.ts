import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { CreativeGroup, CreativeItem } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.CreativeContent)
class CreativeContentPacket extends DataPacket {
  /**
   * The groups that are displayed within the creative inventory menu.
   */
  @Serialize(CreativeGroup)
  public groups!: Array<CreativeGroup>;

  /**
   * The items that are displayed within the creative inventory menu, grouped by their category.
   */
  @Serialize(CreativeItem)
  public items!: Array<CreativeItem>;
}

export { CreativeContentPacket };
