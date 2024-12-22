import {
  DisconnectReason,
  NetworkSettingsPacket,
  Packet,
  PROTOCOL_VERSION,
  type RequestNetworkSettingsPacket
} from "@serenityjs/protocol";

import { NetworkHandler } from "../network";

import type { Connection } from "@serenityjs/raknet";

class RequestNetworkSettingsHandler extends NetworkHandler {
  public static readonly packet = Packet.RequestNetworkSettings;

  public handle(
    packet: RequestNetworkSettingsPacket,
    connection: Connection
  ): void {
    // Check is the servers protocol is greater than the clients protocol.
    // This would mean the client needs to be updated.
    // Also check if the servers protocol is less than the clients protocol.
    // This would mean the server needs to be updated.
    if (PROTOCOL_VERSION > packet.protocol) {
      // Send the client the servers protocol version.
      return this.network.disconnectConnection(
        connection,
        "Outdated client! Please use the latest version of Minecraft Bedrock.",
        DisconnectReason.OutdatedClient
      );
    } else if (PROTOCOL_VERSION < packet.protocol) {
      // Send the client the servers protocol version.
      return this.network.disconnectConnection(
        connection,
        "Outdated server! Please wait for the server to be updated.",
        DisconnectReason.OutdatedServer
      );
    }

    // Once we have determined that the client is using the correct protocol version,
    // We can send the client the network settings.
    // Will will assign the values from the network instance to the settings packet.
    const settings = new NetworkSettingsPacket();
    settings.compressionThreshold = this.serenity.network.compressionThreshold;
    settings.compressionMethod = this.serenity.network.compressionMethod;
    settings.clientThrottle = false;
    settings.clientThreshold = 0;
    settings.clientScalar = 0;

    // Send the settings packet to the client.
    this.network.sendNormal(connection, settings);

    // We can now enable compression for the session.
    // For this point on, some packets will be compressed.
    this.network.setCompression(connection, true);
  }
}

export { RequestNetworkSettingsHandler };
