import { Command } from "./command";
import { CommandRegistry } from "./registry";

import type {
  CommandCallback,
  CommandContext,
  CommandRegistryCallback
} from "../types";

class CommandPalette {
  /**
   * The commands of the registry.
   */
  public readonly commands = new Map<string, Command>();

  /**
   * Gets all the commands in the registry.
   * @returns All the commands in the registry.
   */
  public getAll(): Array<Command> {
    // Use a Set to deduplicate commands (since aliases point to the same command instance)
    const uniqueCommands = new Set(this.commands.values());
    return [...uniqueCommands];
  }

  /**
   * Gets a command by its name.
   * @param name The name of the command.
   * @returns The command or undefined if it does not exist.
   */
  public get(name: string): Command | undefined {
    // Check if the name starts with a slash.
    if (name.startsWith("/")) {
      // Remove the slash from the name.
      name = name.slice(1);
    }

    // Get the first word of the name.
    name = name.split(" ")[0] as string;

    // Return the command by the name.
    return this.commands.get(name);
  }

  /**
   * Registers a new command in the registry.
   * @param name The name of the command.
   * @param description The description of the command.
   * @param callback The callback of the command.
   * @param aliases The aliases of the command.
   * @returns The command that was registered.
   */
  public register<K = NonNullable<unknown>, T = CommandContext<K>>(
    name: string,
    description: string,
    callback: CommandCallback<T>,
    aliases?: Array<string>
  ): Command<T>;

  /**
   * Registers a new command in the registry.
   * @param name  The name of the command.
   * @param description The description of the command.
   * @param registry The registry of the command.
   * @param callback The callback of the command.
   * @param aliases The aliases of the command.
   * @returns The command that was registered.
   */
  public register<K = NonNullable<unknown>, T = CommandContext<K>>(
    name: string,
    description: string,
    registry: CommandRegistryCallback,
    callback: CommandCallback<T>,
    aliases?: Array<string>
  ): Command<T>;

  /**
   * Registers a new command in the registry.
   * @param name The name of the command.
   * @param description The description of the command.
   * @param registry The registry of the command.
   * @param callback The callback of the command.
   * @param aliases The aliases of the command.
   * @returns The command that was registered.
   */
  public register<K = NonNullable<unknown>, T = CommandContext<K>>(
    name: string,
    description: string,
    registry: CommandRegistryCallback | CommandCallback<T>,
    callback?: CommandCallback<T> | Array<string>,
    aliases?: Array<string>
  ): Command<T> {
    // Create a new registry instance
    const regInstance = new CommandRegistry();

    // Determine if we have a registry callback or just an execution callback
    const hasRegistryCallback = typeof callback === "function";
    const execCallback = hasRegistryCallback
      ? (callback as CommandCallback<T>)
      : (registry as CommandCallback<T>);
    const regCallback = hasRegistryCallback
      ? (registry as CommandRegistryCallback)
      : () => { };
    const cmdAliases = hasRegistryCallback
      ? (aliases ?? [])
      : Array.isArray(callback)
        ? callback
        : [];

    // Execute the registry callback
    regCallback(regInstance);

    // Create a new command instance
    const command = new Command<T>(
      name,
      description,
      cmdAliases,
      regInstance,
      execCallback
    );

    // Set the command in the commands map by name
    this.commands.set(name, command as Command<unknown>);

    // Set the command in the commands map by all its aliases
    for (const alias of cmdAliases) {
      this.commands.set(alias, command as Command<unknown>);
    }

    // Return the command
    return command;
  }

  /**
   * Unregisters a command from the registry by its name.
   * @param name - The name of the command to be unregistered.
   * @remarks
   * This method removes the command associated with the given name from the registry.
   * If the command does not exist in the registry, this method does nothing.
   */
  public unregister(name: string): void {
    this.commands.delete(name);
  }
}

export { CommandPalette };
