import { resolve } from "node:path";
import { readdirSync, writeFileSync, readFileSync } from "node:fs";

import { Logger, LoggerColors } from "@serenityjs/logger";
import { parse } from "yaml";

import { DEFAULT_SERVER_PROPERTIES } from "./default";

interface DefaultServerProperties {
	"server-name": string;
	"server-address": string;
	"server-port": number;
	"max-players": number;
	"network-comression-threshold": number;
	"network-compression-algorithm": string;
	"network-packets-per-frame": number;
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

	public readonly values: DefaultServerProperties;

	public constructor() {
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

		// Parse the server.properties file, and assign it to the values property.
		this.values = parse(properties) as DefaultServerProperties;
	}
}

export { ServerProperties };
