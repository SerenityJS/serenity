import type { BasePacket } from "../proto";
import type { PacketMetadata } from "../types/packet";

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
				// Flush the binary stream.
				this.flush();

				// Write the packet id using the id type.
				target.id_type.write(this, target.id as never);

				// Check if the packet does not have metadata.
				// If not, return the buffer.
				if (!metadata) return this.getBuffer();

				// Loop through the metadata and write the properties to the binary stream.
				for (const { name, type, endian, parameter } of metadata) {
					// Check if there is a parameter for type testing.
					if (parameter) {
						// Pull the value from the class using the parameter.
						const value = this[parameter as keyof BasePacket];

						// Write the property to the binary stream using the type.
						type.write(this, (this as never)[name], endian, value);
					} else {
						// Write the property to the binary stream using the type.
						type.write(this, (this as never)[name], endian);
					}
				}

				// Return the buffer.
				return this.getBuffer();
			};

		// Check if the packet does not have the deserialize method.
		// This allows custom packets to override the default deserialization.
		if (!properties.includes("deserialize"))
			target.prototype.deserialize = function () {
				// Check if the binary stream is empty.
				// If so, return the packet. This means the packet has already been deserialized.
				if (this.binary.length === 0) return this;

				// Read the packet id using the id type.
				target.id_type.read(this);

				// Check if the packet does not have metadata.
				// If not, return the packet.
				if (!metadata) return this;

				// Loop through the metadata and read the properties from the binary stream.
				for (const { name, type, endian, parameter } of metadata) {
					// Check if there is a parameter for type testing.
					if (parameter) {
						// Read the property from the binary stream using the parameter.
						const value = this[parameter as keyof BasePacket];

						// Set the property using the parameter and the type.
						(this[name as keyof BasePacket] as unknown) = type.read(
							this,
							endian,
							value
						);
					} else {
						// Set the property using the type.
						(this[name as keyof BasePacket] as unknown) = type.read(
							this,
							endian
						);
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
