import { deflateRawSync, inflateRawSync } from "node:zlib";

import { Emitter } from "@serenityjs/emitter";
import {
  type Connection,
  Frame,
  Priority,
  RaknetServerProperties,
  Reliability,
  Server
} from "@serenityjs/raknet";
import { Logger, LoggerColors } from "@serenityjs/logger";
import {
  CompressionMethod,
  type DataPacket,
  DisconnectMessage,
  DisconnectPacket,
  DisconnectReason,
  Framer,
  getPacketId,
  MINECRAFT_VERSION,
  Packet,
  Packets,
  PROTOCOL_VERSION
} from "@serenityjs/protocol";

import { NetworkBound } from "../enums";

import type { NetworkHandler } from "./handler";
import type { Serenity } from "../serenity";
import type { NetworkEvents } from "../types";

interface ConnectionProperties {
  compression: boolean;
  encryption: boolean;
}

const DefaultProperties: ConnectionProperties = {
  compression: false,
  encryption: false
};

interface NetworkProperties {
  compressionMethod: CompressionMethod;
  compressionThreshold: number;
  packetsPerFrame: number;
}

const DefaultNetworkProperties: NetworkProperties = {
  compressionMethod: CompressionMethod.Zlib,
  compressionThreshold: 256,
  packetsPerFrame: 64
};

class Network extends Emitter<NetworkEvents> {
  /**
   * The serenity instance that is being used to handle incoming packets
   */
  public readonly serenity: Serenity;

  /**
   * The raknet instance that is being used to handle incoming packets
   */
  public readonly raknet: Server;

  /**
   * The properties that are being used for the network
   */
  public readonly properties: NetworkProperties;

  /**
   * The logger that is being used to log network events
   */
  public readonly logger = new Logger("Network", LoggerColors.Blue);

  /**
   * The current connections that are being handled by the network
   */
  public readonly connections = new Map<Connection, ConnectionProperties>();

  /**
   * The registered handlers that are being used to handle incoming packets
   */
  public readonly handlers = new Set<typeof NetworkHandler>();

  /**
   * The current compression method that is being used for the network
   */
  public get compressionMethod(): CompressionMethod {
    return this.properties.compressionMethod;
  }

  /**
   * The current compression method that is being used for the network
   */
  public set compressionMethod(method: CompressionMethod) {
    this.properties.compressionMethod = method;
  }

  /**
   * The current compression threshold that is being used for the network
   */
  public get compressionThreshold(): number {
    return this.properties.compressionThreshold;
  }

  /**
   * The current compression threshold that is being used for the network
   */
  public set compressionThreshold(threshold: number) {
    this.properties.compressionThreshold = threshold;
  }

  /**
   * The current packets per frame that is being used for the network
   */
  public get packetsPerFrame(): number {
    return this.properties.packetsPerFrame;
  }

  /**
   * The current packets per frame that is being used for the network
   */
  public set packetsPerFrame(packets: number) {
    this.properties.packetsPerFrame = packets;
  }

  /**
   * Creates a new network handler for a raknet server
   * @param serenity The serenity instance to handle incoming packets with
   * @param handlers The handlers to register to the network
   */
  public constructor(
    serenity: Serenity,
    properties?: Partial<NetworkProperties>,
    raknetProperties?: Partial<RaknetServerProperties>,
    handlers?: Array<typeof NetworkHandler>
  ) {
    super();

    // Assign the serenity instance to the network
    this.serenity = serenity;

    // Assign the properties to the network with the default properties
    this.properties = { ...DefaultNetworkProperties, ...properties };

    // Create a new raknet server for the network handler
    this.raknet = new Server({
      message: "SerenityJS",
      protocol: PROTOCOL_VERSION,
      version: MINECRAFT_VERSION,
      ...raknetProperties
    });

    // Bind the incoming packets to the incoming method
    this.raknet.on("encapsulated", this.onEncapsulated.bind(this));

    // Bind the incoming connections to the connect method
    this.raknet.on("connect", this.onConnect.bind(this));

    // Bind the incoming disconnections to the disconnect method
    this.raknet.on("disconnect", this.onDisconnect.bind(this));

    // Register the handlers to the network
    for (const handler of handlers || []) this.registerHandler(handler);
  }

