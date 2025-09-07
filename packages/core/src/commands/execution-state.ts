import { Dimension } from "../world";
import { Entity } from "../entity";

import { Enum } from "./enums";

import type { Command } from "./command";
import type { CommandContext, CommandResponse } from "../types";

export class CommandArgumentPointer {
  /**
   * The arguments that were passed to the command.
   */
  public readonly arguments: Array<string>;

  /**
   * The state of the command execution.
   */
  public readonly state: CommandExecutionState;

  /**
   * The offset of the arguments.
   */
  public offset = 0;

  /**
   * Creates a new command argument pointer.
   * @param state The state of the command execution.
   * @param arguments The arguments that were passed to the command.
   */
  public constructor(state: CommandExecutionState, arguments_: Array<string>) {
    this.state = state;
    this.arguments = arguments_;
  }

  /**
   * Peeks the next argument.
   * @returns The next argument or null if there are no more arguments.
   */
  public peek(): string | null {
    return this.arguments[this.offset] || null;
  }

  /**
   * Gets the next argument.
   * @returns The next argument or null if there are no more arguments.
   */
  public next(): string | null {
    return this.arguments[this.offset++] || null;
  }
}

class CommandExecutionState {
  /**
   * The split arguments of the command.
   */
  protected readonly split: Array<string>;

  /**
   * The command that was executed.
   */
  public readonly command: Command | undefined;

  /**
   * The origin of the command execution.
   */
  public readonly origin: Dimension | Entity;

  public constructor(
    commands: Array<Command>,
    source: string,
    origin: Dimension | Entity
  ) {
    this.split = this.parse(source);

    // Get the name of the command from the split array.
    const name = this.split.shift();

    // Find the command from the commands
    this.command = commands.find((command) => command.name === name);
    this.origin = origin;
  }

  /**
   * Attempts to execute the command.
   * @returns
   */
  public execute(): CommandResponse | Promise<CommandResponse> {
    // Check if the command is undefined.
    // If it is, we will throw an error.
    if (!this.command) {
      throw new TypeError(
        `Unknown command executed. Please make sure the command exists, and that you have permission to use it.`
      );
    }

    // Create a global context object with the origin.
    const globalContext = { origin: this.origin } as CommandContext<
      Record<string, unknown>
    >;

    // Iterate through the overloads and find a match.
    for (const [overload, callback] of this.command.registry.overloads) {
      try {
        // Create a new context object with the origin.
        const context = { origin: this.origin } as CommandContext<
          Record<string, Enum>
        >;

        // Create a new state object with the split array.
        const state = new CommandArgumentPointer(this, this.split);

        // Iterate through the overload keys and extract the arguments.
        for (const key in overload) {
          const value = overload[key];

          // If value is null or undefined, i quit.
          if (!value) continue;

          // Check for array.
          if (Array.isArray(value)) {
            // Get the enum and optional flag.
            const [type, optional] = value;

            // Check if the argument is optional and if there are any arguments left.
            if (!optional && state.offset >= state.arguments.length) {
              throw new TypeError(`Argument ${key} is required.`);
            }

            // Extract the argument from the split array.
            const value_ = type.extract(state as CommandArgumentPointer);

            // Declare if the value is optional.
            if (value_) value_.optional = optional;

            context[key] = value_ ?? type.default;
          } else {
            // Extract the argument from the split array.
            const value_ = value.extract(state as CommandArgumentPointer);

            // Declare that the enum value is not optional.
            if (value_) value_.optional = false;

            context[key] = value_ ?? value.default;
          }
        }

        // Add the context object to the global context object.
        Object.assign(globalContext, context);

        // Check if there are any arguments left in the split array.
        // If there are, we will continue to the next overload.
        if (state.offset < state.arguments.length) continue;

        // Check that the length of the context object is the same as the overload object.
        if (Object.keys(context).length !== Object.keys(overload).length + 1)
          continue;

        // Iterate through the context object and try to validate.
        for (const [_, value] of Object.entries(context)) {
          if (!(value instanceof Enum)) continue;

          const result = value.result;

          // Check if the value is optional and if it is not valid.
          if (value.optional && (result === null || result === undefined))
            continue;

          // Validate the value.
          value.validate(true);
        }

        // Overload is a match.
        return (callback(context) ?? {}) as CommandResponse;
      } catch {
        // If validation error, continue to the next match.
        continue;
      }
    }

    // Call the global callback with the global context object.
    return (this.command.callback(globalContext) ?? {}) as CommandResponse;
  }

  protected parse(source: string): Array<string> {
    // Create a new regex object to match
    const regex = /"([^"]+)"|(\S+)/g;
    const arguments_ = [];

    // Iterate through the source string and extract the arguments
    let match = null;
    while ((match = regex.exec(source))) {
      arguments_.push(match[1] || match[2]);
    }

    // Return the arguments array.
    return arguments_ as Array<string>;
  }
}

export { CommandExecutionState };
