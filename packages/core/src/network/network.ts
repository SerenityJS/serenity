import { deflateRawSync, inflateRawSync } from "node:zlib";

import { Emitter } from "@serenityjs/emitter";
import {
  type Connection,
  NetherNetServerProperties,
  Server
} from "@serenityjs/nethernet";
import { Logger, LoggerColors } from "@serenityjs/logger";
import {
  CompressionMethod,
  type DataPacket,
  DisconnectMessage,
  DisconnectPacket,
  DisconnectReason,
  Framer,
  Gamemode,
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

  /**
   * The serialized packets waiting to be sent in the next batch
   */
  queue: Array<Buffer>;

  /**
   * The amount of bytes waiting to be sent in the next batch
   */
  queued: number;
}

interface NetworkProperties {
  compressionMethod: CompressionMethod;
  compressionThreshold: number;
  frameMonitoring: boolean;
  packetsPerFrame: number;
}

const DefaultNetworkProperties: NetworkProperties = {
  compressionMethod: CompressionMethod.Zlib,
  compressionThreshold: 256,
  frameMonitoring: true,
  packetsPerFrame: 64
};

/**
 * The amount of queued bytes after which a batch is sent without waiting for the next flush.
 */
const MAX_BATCH_SIZE = 1024 * 1024;

class Network extends Emitter<NetworkEvents> {
  /**
   * The serenity instance that is being used to handle incoming packets
   */
  public readonly serenity: Serenity;

  /**
   * The nethernet instance that is being used to handle incoming packets
   */
  public readonly nethernet: Server;

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
  public readonly handlers = new Set<NetworkHandler>();

  /**
   * The connections that have packets waiting to be sent
   */
  protected readonly pending = new Set<Connection>();

  /**
   * Whether a flush of the pending connections is scheduled
   */
  protected flushScheduled = false;

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
   * Creates a new network handler for a nethernet server
   * @param serenity The serenity instance to handle incoming packets with
   * @param properties The properties of the network
   * @param nethernetProperties The properties of the nethernet server
   * @param handlers The handlers to register to the network
   */
  public constructor(
    serenity: Serenity,
    properties?: Partial<NetworkProperties>,
    nethernetProperties?: Partial<NetherNetServerProperties>,
    handlers?: Array<typeof NetworkHandler>
  ) {
    super();

    // Set an error handler for the emitter
    this.onError((error) =>
      this.logger.error(
        "An error occurred while emitting a network event:",
        error
      )
    );

    // Assign the serenity instance to the network
    this.serenity = serenity;

    // Assign the properties to the network with the default properties
    this.properties = { ...DefaultNetworkProperties, ...properties };

    // Create a new nethernet server for the network handler
    // The protocol and version always come from the protocol package, not from saved properties
    this.nethernet = new Server({
      message: "SerenityJS",
      ...nethernetProperties,
      protocol: PROTOCOL_VERSION,
      version: MINECRAFT_VERSION
    });

    // Report the live server state to clients before they join
    this.nethernet.statusResolver = () => {
      const world = this.serenity.getWorld();
      const players = this.serenity.players.size;
      if (!world) return { players };

      // Clients only know the survival, creative and adventure game types here
      const gameType = world.getDefaultGamemode();

      return {
        players,
        level: world.identifier,
        gameType: gameType <= Gamemode.Adventure ? gameType : Gamemode.Survival
      };
    };

    // Bind the incoming packets to the message method
    this.nethernet.on("message", this.onMessage.bind(this));

    // Bind the incoming connections to the connect method
    this.nethernet.on("connect", this.onConnect.bind(this));

    // Bind the incoming disconnections to the disconnect method
    this.nethernet.on("disconnect", this.onDisconnect.bind(this));

    // Register the handlers to the network
    for (const handler of handlers || []) this.registerHandler(handler);

    // Check if frame monitoring is enabled
    if (this.properties.frameMonitoring) {
      // Log a debug message that frame monitoring is enabled
      this.logger.debug(
        `Frame monitoring is §aenabled§r; connections sending more than §u${this.properties.packetsPerFrame} packets-per-frame§r will be disconnected.`
      );
    } else {
      // Log a debug message that frame monitoring is disabled
      this.logger.debug(`Frame monitoring is §cdisabled§r.`);
    }
  }

