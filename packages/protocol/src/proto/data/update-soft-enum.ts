import { Uint8, VarString } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet, UpdateSoftEnumType } from "../../enums";
import { UpdateSoftEnumData } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdateSoftEnum)
class UpdateSoftEnumPacket extends DataPacket {
  @Serialize(VarString) public enumName!: string;
  @Serialize(UpdateSoftEnumData) public values!: UpdateSoftEnumData;
  @Serialize(Uint8) public updateType!: UpdateSoftEnumType;
}

export { UpdateSoftEnumPacket };
