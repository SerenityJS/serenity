/* eslint-disable @typescript-eslint/unified-signatures */

import type {
  CommandArguments,
  CommandCallback,
  CommandOverload
} from "../types";

class CommandRegistry {
  /**
   * The overloads of the command.
   */
  public readonly overloads = new Map<CommandOverload, CommandCallback>();

  /**
   * The permissions of the command.
   */
  public permissions: Array<string> = [];

  /**
   * The aliases for this command.
   */
  public aliases: Array<string> = [];

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
}

export { CommandRegistry };