  /**
   * Registers a new handler to the network
   * @param handler The handler to register to the network
   */
  public registerHandler(handler: typeof NetworkHandler): void {
    // Add the handler to the handlers set
    this.handlers.add(new handler(this.serenity));

    // Log a debug message that the handler has been registered
    this.logger.debug(
      `Registered handler §u${handler.name}§r which will listen for client bound §u${Packet[handler.packet]}§r packets.`
    );
  }

  /**
   * Unregisters a handler from the network
   * @param handler The handler to unregister from the network
   */
  public unregisterHandler(handler: typeof NetworkHandler): void {
    // Iterate over all the handlers that are registered to the network
    for (const x of this.handlers) {
      // Check if the handler is the same as the one that is being unregistered
      if (x.constructor.name === handler.name) {
        // Remove the handler from the handlers set
        this.handlers.delete(x);
        break;
      }
    }

    // Log a debug message that the handler has been unregistered
    this.logger.debug(
      `Unregistered handler §u${handler.name}§r which will no longer listen for client bound §u${Packet[handler.packet]}§r packets.`
    );
  }

  /**
   * Handles all incoming connections from the nethernet server
   * @param connection The connection that is being established
   */
  public onConnect(connection: Connection): void {
    // Check if the connection is already in the connections map
    if (this.connections.has(connection)) return connection.disconnect();

    // Create a new connection object with the default properties
    const object: ConnectionProperties = {
      compression: false,
      encryption: false,
      queue: [],
      queued: 0
    };

    // Add the connection to the connections map
    this.connections.set(connection, object);

    // Log a debug message that a connection has been established
    this.logger.debug(
      `Connection established from §u${connection.rinfo.address}§r:§u${connection.rinfo.port}§r.`
    );
  }

  /**
   * Handles all disconnections from the nethernet server
   * @param connection The connection that is being disconnected
   */
  public onDisconnect(connection: Connection): void {
    // Check if the connection is in the connections map
    const properties = this.connections.get(connection);
    if (!properties) return;

    // Create a dummy disconnect packet
    const packet = new DisconnectPacket();
    packet.reason = DisconnectReason.Disconnected;
    packet.hideDisconnectScreen = true;

    // Then we will create a dummy, uncompressed payload.
    const framed = Framer.frame(packet.serialize());
    const payload = properties.compression
      ? Buffer.concat([Buffer.from([CompressionMethod.None]), framed])
      : framed;

    // Finally we will call the onMessage method with the dummy payload.
    this.onMessage(connection, payload);

    // Remove the connection from the connections map
    this.connections.delete(connection);
    this.pending.delete(connection);

    // Remove the connection from the players map
    this.serenity.players.delete(connection);

    // Log a debug message that a connection has been disconnected
    this.logger.debug(
      `Connection disconnected with ${connection.rinfo.address}:${connection.rinfo.port}`
    );
  }

