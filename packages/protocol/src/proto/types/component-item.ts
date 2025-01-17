import { CompoundTag } from "@serenityjs/nbt";
import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class ComponentItem extends DataType {
  public readonly name: string;
  public readonly data: CompoundTag<unknown>;

  public constructor(name: string, data: CompoundTag<unknown>) {
    super();
    this.name = name;
    this.data = data;
  }

  public static read(stream: BinaryStream): Array<ComponentItem> {
    // Prepare the array to store the component items.
    const items: Array<ComponentItem> = [];

    // Read the number of items.
    const count = stream.readVarInt();

    // Iterate over the items.
    for (let index = 0; index < count; index++) {
      // Read the name of the item.
      const name = stream.readVarString();

      // Read the data of the item.
      const data = CompoundTag.read(stream, true);

      // Add the item to the array.
      items.push(new ComponentItem(name, data));
    }

    // Return the array of component items.
    return items;
  }

  public static write(stream: BinaryStream, value: Array<ComponentItem>): void {
    // Write the number of items.
    stream.writeVarInt(value.length);

    // Iterate over the items.
    for (const item of value) {
      // Write the name of the item.
      stream.writeVarString(item.name);

      // Write the data of the item.
      CompoundTag.write(stream, item.data, true);
    }
  }
}

export { ComponentItem };
