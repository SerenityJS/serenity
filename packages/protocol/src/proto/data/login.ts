import { Int32 } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { LoginTokens } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.Login)
class LoginPacket extends DataPacket {
  @Serialize(Int32) public protocol!: number;
  @Serialize(LoginTokens) public tokens!: LoginTokens;
}

export { LoginPacket };
