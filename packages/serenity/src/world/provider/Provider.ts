import type { Serenity } from '../../Serenity';
import type { Logger } from '../../console';
import type { PlayerProperties, WorldProperties } from '../../types';
import type { Chunk } from '../chunk';
import type { Dimension } from '../dimension';

abstract class Provider {
	public static readonly logger: Logger;

	protected abstract readonly serenity: Serenity;

	public abstract readonly path: string;

	// remove
	public abstract readChunks(dimension: Dimension): Chunk[];

	// remove
	public abstract writeChunks(chunks: Chunk[], dimension: Dimension): void;

	public abstract readProperties(): WorldProperties;

	public abstract writeProperties(properties: WorldProperties): void;

	public abstract readPlayerProperties(xuid: string): PlayerProperties;

	public abstract writePlayerProperties(xuid: string, properties: PlayerProperties): void;

	public static initialize(serenity: Serenity, path: string): void {
		throw new Error('Provider.initialize() is not implemented.');
	}
}

export { Provider };
