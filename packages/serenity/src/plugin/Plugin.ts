import type { PluginBase } from "./PluginBase.js";

class Plugin {
  public readonly name: string;
  public readonly author?: string;
  public readonly version: string;
  public readonly dataFolder: string;
  public readonly main: PluginBase;
  
  public constructor(pluginPackage: any, dataFolder: string, main: PluginBase) {
    // TODO: Add api property support
    
    this.name = pluginPackage.name;
    this.author = pluginPackage.author;
    this.version = pluginPackage.version;
    this.dataFolder = dataFolder;
    this.main = main;
  }
}

export { Plugin };
