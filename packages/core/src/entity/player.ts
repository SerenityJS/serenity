import { Connection } from "@serenityjs/raknet";
import { DataPacket } from "@serenityjs/protocol";

import { PlayerProperties } from "../types";
import { Dimension } from "../world";
import { EntityIdentifier } from "../enums";

import { Entity } from "./entity";

class Player extends Entity {
  /**
   * The raknet connection of the player
   */
  public readonly connection: Connection;

  public readonly username: string;

  public readonly xuid: string;

  public readonly uuid: string;

  public constructor(
    dimension: Dimension,
    connection: Connection,
    properties: PlayerProperties
  ) {
    super(dimension, EntityIdentifier.Player);

    // Assign the connection to the player
    this.connection = connection;

    // Assign the properties to the player
    this.username = properties.username;
    this.xuid = properties.xuid;
    this.uuid = properties.uuid;
  }

  public send(...packets: Array<DataPacket>): void {
    // Send the packets to the player
    this.dimension.world.serenity.network.sendNormal(
      this.connection,
      ...packets
    );
  }

  public sendImmediate(...packets: Array<DataPacket>): void {
    // Send the packets to the player
    this.dimension.world.serenity.network.sendImmediate(
      this.connection,
      ...packets
    );
  }
}

export { Player };
