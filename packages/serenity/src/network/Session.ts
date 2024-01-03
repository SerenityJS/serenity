import type { Buffer } from 'node:buffer';
import { deflateRawSync } from 'node:zlib';
import type { DataPacket } from '@serenityjs/bedrock-protocol';
import { Framer } from '@serenityjs/bedrock-protocol';
import type { Connection, NetworkIdentifier } from '@serenityjs/raknet-server';
import type { Serenity } from '..';
import type { Network } from './Network';

class NetworkSession {
	protected readonly serenity: Serenity;
	protected readonly network: Network;
	public readonly connection: Connection;
	public readonly guid: bigint;
	public readonly identifier: NetworkIdentifier;

	public encryption: boolean = false;
	public compression: boolean = false;

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
	}

	/**
	 * Sends a packet to the client.
	 *
	 * @param packets The packets to send.
	 * @returns A promise that resolves when the packet has been sent.
	 */
	public async send(...packets: DataPacket[]): Promise<void> {
		return this.network.send(this, ...packets);
	}
}

export { NetworkSession };
