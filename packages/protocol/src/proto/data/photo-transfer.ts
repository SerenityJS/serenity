import { Proto, Serialize } from "@serenityjs/raknet";
import { Uint8, VarString } from "@serenityjs/binarystream";

import { Packet, PhotoType } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.PhotoTransfer)
class PhotoTransferPacket extends DataPacket {
  @Serialize(VarString) public photoName!: string;
  @Serialize(VarString) public photoData!: string;
  @Serialize(VarString) public bookId!: string;
  @Serialize(Uint8) public type!: PhotoType;
  @Serialize(Uint8) public sourceType!: PhotoType;
  @Serialize(VarString) public ownerId!: string;
  @Serialize(VarString) public newPhotoName!: string;
}

export { PhotoTransferPacket };
