import { ValidEnum } from "./valid";

import type { CommandArgumentPointer } from "../../execution-state";

class JsonObjectEnum extends ValidEnum {
  /**
   * The type of the enum.
   */
  public static readonly identifier = "json-object";

  /**
   * The symbol of the enum.
   */
  public static readonly symbol = (this.type << 16) | 0x4a;

  /**
   * The options of the enum.
   */
  public static readonly options: Array<string> = [];

  /**
   * Whether the enum is strict to its options.
   */
  public static readonly strict = true;

  /**
   * The result of the enum.
   */
  public readonly result: Record<string, unknown> | null;

  public constructor(result: string | null) {
    super();
    this.result = JSON.parse(result ?? "{}");
  }

  public validate(_error?: boolean): boolean {
    // Check if the value is null.
    if (this.result === null) {
      // Check if we should throw an error.
      if (_error)
        throw new TypeError('Expected type "string" after previous argument.');

      // Return false.
      return false;
    }

    // Return true.
    return true;
  }

  public static extract(
    pointer: CommandArgumentPointer
  ): JsonObjectEnum | null {
    // Check if the pointer is at the end.
    if (pointer.offset >= pointer.arguments.length) return null;

    // Prepare the buffer.
    let buffer = "";

    const bIndex = pointer.offset;
    for (let i = pointer.offset; i < pointer.arguments.length; i++) {
      // Get the next argument.
      const value = pointer.peek();

      // Check if the value is null.
      if (bIndex === i && (!value || !value.startsWith("{")))
        throw new TypeError('Expected "{" at beginning of object.');

      // Check if the value is the last argument.
      if (!value?.endsWith("}")) {
        buffer += pointer.next() + " ";
      } else {
        buffer += pointer.next();
        break;
      }
    }

    // Return the new enum.
    return new JsonObjectEnum(buffer);
  }
}

export { JsonObjectEnum };
