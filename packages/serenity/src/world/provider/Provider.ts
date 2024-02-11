import type { Buffer } from 'node:buffer';
import type { Serenity } from '../../Serenity';
import type { Logger } from '../../console';
import type { WorldProperties } from '../../types';
import type { World } from '../World';

abstract class Provider {
	public static readonly logger: Logger;

	protected abstract readonly serenity: Serenity;

	public abstract readonly path: string;

	public abstract readChunk(x: number, z: number): Buffer;

	public abstract readProperties(): WorldProperties;

	public static initialize(serenity: Serenity, path: string): void {
		throw new Error('Provider.initialize() is not implemented.');
	}
}

export { Provider };
