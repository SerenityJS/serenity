import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";
import type { HudElement } from "../../enums";

class HudElementData extends DataType {
  /**
   * The element of the hud.
   */
  public readonly element: HudElement;

  /**
   * Creates a new hud element data.
   * @param element The element of the hud.
   */
  public constructor(element: HudElement) {
    super();
    this.element = element;
  }

  public static read(stream: BinaryStream): Array<HudElementData> {
    // Prepare the elements.
    const elements: Array<HudElementData> = [];

    // Read the amount of elements.
    const amount = stream.readVarInt();
    for (let index = 0; index < amount; index++) {
      // Read the element id.
      const element = stream.readZigZag();

      // Push the element to the list.
      elements.push(new this(element));
    }

    // Return the elements.
    return elements;
  }

  public static write(
    stream: BinaryStream,
    value: Array<HudElementData>
  ): void {
    // Write the amount of elements.
    stream.writeVarInt(value.length);

    // Write the elements.
    for (const element of value) {
      stream.writeZigZag(element.element);
    }
  }
}

export { HudElementData };