  /**
   * Registers a new handler to the network
   * @param handler The handler to register to the network
   */
  public registerHandler(handler: typeof NetworkHandler): void {
    this.handlers.add(handler);
  }

  /**
   * Unregisters a handler from the network
   * @param handler The handler to unregister from the network
   */
  public unregisterHandler(handler: typeof NetworkHandler): void {
    this.handlers.delete(handler);
  }

  /**
   * Handles all incoming connections from the raknet server
   * @param connection The connection that is being established
   */
  public onConnect(connection: Connection): void {
    // Check if the connection is already in the connections map
    if (this.connections.has(connection)) return connection.disconnect();

    // Create a new connection object with the default properties
    const object = { ...DefaultProperties } as ConnectionProperties;

    // Add the connection to the connections map
    this.connections.set(connection, object);

    // Log a debug message that a connection has been established
    this.logger.debug(
      `Connection established with ${connection.rinfo.address}:${connection.rinfo.port}`
    );
  }

  /**
   * Handles all disconnections from the raknet server
   * @param connection The connection that is being disconnected
   */
  public onDisconnect(connection: Connection): void {
    // Check if the connection is in the connections map
    if (!this.connections.has(connection)) return;

    // Create a dummy disconnect packet
    const packet = new DisconnectPacket();
    packet.reason = DisconnectReason.Disconnected;
    packet.hideDisconnectScreen = true;

    // Then we will create a dummy payload.
    const payload = Buffer.from([
      0xfe,
      CompressionMethod.None,
      ...Framer.frame(packet.serialize())
    ]);

    // Finally we will call the onEncapsulated method with the dummy payload.
    this.onEncapsulated(connection, payload);

    // Remove the connection from the connections map
    this.connections.delete(connection);

    // Remove the connection from the players map
    this.serenity.players.delete(connection);

    // Log a debug message that a connection has been disconnected
    this.logger.debug(
      `Connection disconnected with ${connection.rinfo.address}:${connection.rinfo.port}`
    );
  }

