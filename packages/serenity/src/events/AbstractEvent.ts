import type { Packet } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity';
import type { HookMethod } from '../types';

abstract class AbstractEvent {
	public static serenity: Serenity;
	public static readonly hook: Packet;
	public static readonly method: HookMethod;
	public static logic(...args: unknown[]): void {
		throw new Error('Logic method not implemented.');
	}
}

export { AbstractEvent };
