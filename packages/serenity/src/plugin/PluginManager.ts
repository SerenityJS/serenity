import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import type { Logger, Serenity } from '../index.js';
import type { PluginBase } from './PluginBase.js';

export class PluginManager {
	protected readonly serenity: Serenity;

	/**
	 * The plugins map.
	 */
	public readonly plugins: Map<bigint, PluginBase>;

	public constructor(serenity: Serenity) {
		this.serenity = serenity;

		this.plugins = new Map();

		this.load();
	}

	/**
	 * Load plugins in "plugins" folder
	 */
	private load() {
		if (!existsSync(resolve(process.cwd(), 'plugins'))) {
			// It create plugins folder
			this.serenity.logger.info('Creating plugins folder.');
			mkdirSync(resolve(process.cwd(), 'plugins'));
		}
	}
}