  /**
   * Handles all incoming packet traffic from the raknet server
   * @param connection The raknet connection the data is coming from
   * @param data The data buffers that are being sent from the connection
   */
  public onEncapsulated(connection: Connection, ...data: Array<Buffer>): void {
    // Get the connection object from the connections map
    const properties = this.connections.get(connection);

    // Check if the connection is not in the connections map
    if (!properties)
      throw new Error(
        "Received data from a connection that is not a registered connection."
      );

    // Iterate over all the data buffers that are being sent
    for (const buffer of data) {
      // Check if the first byte is a header for a minecraft packet
      if (buffer[0] !== 0xfe) throw new Error("Invalid packet header");

      // Check if the connection is encrypted.
      // NOTE: Encryption is not implemented yet. So we will just handle the packet as if it was not encrypted.
      // TODO: Implement encryption for the connection.
      let decrypted = properties.encryption
        ? buffer.subarray(1)
        : buffer.subarray(1);

      // Get the compression byte from the decrypted buffer.
      const compression = decrypted[0] as number;

      // Some packets have a byte that represents the compression algorithm.
      // Read the compression algorithm from the buffer.
      const algorithm: CompressionMethod = CompressionMethod[compression]
        ? decrypted.readUint8()
        : CompressionMethod.NotPresent;

      if (algorithm !== CompressionMethod.NotPresent)
        decrypted = decrypted.subarray(1);

      // Inflate the buffer based on the compression algorithm.
      const inflated =
        algorithm === CompressionMethod.None
          ? decrypted
          : algorithm === CompressionMethod.NotPresent
            ? decrypted
            : algorithm === CompressionMethod.Zlib
              ? this.inflateZlib(decrypted)
              : algorithm === CompressionMethod.Snappy
                ? this.inflateSnappy(decrypted)
                : decrypted;

      // Unframe the inflated buffer.
      // Buffers can contains multiple packets, so we need to unframe them.
      const frames = Framer.unframe(inflated);

      // Check if the frames amount is greater than the packets per frame.
      // If so, we will log a warning and disconnect the session.
      // This could be an attempt to crash the server, or some other malicious intent.
      if (frames.length > this.properties.packetsPerFrame) {
        // Log a warning if too many packets were sent at once.
        this.logger.warn(
          `Received too many packets from "${connection.rinfo.address}:${connection.rinfo.port}", disconnecting the session.`
        );

        // Disconnect the session if too many packets were sent at once.
        return connection.disconnect();
      }

      // Iterate over all the frames that were unframed.
      // And pass the packets to the registered handlers.
      for (const frame of frames) {
        // Read the packet id from the frame.
        const packetId = getPacketId(frame);

        // Get the packet from the packet id.
        const packetType = Packets[packetId];

        // Check if the no packet was found for the packet id.
        if (!packetType) {
          // Log a debug message if no packet was found for the packet id.
          this.logger.debug(
            `No packet serializer/deserializer found for packet id ${Packet[packetId] ?? packetId}.`
          );

          // Skip the packet if no packet was found for the packet id.
          continue;
        }

        // Attempt to deserialize the packet from the frame.
        try {
          // Deserialize the packet from the frame.
          const packet = new packetType(frame).deserialize();

          // Construct the packet event for the registered handlers.
          const event = {
            bound: NetworkBound.Server,
            connection,
            packet
          };

          // Emit the packet event to the registered handlers.
          const network = this.emit(packetId, event);
          const all = this.emit("all", event);

          // Check if the packet was cancelled by an external listener.
          // If so, the registered handlers will not be called.
          if (!network || !all) {
            // Log a debug message if the packet was cancelled by an external listener.
            this.logger.debug(
              `Packet received with id ${Packet[packetId] ?? packetId} was cancelled by an external listener.`
            );

            // Skip the packet if it was cancelled by an external listener.
            continue;
          }

          // Filter out all the handlers that have a packet that matches the packet id.
          const handlers = Array.from(this.handlers).filter((handler) => {
            return handler.packet === packetId;
          });

          // Check if no handlers were found for the packet id.
          if (handlers.length === 0) {
            // Debug log that no handlers were found for the packet id.
            this.logger.debug(
              `No handlers found for packet ${Packet[packetId]}, with id ${packetId}`
            );

            // Skip the packet if no handlers were found for the packet id.
            continue;
          }

          // Iterate over all the registered handlers.
          // And call the handle method for each handler.
          for (const handler of handlers) {
            // Check if the handler has a packet that matches the packet id.
            if (handler.packet === packetId) {
              // Attempt to handle the packet with the handler.
              try {
                // Create a new instance of the handler with the serenity instance.
                const instance = new handler(this.serenity);

                // Call the handle method for the handler.
                instance.handle(packet, connection);
              } catch (reason) {
                // Log the handling error if the packet could not be handled.
                this.logger.error(
                  `Failed to handle packet with id ${packetId}`,
                  reason
                );
              }
            }
          }
        } catch (reason) {
          // Log the deserialization error if the packet could not be deserialized.
          this.logger.error(
            `Failed to deserialize packet with id ${Packet[packetId] ?? packetId}`,
            reason
          );
        }
      }
    }
  }

  /**
   * Inflates a zlib compressed buffer
   * @param buffer The zlib compressed buffer to inflate
   * @returns The inflated buffer
   */
  public inflateZlib(buffer: Buffer): Buffer {
    return inflateRawSync(buffer);
  }

  /**
   * Inflates a snappy compressed buffer
   * @param buffer The snappy compressed buffer to inflate
   * @returns The inflated buffer
   */
  public inflateSnappy(_buffer: Buffer): Buffer {
    throw new Error("Not implemented");
  }

