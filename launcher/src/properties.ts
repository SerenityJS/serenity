import { readdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

import { stringify, parse } from "yaml";

import type { Logger } from "./console";

const DEFAULT_SERVER_PROPERTIES = {
	server: {
		address: "0.0.0.0",
		port: 19_132,
		"max-connections": 10,
		motd: "SerenityJS",
		debug: false,
		shutdown: {
			message: "Server closed"
		}
	},
	network: {
		"compression-threshold": 256,
		"compression-method": "zlib",
		"packets-per-frame": 32
	},
	world: {
		provider: "internal",
		default: "default-world"
	},
	plugins: {
		enabled: true,
		path: "./plugins"
	}
};

class ServerProperties {
	/**
	 * The path to the server properties.
	 */
	public static readonly path = resolve(process.cwd(), "server.properties");

	/**
	 * The logger instance.
	 */
	protected readonly logger: Logger;

	/**
	 * The property values of the server.
	 */
	public readonly values: typeof DEFAULT_SERVER_PROPERTIES;

	/**
	 * Constructs a new server properties instance.
	 *
	 * @param logger - The logger instance.
	 */
	public constructor(logger: Logger) {
		this.logger = logger;
		this.values = this.read();
	}

	/**
	 * Loads the server properties.
	 */
	private read(): typeof DEFAULT_SERVER_PROPERTIES {
		// Check if the server properties file exists.
		if (!readdirSync(process.cwd()).includes("server.properties")) {
			// Write the default server properties to the file.
			writeFileSync(
				ServerProperties.path,
				stringify(DEFAULT_SERVER_PROPERTIES, { indent: 2 })
			);
			// Log that the server properties file was created.
			this.logger.success(
				`Created server.properties file at "${ServerProperties.path}"`
			);
		}

		// Read the server properties file.
		const properties = readFileSync(ServerProperties.path, "utf8");

		// Parse the server properties.
		return parse(properties);
	}
}

export { ServerProperties };
