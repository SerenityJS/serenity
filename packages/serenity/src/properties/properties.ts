import { resolve } from "node:path";
import { writeFileSync, readFileSync, rmSync } from "node:fs";

import { Logger, LoggerColors } from "@serenityjs/logger";
import { parse } from "yaml";

import { exists } from "../utils/exists";

class Properties<T> {
	public static readonly logger = new Logger(
		"Properties",
		LoggerColors.YellowBright
	);

	public readonly path: string;

	public readonly template: string;

	protected raw = "";

	public values: T;

	public constructor(path: string, template: string) {
		this.path = resolve(process.cwd(), path);
		this.template = template;

		// Read the server.properties file.
		this.values = this.read();

		// Check if the server.properties file is missing any of the default properties.
		if (this.values === null) {
			rmSync(this.path);
			this.values = this.read();
		}

		// Check if the server.properties file is missing any of the default properties.
		const defaultProperties = parse(this.template) as T;

		for (const key in defaultProperties) {
			if (!Object.keys(this.values as Record<string, unknown>).includes(key)) {
				// Get the comment for the property.
				const fetch = this.template.split(`\n${key}:`)[1];
				const comment = fetch
					? fetch.split("\n")[1]?.startsWith("#")
						? fetch.split("\n")[1]
						: ""
					: "";

				// Add the missing property to the server.properties file.
				this.addValue(key, defaultProperties[key as keyof T], comment);
			}
		}
	}

	/**
	 * Read the server.properties file.
	 * @returns The server.properties file.
	 */
	protected read(): T {
		// Check if the server.properties file exists.
		if (!exists(this.path)) {
			// Create the server.properties file.
			writeFileSync(this.path, this.template);

			// Log that the server.properties file was created.
			Properties.logger.success(`Created properties file at "${this.path}"`);
		}

		// Read the server.properties file.
		const properties = readFileSync(this.path, "utf8");

		// Assign the raw property.
		this.raw = properties;

		// Parse the server.properties file, and assign it to the values property.
		return parse(properties) as T;
	}

	/**
	 * Write the server.properties file.
	 */
	protected write(): void {
		// Write the server.properties file.
		writeFileSync(this.path, this.raw);

		// Update the values property.
		this.values = this.read();
	}

	/**
	 * Get the value of the key.
	 * @param key The key to get the value of.
	 * @returns The value of the key.
	 */
	public getValue<K extends keyof T>(key: K): T[K] {
		return this.values[key];
	}

	/**
	 * Set the value of the key.
	 * @param key The key to set the value of.
	 * @param value The value to set.
	 */
	public setValue<K extends keyof T>(key: K, value: T[K]): void {
		// Check if the key exists.
		// If not, we will add the key to the server.properties file.
		if (
			!Object.keys(this.values as Record<string, unknown>).includes(
				key as string
			)
		) {
			return this.addValue(key as string, value);
		}

		// Update the value of the key.
		this.values[key] = value;

		// Update the raw property.
		this.raw = this.raw.replaceAll(
			new RegExp(`^${key as string}:.*$`, "gm"),
			`${key as string}: ${value}`
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
		if (Object.keys(this.values as Record<string, unknown>).includes(key)) {
			return this.setValue(key as keyof T, value as never);
		}

		// Add the value to the values property.
		this.values[key as keyof T] = value as never;

		// Add the value to the raw property.
		this.raw += `\n${key}: ${value}\n`;

		if (message) this.raw += `# ${message}\n`;

		// Re-write the server.properties file.
		return this.write();
	}
}

export { Properties };
