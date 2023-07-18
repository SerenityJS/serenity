import { Buffer } from 'node:buffer';
import type { ServerClient } from 'raknet-native';
import { PacketPriority, PacketReliability } from 'raknet-native';
import { framePackets } from '../../protocol';

interface ServerClientFixed extends ServerClient {
	guid: string;
}

const GameByte = Buffer.from([0xfe]);

export class Client {
	public readonly internal: ServerClientFixed;
	public readonly guid: string;

	public constructor(internal: ServerClient) {
		this.internal = internal as ServerClientFixed;
		this.guid = this.internal.guid;
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
}
