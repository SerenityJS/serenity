/* eslint-disable @typescript-eslint/unified-signatures */

import type {
  CommandArguments,
  CommandCallback,
  CommandOverload,
  CommandRegistryCallback
} from "../types";
import { SubCommand } from "./subcommand";

class CommandRegistry {
  /**
   * The overloads of the command.
   */
  public readonly overloads = new Map<CommandOverload, CommandCallback>();

  /**
   * The subcommands of the command.
   */
  public readonly subcommands = new Map<string, SubCommand>();

  /**
   * The permissions of the command.
   */
  public permissions: Array<string> = [];

  /**
   * The will make the command appear with a `debug` flag in the available commands list.
   */
  public debug = false;

  /**
   * Overloads the command with the given options.
   * @param options The options of the overload.
   */
  public overload<T extends CommandOverload>(options: T): this;

  /**
   * Overloads the command with the given options and callback.
   * @param options The options of the overload.
   * @param callback The callback of the overload.
   */
  public overload<T extends CommandOverload>(
    options: T,
    callback: CommandCallback<CommandArguments<T>>
  ): this;

  /**
   * Overloads the command with the given options and callback.
   * @param options The options of the overload.
   * @param callback The callback of the overload
   */
  public overload<T extends CommandOverload>(
    options: T,
    callback?: CommandCallback<CommandArguments<T>>
  ): this {
    if (callback) {
      this.overloads.set(options, callback as CommandCallback);
    } else {
      this.overloads.set(options, () => { });
    }

    // Return the registry.
    return this;
  }

  /**
   * Registers a subcommand with the given name, description, and callback.
   * @param name The name of the subcommand.
   * @param description The description of the subcommand.
   * @param callback The callback of the subcommand.
   * @param aliases The aliases of the subcommand.
   * @returns The subcommand that was registered.
   */
  public registerSubCommand<T = Record<string, unknown>>(
    name: string,
    description: string,
    callback: CommandCallback<T>,
    aliases?: Array<string>
  ): SubCommand<T>;

  /**
   * Registers a subcommand with the given name, description, registry callback, and execution callback.
   * @param name The name of the subcommand.
   * @param description The description of the subcommand.
   * @param registry The registry callback of the subcommand.
   * @param callback The execution callback of the subcommand.
   * @param aliases The aliases of the subcommand.
   * @returns The subcommand that was registered.
   */
  public registerSubCommand<T = Record<string, unknown>>(
    name: string,
    description: string,
    registry: CommandRegistryCallback,
    callback: CommandCallback<T>,
    aliases?: Array<string>
  ): SubCommand<T>;

  /**
   * Registers a subcommand with the given name, description, and callbacks.
   * @param name The name of the subcommand.
   * @param description The description of the subcommand.
   * @param registry The registry callback or execution callback.
   * @param callback The execution callback (optional if registry is the execution callback).
   * @param aliases The aliases of the subcommand.
   * @returns The subcommand that was registered.
   */
  public registerSubCommand<T = Record<string, unknown>>(
    name: string,
    description: string,
    registry: CommandRegistryCallback | CommandCallback<T>,
    callback?: CommandCallback<T> | Array<string>,
    aliases?: Array<string>
  ): SubCommand<T> {
    // Create a new registry instance for the subcommand
    const regInstance = new CommandRegistry();

    // Determine if we have a registry callback or just an execution callback
    const hasRegistryCallback = typeof callback === "function";
    const execCallback = hasRegistryCallback
      ? (callback as CommandCallback<T>)
      : (registry as CommandCallback<T>);
    const regCallback = hasRegistryCallback
      ? (registry as CommandRegistryCallback)
      : () => { };
    const subAliases = hasRegistryCallback
      ? (aliases ?? [])
      : Array.isArray(callback)
        ? callback
        : [];

    // Execute the registry callback
    regCallback(regInstance);

    // Create a new subcommand instance
    const subcommand = new SubCommand<T>(
      name,
      description,
      subAliases,
      regInstance,
      execCallback
    );

    // Register the subcommand by name
    this.subcommands.set(name, subcommand as SubCommand<unknown>);

    // Register the subcommand by all its aliases
    for (const alias of subAliases) {
      this.subcommands.set(alias, subcommand as SubCommand<unknown>);
    }

    // Return the subcommand
    return subcommand;
  }
}

export { CommandRegistry };
