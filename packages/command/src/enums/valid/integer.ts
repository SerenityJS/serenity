import { ValidEnum } from "./valid";

import type { CommandExecutionState } from "../../execution-state";

class IntegerEnum extends ValidEnum {
  /**
   * The type of the enum.
   */
  public static readonly name = "number";

  /**
   * The symbol of the enum.
   */
  public static readonly symbol = (this.type << 16) | 0x01;

  /**
   * The result of the enum.
   */
  public readonly result: number;

  public constructor(result: number) {
    super();
    this.result = result;
  }

  public static extract<O>(
    state: CommandExecutionState<O>
  ): IntegerEnum | undefined {
    // Read next argument in slice array.
    const text = state.readNext();

    // Ensure the argument is valid and defined.
    if (typeof text === "string") {
      // If an empty string call extract again to try next argument.
      if (text.length === 0) return this.extract(state);

      // Attempt to parse argument as a float.
      const number = Number.parseFloat(text);

      // If not NaN return the integer.
      if (!Number.isNaN(number)) return new IntegerEnum(number);
      // Otherwise throw syntax error with tip.
      throw new TypeError(`Expected integer or floating point!`);

      // If argument is invalid/undefined throw expected argument syntax error.
    } else throw new Error("Expected argument!");
  }
}

export { IntegerEnum };
