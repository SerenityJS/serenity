import { Int32 } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { LoginTokens } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.Login)
class Login extends DataPacket {
	@Serialize(Int32) public protocol!: number;
	@Serialize(LoginTokens) public tokens!: LoginTokens;
}

export { Login };
