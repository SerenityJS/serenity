import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process, { cwd } from 'node:process';
import type { Serenity } from '../index.js';
import { Plugin } from './Plugin.js';

class PluginManager {
	protected readonly serenity: Serenity;

	/**
	 * The plugins map.
	 */
	public readonly plugins: Map<string, Plugin>;

	public constructor(serenity: Serenity) {
		this.serenity = serenity;

		this.plugins = new Map();

		void this.load();
	}

	/**
	 * Load plugins in "plugins" folder
	 */
	private async load() {
    const path = resolve(process.cwd(), 'plugins');
    
		if (!existsSync(path)) {
			// It create plugins folder
			mkdirSync(path);
      
			this.serenity.logger.info('Created plugins folder.');
		}
    
    const plugins = readdirSync(path);
    
    for (const id of plugins) {
      const plugin = await this.getPlugin(id);
      
      this.serenity.logger.info(`Enabling ${id} plugin...`);
      
      // TODO: add support loadBefore, pluginDepends etc.
      
      this.plugins.set(id, plugin);
      
      await plugin.main?.onEnable?.();
    }
	}
  
  private async getPlugin(plugin: string): Promise<Plugin> {
    const pluginPath = join(cwd(), 'plugins', plugin);
      
    const pluginPackagePath = resolve(pluginPath, 'package.json');
    
    if(!existsSync(pluginPackagePath)) {
      throw new Error(`package.json not found in "${plugin}" plugin.`);
    }
    
    const pluginPackageBuffer = readFileSync(pluginPackagePath);
    const pluginPackageString = pluginPackageBuffer.toString('ascii');
    
    try {
      const pluginPackage = JSON.parse(pluginPackageString);
      
      const pluginDataFolder = resolve(pluginPath, 'data');
      
      const pluginMain = await import(resolve(pluginPath, pluginPackage.main));
      
      this.validatePlugin(plugin, pluginPackage, pluginMain);
      
      const pluginMainClass = new pluginMain.default(this.serenity);
      
      return new Plugin(pluginPackage, pluginDataFolder, pluginMainClass);
    } catch {
      throw new Error(`Invalid package.json in "${plugin}" plugin.`);
    }
  }
  
  // TODO: make better validation
  private validatePlugin(plugin: string, pluginPackage: Record<string, any>, pluginMainClass: any) {
    // Validate if the package.json contains "main" property
    if(!pluginPackage?.main) {
      throw new Error(`Undefined property "main" on package.json of ${plugin} plugin`);
    }
    
    // Validate if the package.json contains "name" property
    if(!pluginPackage?.name) {
      throw new Error(`Undefined property "name" on package.json of ${plugin} plugin`);
    }
    
    // Validate if the package.json contains "version" property
    if(!pluginPackage?.version) {
      throw new Error(`Undefined property "version" on package.json of ${plugin} plugin`);
    }
    
    if(!pluginMainClass?.default) {
      throw new Error(`There's no export default class on "${plugin}" plugin.`);
    }
    
    const pluginWithSameName = this.plugins.has(plugin);
    if (pluginWithSameName) {
      throw new Error(`There another plugin called "${plugin}" active.`);
    }
  }
}

export { PluginManager };
