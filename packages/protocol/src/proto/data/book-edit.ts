import { Proto, Serialize } from "@serenityjs/raknet";
import { Uint8 } from "@serenityjs/binarystream";

import { type BookEditAction, Packet } from "../../enums";
import { BookActions } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.BookEdit)
class BookEditPacket extends DataPacket {
  @Serialize(Uint8)
  public action!: BookEditAction;

  @Serialize(Uint8)
  public bookSlot!: number;

  @Serialize(BookActions, { parameter: "action" })
  public actions!: BookActions;
}

export { BookEditPacket };
