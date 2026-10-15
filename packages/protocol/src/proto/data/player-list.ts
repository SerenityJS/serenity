import { Proto } from "@serenityjs/raknet";

import { Packet, PlayerListAction } from "../../enums";
import { PlayerListRecord } from "../types";

import { DataPacket } from "./data-packet";

/**
 * Adds or removes players from the player list.
 * Since v2168, the action is written per entry instead of once for the packet.
 */
@Proto(Packet.PlayerList)
class PlayerListPacket extends DataPacket {
  /**
   * The action that applies to every record in the packet.
   */
  public action!: PlayerListAction;

  /**
   * The records of the players to add or remove.
   */
  public records!: Array<PlayerListRecord>;

  public override serialize(): Buffer {
    // Reset the offset, as the same packet may be serialized more than once (e.g. when broadcasting)
    this.offset = 0;

    // Write the packet id
    this.writeVarInt(Packet.PlayerList);

    // Write the records, each entry carrying the action of the packet
    PlayerListRecord.write(this, this.records, { parameter: this.action });

    return this.getBuffer();
  }

  public override deserialize(): this {
    // Read the packet id
    this.readVarInt();

    // Read the amount of entries
    const length = this.readVarInt();

    // Prepare the records, and default the action to add
    this.records = [];
    this.action = PlayerListAction.Add;

    // Read each entry, using the action of the last entry for the packet
    for (let index = 0; index < length; index++) {
      const [action, record] = PlayerListRecord.readEntry(this);
      this.action = action;
      this.records.push(record);
    }

    return this;
  }
}

export { PlayerListPacket };
