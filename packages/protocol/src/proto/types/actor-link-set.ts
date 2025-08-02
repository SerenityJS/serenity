import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { ActorLink } from "./actor-link";

class ActorLinkSet extends DataType {
  public static read(stream: BinaryStream): Array<ActorLink> {
    // Prepare an array to store the links.
    const links: Array<ActorLink> = [];

    // Read the number of links
    const amount = stream.readVarInt();

    // Iterate through the number of links
    for (let index = 0; index < amount; index++)
      // Read the link and push it to the array.
      links.push(ActorLink.read(stream));

    // Return the links.
    return links;
  }

  public static write(stream: BinaryStream, value: Array<ActorLink>): void {
    // Write the number of links given in the array.
    stream.writeVarInt(value.length);

    // Iterate through the array of links, writing each link to the stream.
    for (const link of value) ActorLink.write(stream, link);
  }
}

export { ActorLinkSet };
