import { readdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { stringify, parse } from 'yaml';
import type { Logger } from '../../console';

const DEFAULT_SERVER_PROPERTIES = {
	address: '0.0.0.0',
	port: 19_132,
	maxConnections: 10,
	motd: 'SerenityJS',
};

class ServerProperties {
	/**
	 * The path to the server properties.
	 */
	public static readonly path = resolve(process.cwd(), 'server.properties');

	/**
	 * The default server properties.
	 */
	public static readonly default = DEFAULT_SERVER_PROPERTIES;

	/**
	 * The logger instance.
	 */
	protected readonly logger: Logger;

	/**
	 * The property values of the server.
	 */
	public readonly values: typeof ServerProperties.default;

	/**
	 * Constructs a new server properties instance.
	 *
	 * @param logger - The logger instance.
	 */
	public constructor(logger: Logger) {
		this.logger = logger;
		this.values = this.load();
	}

	/**
	 * Loads the server properties.
	 */
	private load(): typeof ServerProperties.default {
		// Check if the server properties file exists.
		if (!readdirSync(process.cwd()).includes('server.properties')) {
			// Write the default server properties to the file.
			writeFileSync(ServerProperties.path, stringify(ServerProperties.default, { indent: 2 }));
			// Log that the server properties file was created.
			this.logger.success('Created server.properties file.');
		}

		// Read the server properties file.
		const properties = readFileSync(ServerProperties.path, 'utf8');

		// Parse the server properties.
		return parse(properties);
	}
}

export { ServerProperties };
