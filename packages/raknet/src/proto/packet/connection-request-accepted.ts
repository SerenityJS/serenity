import { Long, Short } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";
import { Address, SystemAddress } from "../data";

import { BasePacket } from "./base";

/**
 * Represents an connection request accepted packet.
 */
@Proto(Packet.ConnectionRequestAccepted)
class ConnectionRequestAccepted extends BasePacket {
	/**
	 * The client address of the request.
	 */
	@Serialize(Address) public address!: Address;

	/**
	 * The system index of the request.
	 */
	@Serialize(Short) public systemIndex!: number;

	/**
	 * The system address of the request.
	 */
	@Serialize(SystemAddress) public systemAddress!: Array<Address>;

	/**
	 * The request timestamp of the request.
	 */
	@Serialize(Long) public requestTimestamp!: bigint;

	/**
	 * The timestamp of the request.
	 */
	@Serialize(Long) public timestamp!: bigint;
}

export { ConnectionRequestAccepted };
