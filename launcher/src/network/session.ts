import { Disconnect } from "@serenityjs/protocol";
import { Priority } from "@serenityjs/raknet";

import type { DataPacket, DisconnectReason } from "@serenityjs/protocol";
import type { Connection, NetworkIdentifier } from "@serenityjs/raknet";
import type { Serenity } from "../serenity";
import type { Player } from "../player";
import type { Network } from "./network";

// NOTE
// STRUCTURE FOR PLAYER AND NEWORKSESSION CLASS
// Any methods that will directly interact with the player should be in the player class.
// Any methods that will NOT directly interact with the player should be in the network session class.
// The methods in the network session class should be used for reiceving packets from other players.
// For example, the player class has a sendMessage() method, this method will directly interact with the player, by sending a message on screen.
// Another example, the network session class has a receiveMovement() method, this method will NOT directly interact with the player,
// As this method handles the movement of other players, not the player itself.
//

class NetworkSession {
	public readonly serenity: Serenity;
	public readonly network: Network;
	public readonly connection: Connection;
	public readonly guid: bigint;
	public readonly identifier: NetworkIdentifier;
	public readonly uniqueId: bigint;

	public encryption: boolean = false;
	public compression: boolean = false;
	public player: Player | null = null;

	/**
	 * Creates a new network session.
	 *
	 * @param serenity The serenity instance.
	 * @param connection The connection.
	 * @returns A new network session.
	 */
	public constructor(serenity: Serenity, connection: Connection) {
		this.serenity = serenity;
		this.network = serenity.network;
		this.connection = connection;
		this.guid = connection.guid;
		this.identifier = connection.identifier;
		this.uniqueId = BigInt.asUintN(64, this.guid);
	}

	/**
	 * Sends a packet to the client.
	 *
	 * @param packets The packets to send.
	 * @returns A promise that resolves when the packet has been sent.
	 */
	public send(...packets: Array<DataPacket>): void {
		return this.network.send(this, Priority.Normal, ...packets);
	}

	public sendImmediate(...packets: Array<DataPacket>): void {
		return this.network.send(this, Priority.Immediate, ...packets);
	}

	public disconnect(
		message: string,
		reason: DisconnectReason,
		hideReason = false
	): void {
		const packet = new Disconnect();
		packet.message = message;
		packet.reason = reason;
		packet.hideDisconnectionScreen = hideReason;

		this.send(packet);
	}
}

export { NetworkSession };
