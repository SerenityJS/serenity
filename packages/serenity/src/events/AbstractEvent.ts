import type { Packet } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity';

abstract class AbstractEvent {
	protected abstract readonly serenity: Serenity;
	public abstract readonly packetHook: Packet;

	public abstract logic(...args: unknown[]): void;
}

export { AbstractEvent };
