import { resolve } from "node:path";
import { readdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";

import { Logger, LoggerColors } from "@serenityjs/logger";
import { parse } from "yaml";

import { DEFAULT_SERVER_PROPERTIES } from "./default";

interface DefaultServerProperties {
	"server-name": string;
	"server-address": string;
	"server-port": number;
	"server-tps": number;
	"max-players": number;
	"network-comression-threshold": number;
	"network-compression-algorithm": string;
	"network-packets-per-frame": number;
	"plugins-enabled": boolean;
	"plugins-path": string;
	"debug-logging": boolean;
	"must-accept-packs": boolean;
	"resource-packs": Array<{
		uuid: string;
		subpack?: string;
	}>;
}

class ServerProperties {
	public static readonly path = resolve(process.cwd(), "server.properties");

	public static readonly logger = new Logger(
		"Properties",
		LoggerColors.YellowBright
	);

	protected raw = "";

	public values: DefaultServerProperties;

	public constructor() {
		// Read the server.properties file.
		this.values = this.read();

		// Check if the server.properties file is missing any of the default properties.
		if (this.values === null) {
			rmSync(ServerProperties.path);
			this.values = this.read();
		}

		// Check if the server.properties file is missing any of the default properties.
		const defaultProperties = parse(
			DEFAULT_SERVER_PROPERTIES
		) as DefaultServerProperties;

		for (const key in defaultProperties) {
			if (!Object.keys(this.values).includes(key)) {
				// Get the comment for the property.
				const fetch = DEFAULT_SERVER_PROPERTIES.split(`\n${key}:`)[1];
				const comment = fetch
					? fetch.split("\n")[1]?.startsWith("#")
						? fetch.split("\n")[1]
						: ""
					: "";

				// Add the missing property to the server.properties file.
				this.addValue(
					key,
					defaultProperties[key as keyof DefaultServerProperties],
					comment
				);
			}
		}
	}

	/**
	 * Read the server.properties file.
	 * @returns The server.properties file.
	 */
	protected read(): DefaultServerProperties {
		// Check if the server.properties file exists.
		if (!readdirSync(process.cwd()).includes("server.properties")) {
			// Create the server.properties file.
			writeFileSync(ServerProperties.path, DEFAULT_SERVER_PROPERTIES);

			// Log that the server.properties file was created.
			ServerProperties.logger.success(
				`Created server.properties file at "${ServerProperties.path}"`
			);
		}

		// Read the server.properties file.
		const properties = readFileSync(ServerProperties.path, "utf8");

		// Assign the raw property.
		this.raw = properties;

		// Parse the server.properties file, and assign it to the values property.
		return parse(properties) as DefaultServerProperties;
	}

	/**
	 * Write the server.properties file.
	 */
	protected write(): void {
		// Write the server.properties file.
		writeFileSync(ServerProperties.path, this.raw);

		// Update the values property.
		this.values = this.read();
	}

	/**
	 * Get the value of the key.
	 * @param key The key to get the value of.
	 * @returns The value of the key.
	 */
	public getValue<K extends keyof DefaultServerProperties>(
		key: K
	): DefaultServerProperties[K] {
		return this.values[key];
	}

	/**
	 * Set the value of the key.
	 * @param key The key to set the value of.
	 * @param value The value to set.
	 */
	public setValue<K extends keyof DefaultServerProperties>(
		key: K,
		value: DefaultServerProperties[K]
	): void {
		// Check if the key exists.
		// If not, we will add the key to the server.properties file.
		if (!Object.keys(this.values).includes(key)) {
			return this.addValue(key, value);
		}

		// Update the value of the key.
		this.values[key] = value;

		// Update the raw property.
		this.raw = this.raw.replaceAll(
			new RegExp(`^${key}:.*$`, "gm"),
			`${key}: ${value}`
		);

		// Re-write the server.properties file.
		return this.write();
	}

	/**
	 * Add a value to the server.properties file.
	 * @param key The key to add the value to.
	 * @param value The value to add.
	 */
	public addValue(key: string, value: unknown, message?: string): void {
		// Check if that key already exists.
		// If so, we will call the setValue method.
		if (Object.keys(this.values).includes(key)) {
			return this.setValue(
				key as keyof DefaultServerProperties,
				value as never
			);
		}

		// Add the value to the values property.
		this.values[key as keyof DefaultServerProperties] = value as never;

		// Add the value to the raw property.
		this.raw += `\n${key}: ${value}\n`;

		if (message) this.raw += `# ${message}\n`;

		// Re-write the server.properties file.
		return this.write();
	}
}

export { ServerProperties };
