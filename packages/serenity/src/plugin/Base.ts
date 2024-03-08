import type { Logger, Serenity } from '../index.js';

/**
 * Represents a base plugin that can be loaded into the Serenity server.
 */
abstract class BasePlugin {
	/**
	 * The serenity instance.
	 */
	public readonly serenity: Serenity;

	/**
	 * The logger instance.
	 */
	public readonly logger: Logger;

	/**
	 * Constructs a new base plugin instance.
	 *
	 * @param serenity - The serenity instance.
	 * @param logger - The logger instance.
	 */
	public constructor(serenity: Serenity, logger: Logger) {
		this.serenity = serenity;
		this.logger = logger;

		// Call the startup method
		this.startup();
	}

	/**
	 * Called when the plugin is started.
	 */
	public startup(): void {}

	/**
	 * Called when the plugin is stopped.
	 */
	public shutdown(): void {}
}

export { BasePlugin };
