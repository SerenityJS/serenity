export class MCIdentifier {
  /**
   * Formats a Minecraft ID to a displayable string
   * @param identifier Minecraft ID to format
   * @returns Displayable string
   * @example
   * ```ts
   * const formatted = MCIdentifier.format('minecraft:stone');
   * console.log(formatted); // Outputs: 'Stone'
   *
   * ```
   */
  static format(identifier: string): string {
    return (
      (identifier
        .split(":")[1]
        ?.replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ") ||
        identifier.split(":")[0]) ??
      identifier
    );
  }
  /**
   * Parses a displayable string to a Minecraft ID
   *
   * Method is **NOT** guaranteed to work for every displayable string
   * @param display Displayable string to parse
   * @returns Minecraft ID
   * @example
   * ```ts
   * const parsed = MCIdentifier.parse('Stone');
   * console.log(parsed); // Outputs: 'minecraft:stone'
   *
   * ```
   */
  static parse(display: string): string {
    return `minecraft:${display.toLowerCase().replace(/ /g, "_")}`;
  }
}