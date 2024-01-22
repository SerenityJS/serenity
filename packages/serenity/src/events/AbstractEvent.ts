import type { Packet } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity';
import type { HookMethod } from '../types';

abstract class AbstractEvent {
	protected abstract readonly serenity: Serenity;

	public abstract readonly hook: Packet;

	public abstract readonly method: HookMethod;

	public abstract logic(...args: unknown[]): void;
}

export { AbstractEvent };
