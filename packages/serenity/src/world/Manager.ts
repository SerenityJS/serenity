import { resolve } from 'node:path';
import process from 'node:process';
import type { Serenity } from '../Serenity';
import { Logger, LoggerColors } from '../console';
import type { World } from './World';
import { Filesystem } from './provider';

class WorldManager {
	protected readonly serenity: Serenity;
	protected readonly logger: Logger;
	protected readonly provder: string;

	// TODO: Add the option for a custom path.
	public constructor(serenity: Serenity) {
		this.serenity = serenity;
		this.logger = new Logger('Worlds', LoggerColors.Cyan);
		this.provder = serenity.properties.values.world.provider;

		// Load the selected provider.
		switch (this.provder) {
			default: {
				this.logger.error(
					`Failed to load world provider, provider [${this.provder}] does not exist! Expected values [filesystem]`,
				);
				break;
			}

			case 'filesystem': {
				Filesystem.initialize(this.serenity, resolve(process.cwd(), 'worlds'));
				break;
			}
		}
	}
}

export { WorldManager };
