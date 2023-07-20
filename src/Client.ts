import { Buffer } from 'node:buffer';
import crypto, { sign } from 'node:crypto';
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

	public constructor(internal: ServerClient) {
		this.internal = internal as ServerClientFixed;
		this.guid = this.internal.guid;
		this.keyPair = crypto.generateKeyPairSync('ec', { namedCurve: 'secp384r1' });
		this.keyPublic = this.keyPair.publicKey.export({ format: 'der', type: 'spki' });
		this.keyPrivate = this.keyPair.privateKey.export({ format: 'pem', type: 'sec1' });
	}

	public send(...packets: Buffer[]): number {
		// TODO: should be handled by in protocol package.
		const frame = framePackets(packets);
		const batch = Buffer.concat([GameByte, frame]);

		return this.internal.send(batch, PacketPriority.MEDIUM_PRIORITY, PacketReliability.RELIABLE_ORDERED, 0);
	}

	public disconnect(): void {
		this.internal.close();
	}

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
		const secretKeyBytes = secretHash.digest();

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