  /**
   * Send a batch of packets to a connection with a specified priority
   * @param connection The connection to send the packets to
   * @param priority The priority of the packets being sent
   * @param packets The packets to send to the connection
   */
  public send(
    connection: Connection,
    priority = Priority.Normal,
    ...packets: Array<DataPacket>
  ): void {
    // Get the connection object from the connections map
    const properties = this.connections.get(connection);

    // Check if the connection is not in the connections map
    if (!properties)
      throw new Error(
        "Attempted to send packets to a connection that is not a registered connection."
      );

    // Prepare the data buffers to send to the connection
    const data: Array<Buffer> = [];

    // Iterate over all the packets that are being sent, and attempt to serialize them
    // We will also emit the packet event to through the network event emitter
    for (const packet of packets) {
      // Create a new packet event for the packet
      const event = {
        bound: NetworkBound.Client,
        connection,
        packet
      };

      // Emit the packet event to the registered handlers
      const network = this.emit(packet.getId() as Packet, event);
      const all = this.emit("all", event);

      // Check if the packet was cancelled by an external listener
      // If so, the registered handlers will not be called
      if (!network || !all) {
        // Log a debug message if the packet was cancelled by an external listener
        this.logger.debug(
          `Packet sent with id ${Packet[packet.getId()] ?? packet.getId()} was cancelled by an external listener.`
        );

        // Skip the packet if it was cancelled by an external listener
        continue;
      }

      // Attempt to serialize the packet
      try {
        // Serialize the packet and add it to the data buffers
        data.push(packet.serialize());
      } catch (reason) {
        // Log the serialization error if the packet could not be serialized
        this.logger.error(
          `Failed to serialize packet with id ${Packet[packet.getId()] ?? packet.getId()}`,
          reason
        );
      }
    }

    // Frame the data buffers into a singular buffer
    const framed = Framer.frame(...data);

    // Depending on the size of the framed buffer, we will compress it
    const deflated =
      framed.byteLength > this.properties.compressionThreshold &&
      properties.compression
        ? Buffer.concat([
            Buffer.from([this.properties.compressionMethod]),
            this.deflateZlib(framed)
          ])
        : properties.compression
          ? Buffer.concat([Buffer.from([CompressionMethod.None]), framed])
          : framed;

    // We will then check if encryption is enabled for the session.
    // If so, we will encrypt the deflated payload.
    // If not, we will just use the deflated payload.
    // NOTE: Encryption is not implemented yet. So we will just use the deflated payload for now.
    // TODO: Implement encryption for the session.
    const encrypted = properties.encryption ? deflated : deflated;

    // We will then construct the final payload with the game header and the encrypted compressed payload.
    const payload = Buffer.concat([Buffer.from([0xfe]), encrypted]);

    // Finally we will assemble a new frame with the payload.
    // The frame contains the reliability and priority of the packet.
    // As well as the payload itself.
    const frame = new Frame();
    frame.reliability = Reliability.Reliable;
    frame.orderChannel = 0;
    frame.payload = payload;

    // And send the frame to the session.
    return connection.sendFrame(frame, priority);
  }

  /**
   * Sends a batch of packets to a connection with normal priority
   * @param connection The connection to send the packets to with normal priority
   * @param packets The packets to send to the connection
   */
  public sendNormal(
    connection: Connection,
    ...packets: Array<DataPacket>
  ): void {
    this.send(connection, Priority.Normal, ...packets);
  }

  /**
   * Sends a batch of packets to a connection with immediate priority
   * @param connection The connection to send the packets to immediately
   * @param packets The packets to send to the connection
   */
  public sendImmediate(
    connection: Connection,
    ...packets: Array<DataPacket>
  ): void {
    this.send(connection, Priority.Immediate, ...packets);
  }

  /**
   * Deflates a buffer using the zlib compression algorithm
   * @param buffer The buffer to deflate
   * @returns The deflated buffer
   */
  public deflateZlib(buffer: Buffer): Buffer {
    return deflateRawSync(buffer);
  }

  public setCompression(connection: Connection, enabled: boolean): void {
    // Get the connection object from the connections map
    const properties = this.connections.get(connection);

    // Check if the connection is not in the connections map
    if (!properties) return;

    // Set the compression property for the connection
    properties.compression = enabled;
  }

  public setEncryption(connection: Connection, enabled: boolean): void {
    // Get the connection object from the connections map
    const properties = this.connections.get(connection);

    // Check if the connection is not in the connections map
    if (!properties) return;

    // Set the encryption property for the connection
    properties.encryption = enabled;
  }

  public disconnectConnection(
    connection: Connection,
    message: string,
    reason: DisconnectReason
  ): void {
    // Create a new DisconnectPacket with the specified message and reason
    const packet = new DisconnectPacket();

    // Assign the message and reason to the packet
    packet.message = new DisconnectMessage(message, String());
    packet.reason = reason;
    packet.hideDisconnectScreen = false;

    // Send the packet to the connection
    this.sendImmediate(connection, packet);
  }
}

export { Network, NetworkProperties };