  /**
   * Handles all incoming packet traffic from the nethernet server
   * @param connection The nethernet connection the data is coming from
   * @param buffer The batch of packets that was sent from the connection
   */
  public onMessage(connection: Connection, buffer: Buffer): void {
    // Get the connection object from the connections map
    const properties = this.connections.get(connection);

    // Check if the connection is not in the connections map
    if (!properties)
      throw new Error(
        "Received data from a connection that is not a registered connection."
      );

    // NetherNet frames each batch itself, so there is no batch header to strip.
    // Batches only carry a compression header once compression has been enabled for the connection.
    const algorithm: CompressionMethod = properties.compression
      ? (buffer[0] as number)
      : CompressionMethod.NotPresent;

    // Strip the compression header from the buffer
    const decrypted = properties.compression ? buffer.subarray(1) : buffer;

    // Inflate the buffer based on the compression algorithm.
    // Unknown algorithms are treated as malformed batches.
    const inflated =
      algorithm === CompressionMethod.None ||
      algorithm === CompressionMethod.NotPresent
        ? decrypted
        : algorithm === CompressionMethod.Zlib
          ? this.inflateZlib(decrypted)
          : algorithm === CompressionMethod.Snappy
            ? this.inflateSnappy(decrypted)
            : null;

    if (inflated === null) {
      // This case can occur when a custom protocol client sends a malformed compressed packet.
      // This could also be used as an attempt to crash the server.
      this.logger.warn(
        `Unable to inflate packet from "§u${connection.rinfo.address}§r:§u${connection.rinfo.port}§r", Disconnecting the session.`
      );

      return this.disconnectConnection(
        connection,
        "Invalid compressed packet",
        DisconnectReason.BadPacket
      );
    }

    // Unframe the inflated buffer.
    // Buffers can contains multiple packets, so we need to unframe them.
    const frames = Framer.unframe(inflated);

    // Check if the frames amount is greater than the packets per frame.
    // If so, we will log a warning and disconnect the session.
    // This could be an attempt to crash the server, or some other malicious intent.
    if (
      this.properties.frameMonitoring && // Check if frame monitoring is enabled
      frames.length > this.properties.packetsPerFrame
    ) {
      // Log a warning if too many packets were sent at once.
      this.logger.warn(
        `Received ${frames.length} packets from "${connection.rinfo.address}:${connection.rinfo.port}", which exceeds the packets per frame limit of ${this.properties.packetsPerFrame}. Disconnecting the session.`
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
          `No packet serializer/deserializer found for packet §u${Packet[packetId] ?? packetId}§r.`
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
            `Packet received with id §u${Packet[packetId] ?? packetId}§r was cancelled by an external listener.`
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
            `No handlers found for packet §u${Packet[packetId]} §r(§u${packetId}§r).`
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
              // Call the handle method for the handler.
              handler.handle(packet, connection);
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

  /**
   * Inflates a zlib compressed buffer
   * @param buffer The zlib compressed buffer to inflate
   * @returns The inflated buffer
   */
  public inflateZlib(buffer: Buffer): Buffer | null {
    try {
      return inflateRawSync(buffer);
    } catch {
      return null;
    }
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
   * Queues a batch of packets for a connection.
   * Packets queued during the same turn of the event loop are sent together in one batch, like vanilla does.
   * @param connection The connection to send the packets to
   * @param packets The packets to send to the connection
   */
  public send(connection: Connection, ...packets: Array<DataPacket>): void {
    // Get the connection object from the connections map
    const properties = this.connections.get(connection);

    // Check if the connection is not in the connections map
    if (!properties)
      throw new Error(
        "Attempted to send packets to a connection that is not a registered connection."
      );

    // Iterate over all the packets that are being sent, and attempt to serialize them
    // We will also emit the packet event to through the network event emitter
    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i]!;
      const id = packet.getId() as Packet;

      // Create a new packet event for the packet
      const event = {
        bound: NetworkBound.Client,
        connection,
        packet
      };

      // Emit the packet event to the registered handlers
      const network = this.emit(id, event);
      const all = this.emit("all", event);

      // Check if the packet was cancelled by an external listener
      // If so, the registered handlers will not be called
      if (!network || !all) {
        // Log a debug message if the packet was cancelled by an external listener
        this.logger.debug(
          `Packet sent with id ${Packet[id] ?? id} was cancelled by an external listener.`
        );

        // Skip the packet if it was cancelled by an external listener
        continue;
      }

      // Attempt to serialize the packet
      try {
        // Serialize the packet and add it to the queue of the connection
        const serialized = packet.serialize();
        properties.queue.push(serialized);
        properties.queued += serialized.byteLength;
      } catch (reason) {
        // Log the serialization error if the packet could not be serialized
        this.logger.error(
          `Failed to serialize packet with id ${Packet[id] ?? id}`,
          reason
        );
      }
    }

    // If nothing survived filtering / serialization, do nothing
    if (properties.queue.length === 0) return;

    // Send large batches straight away, to bound their size
    if (properties.queued >= MAX_BATCH_SIZE) return this.flush(connection);

    // Schedule the queued packets to be sent at the end of this turn of the event loop
    this.pending.add(connection);
    if (this.flushScheduled) return;
    this.flushScheduled = true;

    setImmediate(() => {
      this.flushScheduled = false;

      // Send the queued packets of every pending connection
      for (const pending of this.pending) {
        try {
          this.flush(pending);
        } catch (reason) {
          // Log the sending error if the packets could not be sent
          this.logger.error(
            `Failed to send packet(s) to ${pending.rinfo.address}:${pending.rinfo.port}`,
            reason
          );
        }
      }
    });
  }

  /**
   * Sends the queued packets of a connection as a single batch
   * @param connection The connection to send the queued packets of
   */
  public flush(connection: Connection): void {
    // Remove the connection from the pending connections
    this.pending.delete(connection);

    // Get the connection object from the connections map
    const properties = this.connections.get(connection);

    // Check if the connection has any queued packets
    if (!properties || properties.queue.length === 0) return;

    // Frame the queued packets into a singular buffer
    const framed = Framer.frame(...properties.queue);
    properties.queue = [];
    properties.queued = 0;

    // Depending on the size of the framed buffer, we will compress it
    let payload: Buffer;
    if (properties.compression) {
      if (framed.byteLength > this.properties.compressionThreshold) {
        const deflated = this.deflateZlib(framed);
        // [methodByte][deflated]
        payload = Buffer.allocUnsafe(1 + deflated.byteLength);
        payload[0] = this.properties.compressionMethod;
        deflated.copy(payload, 1);
      } else {
        // [None][framed]
        payload = Buffer.allocUnsafe(1 + framed.byteLength);
        payload[0] = CompressionMethod.None;
        framed.copy(payload, 1);
      }
    } else {
      payload = framed;
    }

    // NetherNet connections are encrypted by DTLS, and frame batches themselves.
    // So the payload is sent as is, without encryption or a batch header.
    connection.send(payload);
  }

  /**
   * Sends a batch of packets to a connection, with the next batch
   * @param connection The connection to send the packets to
   * @param packets The packets to send to the connection
   */
  public sendNormal(
    connection: Connection,
    ...packets: Array<DataPacket>
  ): void {
    // Check if the connection is not in the connections map
    if (!this.connections.has(connection)) return;

    try {
      this.send(connection, ...packets);
    } catch (reason) {
      // Log the sending error if the packets could not be sent
      this.logger.error(
        `Failed to send packet(s) to ${connection.rinfo.address}:${connection.rinfo.port}`,
        reason
      );

      // Delete the connection from the connections map
      this.serenity.players.delete(connection);
    }
  }

  /**
   * Sends a batch of packets to a connection immediately, along with the packets queued before them
   * @param connection The connection to send the packets to immediately
   * @param packets The packets to send to the connection
   */
  public sendImmediate(
    connection: Connection,
    ...packets: Array<DataPacket>
  ): void {
    // Check if the connection is not in the connections map
    if (!this.connections.has(connection)) return;

    try {
      this.send(connection, ...packets);
      this.flush(connection);
    } catch (reason) {
      // Log the sending error if the packets could not be sent
      this.logger.error(
        `Failed to send packet(s) to ${connection.rinfo.address}:${connection.rinfo.port}`,
        reason
      );

      // Delete the connection from the connections map
      this.serenity.players.delete(connection);
    }
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

    // Send the packets queued under the previous compression state first
    this.flush(connection);

    // Set the compression property for the connection
    properties.compression = enabled;
  }

  /**
   * Sets the encryption state of a connection.
   * NetherNet connections are already encrypted by DTLS, so packets are never encrypted by the network.
   * @param connection The connection to set the encryption state of
   * @param enabled Whether encryption is enabled
   */
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

    // Disconnect the NetherNet connection after sending the packet
    setImmediate(() => connection.disconnect());
  }
}

export { Network, NetworkProperties };
