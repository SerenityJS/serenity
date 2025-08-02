import { VarInt, Bool } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ModalFormCanceled, ModalFormData } from "../types";

import { DataPacket } from "./data-packet";

import type { ModalFormCanceledReason } from "../../enums";

@Proto(Packet.ModalFormResponse)
class ModalFormResponsePacket extends DataPacket {
  @Serialize(VarInt) public id!: number;
  @Serialize(Bool) public response!: boolean;
  @Serialize(ModalFormData, { parameter: "response" }) public data!:
    | string
    | null;

  @Serialize(Bool) public canceled!: boolean;
  @Serialize(ModalFormCanceled, { parameter: "canceled" })
  public reason!: ModalFormCanceledReason | null;
}

export { ModalFormResponsePacket };
