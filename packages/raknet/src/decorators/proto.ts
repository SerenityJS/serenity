import { CompoundTag } from "@serenityjs/nbt";

import type { DataType } from "@serenityjs/binarystream";
import type { BasePacket } from "../proto";
import type { PacketDataTypeOptions, PacketMetadata } from "../types/packet";

/**
 * Proto decorator for packet classes.
 *
 * @param id Packet id.
 * @returns The packet decorator.
 */
function Proto(id: number) {
  return function (target: typeof BasePacket) {
    // Set the packet id.
    target.id = id;

    // Resolve the metadata for the packet.
    const metadata: Array<PacketMetadata> = Reflect.getOwnMetadata(
      "properties",
      target.prototype
    );

    // Read the properties of the packet.
    const properties = Object.getOwnPropertyNames(target.prototype);

    // Check if the packet does not have the serialize method.
    // This allows custom packets to override the default serialization.
    if (!properties.includes("serialize"))
      // Define the serialize method for the packet.
      target.prototype.serialize = function () {
        // Reset the offset of the binary stream.
        this.offset = 0;

        // Write the packet id using the id type.
        target.id_type.write(this, target.id as never);

        // Check if the packet does not have metadata.
        // If not, return the buffer.
        if (!metadata) return this.getBuffer();

        // Loop through the metadata and write the properties to the binary stream.
        for (const { name, type, options } of metadata) {
          // Check if there is a parameter for type testing.
          if (options?.parameter) {
            // Check if the type is a compound tag.
            if (type.prototype === CompoundTag.prototype)
              throw new Error(
                "Parameters are not supported for CompoundTag serialization."
              );

            // Pull the value from the class using the parameter.
            const parameter = this[options.parameter as keyof BasePacket];

            // Convert the type to DataType.
            const dtype = type as typeof DataType;

            // Pull the data from the class.
            const data = (this as never)[name];

            // Check if the property is optional.
            if (options.optional && data === undefined) {
              // Write a boolean false to indicate the property is not defined.
              this.writeBool(false);

              // Skip serialization for this property.
              continue;
            } else if (options.optional) {
              // Write a boolean true to indicate the property is defined.
              this.writeBool(true);
            }

            // Write the property to the binary stream using the type.
            dtype.write(this, data, {
              ...options,
              parameter
            } as PacketDataTypeOptions);
          } else {
            // Check if the type is a compound tag.
            if (type.prototype === CompoundTag.prototype) {
              // Convert the type to CompoundTag.
              const ctype = type as typeof CompoundTag;

              // Pull the tag from the class.
              const tag = (this as never)[name] as CompoundTag;

              // Check if the property is optional.
              if (options?.optional && tag === undefined) {
                // Write a boolean false to indicate the property is not defined.
                this.writeBool(false);

                // Skip serialization for this property.
                continue;
              } else if (options?.optional) {
                // Write a boolean true to indicate the property is defined.
                this.writeBool(true);
              }

              // Write the property to the binary stream using the type.
              ctype.write(this, tag, {
                ...options,
                varint: options?.varint ?? false,
                name: true,
                type: true
              });
            } else {
              // Convert the type to DataType.
              const dtype = type as typeof DataType;

              // Pull the data from the class.
              const data = (this as never)[name];

              // Check if the property is optional.
              if (options?.optional && data === undefined) {
                // Write a boolean false to indicate the property is not defined.
                this.writeBool(false);

                // Skip serialization for this property.
                continue;
              } else if (options?.optional) {
                // Write a boolean true to indicate the property is defined.
                this.writeBool(true);
              }

              // Write the property to the binary stream using the type.
              dtype.write(this, data, options);
            }
          }
        }

        // Return the buffer.
        return this.getBuffer();
      };

    // Check if the packet does not have the deserialize method.
    // This allows custom packets to override the default deserialization.
    if (!properties.includes("deserialize"))
      target.prototype.deserialize = function () {
        // Read the packet id using the id type.
        target.id_type.read(this);

        // Check if the packet does not have metadata.
        // If not, return the packet.
        if (!metadata) return this;

        // Loop through the metadata and read the properties from the binary stream.
        for (const { name, type, options } of metadata) {
          // Check if there is a parameter for type testing.
          if (options?.parameter) {
            // Check if the type is a compound tag.
            if (type.prototype === CompoundTag.prototype)
              throw new Error(
                "Parameters are not supported for CompoundTag deserialization."
              );

            // Read the property from the binary stream using the parameter.
            const parameter = this[options.parameter as keyof BasePacket];

            // Convert the type to DataType.
            const dtype = type as typeof DataType;

            // Check if the property is optional.
            if (options.optional && this.readBool() === false) {
              // Set the property to undefined if it is not defined.
              (this[name as keyof BasePacket] as unknown) = undefined;
              continue;
            }

            // Set the property using the parameter and the type.
            (this[name as keyof BasePacket] as unknown) = dtype.read(this, {
              ...options,
              parameter
            } as PacketDataTypeOptions);
          } else {
            // Check if the type is a compound tag.
            if (type.prototype === CompoundTag.prototype) {
              // Convert the type to CompoundTag.
              const ctype = type as typeof CompoundTag;

              // Check if the property is optional.
              if (options?.optional && this.readBool() === false) {
                // Set the property to undefined if it is not defined.
                (this[name as keyof BasePacket] as unknown) = undefined;
                continue;
              }

              // Set the property using the type.
              (this[name as keyof BasePacket] as unknown) = ctype.read(this, {
                ...options,
                varint: options?.varint ?? false,
                name: true,
                type: true
              });
            } else {
              // Convert the type to DataType.
              const dtype = type as typeof DataType;

              // Check if the property is optional.
              if (options?.optional && this.readBool() === false) {
                // Set the property to undefined if it is not defined.
                (this[name as keyof BasePacket] as unknown) = undefined;
                continue;
              }

              // Set the property using the type.
              (this[name as keyof BasePacket] as unknown) = dtype.read(
                this,
                options
              );
            }
          }
        }

        // Return the packet.
        return this;
      };

    // Check if the packet does not have the getId method.
    if (!properties.includes("getId"))
      target.prototype.getId = function () {
        return target.id;
      };

    // Check if the packet does not have the getIdType method.
    if (!properties.includes("getIdType"))
      target.prototype.getIdType = function () {
        return target.id_type;
      };
  };
}

export { Proto };
