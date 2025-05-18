import { Enchantment } from "@serenityjs/protocol";

import { CustomEnum } from "./custom";

import type { CommandArgumentPointer } from "../../execution-state";

class EnchantmentsEnum extends CustomEnum {
  /**
   * The type of the enum.
   */
  public static readonly identifier = "enchantments";

  /**
   * The options of the enum.
   */
  public static readonly options = Object.keys(Enchantment)
    .map((key) =>
      key
        .replace(/([A-Z])/g, "_$1")
        .replace(/^_/, "")
        .toLowerCase()
    )
    .filter((key) => {
      // Check if the key is a number.
      if (Number.isNaN(+key)) return true;

      // Remove the key if it is a number.
      return false;
    });

  /**
   * Whether the enum is strict to its options.
   */
  public static readonly strict = true;

  /**
   * The result of the enum.
   */
  public readonly result: Enchantment | null;

  /**
   * Creates an instance of boolean enum.
   * @param result The result of the enum.
   */
  public constructor(result: Enchantment | null) {
    super(result?.toString() ?? "", EnchantmentsEnum.options);
    this.result = result;
  }

  /**
   * Checks if the enum value is applicable.
   * @param error Whether to throw an error if the enum value is not applicable.
   * @returns Returns `true` if the enum value is applicable, or `false` otherwise.
   */
  public validate(error?: boolean): boolean {
    // Check if the result is either true or false.
    if (this.result && Enchantment[this.result]) return true;

    // Throw an error if the result is not a valid boolean.
    if (error)
      throw new TypeError(
        `Expected one of: ${EnchantmentsEnum.options.join(", ")}`
      );

    // Return false if the result is not a valid boolean.
    return false;
  }

  public static extract(
    pointer: CommandArgumentPointer
  ): EnchantmentsEnum | null {
    // Peek the next value from the pointer.
    let peek = pointer.peek();

    // Check if the peek value is null.
    if (!peek) return new EnchantmentsEnum(null);

    // Read the next value from the pointer
    peek = pointer.next() as string;

    // Convert the value to pascal case
    const value = peek
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("") as keyof typeof Enchantment;

    // Check if the value is a valid enchantment.
    const enchantment = Enchantment[value];

    // Return null if the value is not a boolean.
    return new EnchantmentsEnum(enchantment);
  }
}

export { EnchantmentsEnum };
