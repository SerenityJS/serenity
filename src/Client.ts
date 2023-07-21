import { Buffer } from 'node:buffer';
import crypto, { sign, createDecipheriv, createCipheriv } from 'node:crypto';
import { deflateRawSync } from 'node:zlib';
import jwt from 'jsonwebtoken';
import type { ServerClient } from 'raknet-native';
import { PacketPriority, PacketReliability } from 'raknet-native';
import { framePackets } from '../../protocol';

interface ServerClientFixed extends ServerClient {
	guid: string;
}

const GameByte = Buffer.from([0xfe]);

const SALT = '🧂';

export class Client {
	public readonly internal: ServerClientFixed;
	public readonly guid: string;

	private readonly keyPair: crypto.KeyPairKeyObjectResult;
	private readonly keyPublic: Buffer;
	private readonly keyPrivate: Buffer | string;
	// Make this less ass later
	public secretBytes = Buffer.from(SALT);

	// Do this diff plz very unsafe
	public decipher: NoboobCipher | null = null;
	public cipher: NoboobCipher | null = null;
	public encryptionEnabled = false;
	public sendCounter = 0n;
	public recieveCounter = 0n;

	// Store network compression settings per client. Technically could have different settings per client.
	// It isnt relly needed but it will definitely clean things up.
	// Make private later on, it should always be true once changed.
	public compressionEnabled = false;
	// Make private later on, it should always be true once changed.
	// public encryptionEnabled = false;

	public constructor(internal: ServerClient) {
		this.internal = internal as ServerClientFixed;
		this.guid = this.internal.guid;
		this.keyPair = crypto.generateKeyPairSync('ec', { namedCurve: 'secp384r1' });
		this.keyPublic = this.keyPair.publicKey.export({ format: 'der', type: 'spki' });
		this.keyPrivate = this.keyPair.privateKey.export({ format: 'pem', type: 'sec1' });
	}

	public send(...packets: Buffer[]): void {
		// TODO: should be handled by in protocol package.
		const frame = framePackets(packets);

		// Do this level thing different;
		const compressed = frame.length > 256 ? deflateRawSync(frame) : frame;

		if (this.encryptionEnabled && this.cipher) {
			this.cipher(deflateRawSync(frame), (ciphed) => {
				const batch = Buffer.concat([GameByte, ciphed]);
				return this.internal.send(batch, PacketPriority.MEDIUM_PRIORITY, PacketReliability.RELIABLE_ORDERED, 0);
			});
		} else {
			const batch = Buffer.concat([GameByte, compressed]);
			this.internal.send(batch, PacketPriority.MEDIUM_PRIORITY, PacketReliability.RELIABLE_ORDERED, 0);
		}
	}

	public disconnect(): void {
		this.internal.close();
	}

	// Make this less ass
	public startEncryption(key: string): string {
		const publicKeyObject = crypto.createPublicKey({
			key: Buffer.from(key, 'base64'),
			...({ format: 'der', type: 'spki' } as any),
		});
		const sharedSecret = crypto.diffieHellman({
			privateKey: this.keyPair.privateKey,
			publicKey: publicKeyObject,
		});
		const secretHash = crypto.createHash('sha256');
		secretHash.update(SALT);
		secretHash.update(sharedSecret);
		this.secretBytes = secretHash.digest();

		this.decipher = createDecryptor(this, this.secretBytes, this.secretBytes.slice(0, 12));
		this.cipher = createEncryptor(this, this.secretBytes, this.secretBytes.slice(0, 12));

		return jwt.sign(
			{
				salt: Buffer.from(SALT).toString('base64'),
				signedToken: this.keyPublic.toString('base64'),
			},
			this.keyPair.privateKey,
			{
				algorithm: 'ES384',
				header: {
					x5u: this.keyPublic.toString('base64'),
					alg: 'ES384',
				},
			},
		);
	}
}

type NoboobCipher = (blob: Buffer, cb: (result: Buffer) => void) => void;
function createDecryptor(client: Client, secret: Buffer, iv: Buffer): NoboobCipher {
	const decipher = createDecipheriv('aes-256-gcm', secret, iv);

	// probably need to add decipher timeouts if does not resolve in x amount of time
	return (blob: Buffer, cb: (result: Buffer) => void): void => {
		function onDeciphered(blob: Buffer) {
			decipher.off('data', onDeciphered);

			const packet = blob.slice(0, blob.length - 8);
			const checksum = blob.slice(blob.length - 8, blob.length);
			const computedChecksum = computeCheckSum(packet, client.recieveCounter, secret);
			client.recieveCounter++;

			if (!checksum.equals(computedChecksum)) {
				// Disconnect packet checksum does not match computed checksum
				console.error('Disconnect packet checksum does not match computed checksum');
				client.disconnect();
				return;
			}

			cb(blob);
		}

		decipher.on('data', onDeciphered);
		decipher.write(blob);
	};
}

function createEncryptor(client: Client, secret: Buffer, iv: Buffer): NoboobCipher {
	const decipher = createCipheriv('aes-256-gcm', secret, iv);

	// probably need to add decipher timeouts if does not resolve in x amount of time
	return (blob: Buffer, cb: (result: Buffer) => void): void => {
		function onCiphered(result: Buffer) {
			decipher.off('data', onCiphered);

			cb(result);
		}

		decipher.on('data', onCiphered);

		const packet = Buffer.concat([blob, computeCheckSum(blob, client.sendCounter, secret)]);
		client.sendCounter++;

		decipher.write(packet);
	};
}

function computeCheckSum(packet: Buffer, sendCounter: bigint, secret: Buffer): Buffer {
	const digest = crypto.createHash('sha256');
	const counter = Buffer.alloc(8);
	counter.writeBigInt64LE(sendCounter, 0);
	digest.update(counter);
	digest.update(packet);
	digest.update(secret);
	const hash = digest.digest();
	return hash.slice(0, 8);
}
