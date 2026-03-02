import type { CommandRegistry } from "./registry";
import type { CommandCallback } from "../types";

class SubCommand<T = unknown> {
  /**
   * The name of the subcommand.
   */
  public readonly name: string;

  /**
   * The description of the subcommand.
   */
  public readonly description: string;

  /**
   * The aliases of the subcommand.
   */
  public readonly aliases: Array<string>;

  /**
   * The registry of the subcommand.
   */
  public readonly registry: CommandRegistry;

  /**
   * The callback of the subcommand.
   */
  public readonly callback: CommandCallback<T>;

  /**
   * Creates a new subcommand.
   * @param name The name of the subcommand.
   * @param description The description of the subcommand.
   * @param aliases The aliases of the subcommand.
   * @param registry The registry of the subcommand.
   * @param callback The callback of the subcommand.
   */
  public constructor(
    name: string,
    description: string,
    aliases: Array<string>,
    registry: CommandRegistry,
    callback: CommandCallback<T>
  ) {
    this.name = name;
    this.description = description;
    this.aliases = aliases;
    this.registry = registry;
    this.callback = callback;
  }
}

export { SubCommand };
