import { type Connection, Priority, Reliability } from "@serenityjs/raknet";
import {
	type DisconnectReason,
	DisconnectPacket,
	type DataPacket
} from "@serenityjs/protocol";
import Emitter from "@serenityjs/emitter";

import type { Cipher } from "node:crypto";
import type { RemoteInfo } from "node:dgram";
import type { NetworkEvents } from "./types";
import type { Network } from "./network";

/**
 * Represents a network session.
 */
class NetworkSession extends Emitter<NetworkEvents> {
	/**
	 * The network instance.
	 */
	public readonly network: Network;

	/**
	 * The raknet connection instance.
	 */
	public readonly connection: Connection;

	/**
	 * The globably unique identifier of the session.
	 */
	public readonly guid: bigint;

	/**
	 * The network identifier of the session.
	 */
	public readonly identifier: RemoteInfo;

	/**
	 * Whether the session is using encryption.
	 */
	public encryption: boolean = false;

	/**
	 * Whether the session is using compression.
	 */
	public compression: boolean = false;

	/**
	 * The packet reliability of the session.
	 */
	public reliablity: Reliability = Reliability.ReliableOrdered;

	/**
	 * The packet ordering channel of the session.
	 */
	public channel: number = 0;

	/**
	 * Client public key for establishing encryption derived
	 * from the last JWT token in the identity chain.
	 */
	private _identityPublicKey: string | null = null;
	public get identityPublicKey(): string {
		if (this._identityPublicKey === null) {
			throw new Error("Identity public key is not set.");
		}

		return this._identityPublicKey;
	}

	public set identityPublicKey(value: string) {
		if (this._identityPublicKey !== null) {
			throw new Error("Identity public key is already set.");
		}

		this._identityPublicKey = value;
	}

	/**
	 * Shared secret for encryption generated via ECDH with the
	 * clients public key and the servers private key.
	 */
	private _encryptionSharedSecret: Buffer | null = null;
	public get encryptionSharedSecret(): Buffer {
		if (this._encryptionSharedSecret === null) {
			throw new Error("Encryption shared secret is not set.");
		}

		return this._encryptionSharedSecret;
	}

	public set encryptionSharedSecret(value: Buffer) {
		if (this._encryptionSharedSecret !== null) {
			throw new Error("Encryption shared secret is already set.");
		}

		this._encryptionSharedSecret = value;
	}

	/**
	 * Secret bytes for encryption generated via SHA256 with the
	 * salt shared in the ServerToClientHandshake packet.
	 */
	private _encryptionSecretBytes: Buffer | null = null;
	public get encryptionSecretBytes(): Buffer {
		if (this._encryptionSecretBytes === null) {
			throw new Error("Encryption secret bytes are not set.");
		}

		return this._encryptionSecretBytes;
	}

	public set encryptionSecretBytes(value: Buffer) {
		if (this._encryptionSecretBytes !== null) {
			throw new Error("Encryption secret bytes are already set.");
		}

		this._encryptionSecretBytes = value;
	}

	/**
	 * Encryption initialization vector for encryption generated
	 * via SHA256 with the salt shared in the ServerToClientHandshake packet.
	 */
	private _encryptionInitVector: Buffer | null = null;
	public get encryptionInitVector(): Buffer {
		if (this._encryptionInitVector === null) {
			throw new Error("Encryption initialization vector is not set.");
		}

		return this._encryptionInitVector;
	}

	public set encryptionInitVector(value: Buffer) {
		if (this._encryptionInitVector !== null) {
			throw new Error("Encryption initialization vector is already set.");
		}

		this._encryptionInitVector = value;
	}

	/**
	 * The cipher instance for encrypting bytes.
	 */
	private _cipher: Cipher | null = null;
	public get cipher(): Cipher {
		if (this._cipher === null) {
			throw new Error("Cipher is not set.");
		}

		return this._cipher;
	}

	public set cipher(value: Cipher) {
		if (this._cipher !== null) {
			throw new Error("Cipher is already set.");
		}

		this._cipher = value;
	}

	/**
	 * The decipher instance for decrypting bytes.
	 */
	private _decipher: Cipher | null = null;
	public get decipher(): Cipher {
		if (this._decipher === null) {
			throw new Error("Decipher is not set.");
		}

		return this._decipher;
	}

	public set decipher(value: Cipher) {
		if (this._decipher !== null) {
			throw new Error("Decipher is already set.");
		}

		this._decipher = value;
	}

	/**
	 * Encrypted packet send sequence number.
	 * Used by the client to validate packets the server sends.
	 */
	public checksumSendSequence: bigint = 0n;

	/**
	 * Encrypted packet receive sequence number.
	 * Used by the server to validate packets from the client.
	 */
	public checksumReceiveSequence: bigint = 0n;

	/**
	 * Creates a new network session.
	 *
	 * @param network The network instance.
	 * @param connection The raknet connection.
	 * @returns A new network session.
	 */
	public constructor(network: Network, connection: Connection) {
		super();
		this.network = network;
		this.connection = connection;
		this.guid = connection.guid;
		this.identifier = connection.rinfo;
	}

	/**
	 * Disconnects the session from the server.
	 * @param message The message to send to the client.
	 * @param reason The reason for the disconnection.
	 * @param hideReason Whether to hide the disconnection screen.
	 */
	public disconnect(
		message: string,
		reason: DisconnectReason,
		hideReason = false
	): void {
		// Create a new disconnect packet.
		const packet = new DisconnectPacket();

		// Assign the packet properties.
		packet.message = message;
		packet.reason = reason;
		packet.hideDisconnectScreen = hideReason;

		// Send the packet with the highest priority.
		this.network.send(this, Priority.Immediate, packet);

		// Disconnect the raknet connection.
		this.connection.disconnect();
	}

	/**
	 * Sends a packet to the client.
	 * @param packets The packets to send.
	 */
	public send(...packets: Array<DataPacket>): void {
		return this.network.send(this, Priority.Normal, ...packets);
	}

	/**
	 * Sends a packet to the client with the highest priority.
	 * @param packets The packets to send.
	 */
	public sendImmediate(...packets: Array<DataPacket>): void {
		return this.network.send(this, Priority.Immediate, ...packets);
	}
}

export { NetworkSession };
