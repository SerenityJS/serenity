import {
  BinaryStream,
  DataType,
  DataTypeOptions
} from "@serenityjs/binarystream";

function TypeArray<T extends typeof DataType>(
  type: T,
  size: typeof DataType
): typeof DataType {
  return class ListType extends DataType {
    public static read(
      stream: BinaryStream,
      options?: DataTypeOptions
    ): Array<T> {
      // Read the length of the list.
      const length = size.read(stream, options) as number;

      // Prepare the list and read each element.
      const list: Array<T> = [];
      for (let i = 0; i < length; i++) {
        list.push(type.read(stream, options) as T);
      }

      // Return the list.
      return list;
    }

    public static write(
      stream: BinaryStream,
      value: Array<T>,
      options?: DataTypeOptions
    ): void {
      // Write the length of the list.
      size.write(stream, value.length, options);

      // Write each element in the list.
      for (const element of value) {
        type.write(stream, element, options);
      }
    }
  };
}

export { TypeArray };
