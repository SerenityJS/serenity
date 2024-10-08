import { DataType } from "./type";
import { Address } from "./address";

import type { BinaryStream } from "@serenityjs/binarystream";
import type { NetworkIdentifier } from "../../types";

/**
 * Represents an address data type.
 * Address is used when establishing a connection in RakNet.
 */
class SystemAddress extends DataType {
  /**
   * Converts the Address data type to a NetworkIdentifier.
   *
   * @param identifier The NetworkIdentifier.
   * @returns The NetworkIdentifier.
   */
  public static fromIdentifier(identifier: NetworkIdentifier): Address {
    return new Address(identifier.address, identifier.port, identifier.version);
  }

  /**
   * Reads the Address data type from a binary stream.
   * @param stream The binary stream to read from.
   * @returns The Address data type.
   */
  public static read(stream: BinaryStream): Array<Address> {
    // Prepare the addresses array.
    const addresses: Array<Address> = [];

    // Read the addresses.
    for (let index = 0; index < 20; index++) {
      const address = Address.read(stream);
      addresses.push(address);
    }

    // Return the addresses.
    return addresses;
  }

  /**
   * Writes the Address data type to a binary stream.
   * @param stream The binary stream to write to.
   * @param value The value to write.
   */
  public static write(stream: BinaryStream): void {
    const addresses: Array<Address> = [
      { address: "127.0.0.1", port: 0, version: 4 }
    ];
    for (let index = 0; index < 20; index++) {
      Address.write(
        stream,
        addresses[index] || { address: "0.0.0.0", port: 0, version: 4 }
      );
    }
  }
}

export { SystemAddress };
