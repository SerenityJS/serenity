import { Logger, LoggerColors } from "@serenityjs/logger";

import {
  Ack,
  Address,
  ConnectedPing,
  ConnectedPong,
  ConnectionRequest,
  ConnectionRequestAccepted,
  Disconnect,
  Frame,
  FrameSet,
  Nack,
} from "../proto";
import { Bitflags, Priority, Status, Packet } from "../enums";
import { NetworkSession } from "../shared";

import type { RemoteInfo } from "node:dgram";
import type { Server } from "./raknet";

/**
 * Represents a connection in the server
 */
class Connection {
  /**
   * The server instance
   */
  protected readonly server: Server;

  /**
   * Network session
   */
  protected readonly session: NetworkSession;

  /**
   * The status of the connection
   */
  public status = Status.Connecting;

  /**
   * The last update time of the connection
   */
  public lastUpdate = Date.now();

  /**
   * The network identifier of the connection
   */
  public readonly rinfo: RemoteInfo;

  /**
   * The GUID of the connection
   */
  public readonly guid: bigint;

  /**
   * The maximum transmission unit of the connection
   */
  public readonly mtu: number;

  /**
   * Latency of the connection in milliseconds
   */
  public ping: number = 0;

  /**
   * The last ACK ID that was sent, used for ping calculation
   */
  public lastAckId: number | null = null;

  /**
   * The timestamp when the last ACK-tracked packet was sent
   */
  public ackTimeStamp: number = 0;

  /**
   * Creates a new connection
   * @param server The server instance
   * @param rinfo The remote info
   * @param guid The GUID
   * @param mtu The maximum transmission unit
   */
  public constructor(
    server: Server,
    rinfo: RemoteInfo,
    guid: bigint,
    mtu: number
  ) {
    this.server = server;
    this.rinfo = rinfo;
    this.guid = guid;
    this.mtu = mtu;

    this.session = new NetworkSession(
      this.mtu,
      new Logger(
        `Connection-${this.rinfo.address}:${this.rinfo.port}`,
        LoggerColors.MaterialAmethyst
      )
    );

    this.session.send = this.send.bind(this);
    this.session.handle = this.incomingBatch.bind(this);
  }

  /**
   *
   * Send Buffer payload to server
   */
  public send(payload: Buffer) {
    this.server.send(payload, this.rinfo);
  }

  public sendFrame(frame: Frame, priority: Priority = Priority.Immediate) {
    this.session.sendFrame(frame, priority);
  }

  /**
   * Ticks the connection
   */
  public tick(): void {
    // Check if the client is stale
    if (this.lastUpdate + 15_000 < Date.now()) {
      // Log a warning message for stale connections
      this.server.logger.warn(
        `Detected stale connection from §c${this.rinfo.address}§r:§c${this.rinfo.port}§r, disconnecting...`
      );

      // Disconnect the client
      return this.disconnect();
    }

    // Check if the client is disconnecting or disconnected
    if (
      this.status === Status.Disconnecting ||
      this.status === Status.Disconnected
    )
      return;
    this.session.onTick();
  }

  /**
   * Disconnects the connection
   */
  public disconnect(): void {
    // Set the status to disconnecting
    this.status = Status.Disconnecting;

    // Create a new Disconnect instance
    const disconnect = new Disconnect();
    this.session.frameAndSend(disconnect.serialize(), Priority.Immediate);

    // Emit the disconnect event, and delete the connection from the connections map
    void this.server.emit("disconnect", this);
    this.server.connections.delete(this);

    // Set the status to disconnected
    this.status = Status.Disconnected;
  }

  /**
   * Handles incoming packets
   * @param buffer The packet buffer
   */
  public incoming(buffer: Buffer): void {
    // Update the last update time
    this.lastUpdate = Date.now();

    // Reads the header of the packet (u8)
    // And masks it with 0xf0 to get the header
    const header = (buffer[0] as number) & 0xf0;

    // Switches the header of the packet
    // If there is no case for the header, it will log the packet id as unknown
    switch (header) {
      default: {
        // Format the packet id to a hex string
        const id =
          header.toString(16).length === 1
            ? "0" + header.toString(16)
            : header.toString(16);

        // Log a debug message for unknown packet headers
        this.server.logger.debug(
          `Received unknown online packet 0x${id} from ${this.rinfo.address}:${this.rinfo.port}!`
        );

        // Emit an error for unknown packet headers
        return void this.server.emit(
          "error",
          new Error(
            `Received unknown online packet 0x${id} from ${this.rinfo.address}:${this.rinfo.port}!`
          )
        );
      }

      // Handle incoming acks
      case Packet.Ack: {
        this.ack(buffer);
        break;
      }

      // Handle incoming nacks
      case Packet.Nack: {
        this.nack(buffer);
        break;
      }

      // Handle incoming framesets
      case Bitflags.Valid: {
        this.session.onFrameSet(new FrameSet(buffer).deserialize());
        break;
      }
    }
  }

  /**
   * Handles incoming batch packets
   * @param buffer The packet buffer
   */
  protected incomingBatch(buffer: Buffer): void {
    // Reads the header of the packet (u8)
    const header = buffer[0] as number;

    // Check if the connection is still connecting
    if (this.status === Status.Connecting) {
      switch (header) {
        default: {
          // Format the packet id to a hex string
          const id =
            header.toString(16).length === 1
              ? "0" + header.toString(16)
              : header.toString(16);

          // Log a debug message for unknown packet headers
          this.server.logger.debug(
            `Received unknown online packet 0x${id} from ${this.rinfo.address}:${this.rinfo.port}!`
          );

          // Emit an error for unknown packet headers
          return void this.server.emit(
            "error",
            new Error(
              `Received unknown online packet 0x${id} from ${this.rinfo.address}:${this.rinfo.port}!`
            )
          );
        }

        // Check if the packet is a disconnect packet
        case Packet.Disconnect: {
          this.status = Status.Disconnecting;
          this.server.connections.delete(this);
          this.status = Status.Disconnected;
          break;
        }

        // Check if the packet is a connection request packet
        case Packet.ConnectionRequest: {
          this.handleIncomingConnectionRequest(buffer);
          break;
        }

        // Check if the packet is a new incoming connection packet
        // If so, emit the connect event
        case Packet.NewIncomingConnection: {
          this.status = Status.Connected;
          void this.server.emit("connect", this);
          break;
        }
      }

      return;
    }

    // Handle the connected packets
    switch (header) {
      default: {
        // Format the packet id to a hex string
        const id =
          header.toString(16).length === 1
            ? "0" + header.toString(16)
            : header.toString(16);

        // Log a debug message for unknown packet headers
        this.server.logger.debug(
          `Received unknown online packet 0x${id} from ${this.rinfo.address}:${this.rinfo.port}!`
        );

        // Emit an error for unknown packet headers
        return void this.server.emit(
          "error",
          new Error(
            `Received unknown online packet 0x${id} from ${this.rinfo.address}:${this.rinfo.port}!`
          )
        );
      }

      // Check if the packet is a disconnect packet
      case Packet.Disconnect: {
        this.status = Status.Disconnecting;
        void this.server.emit("disconnect", this);
        this.server.connections.delete(this);
        this.status = Status.Disconnected;
        break;
      }

      // Check if the packet is a ping packet
      case Packet.ConnectedPing: {
        return this.handleIncomingConnectedPing(buffer);
      }

      // Check if the a game packet
      case 0xfe: {
        void this.server.emit("encapsulated", this, buffer);
      }
    }
  }

  /**
   * Handles incoming acks
   * @param buffer The packet buffer
   */
  protected ack(buffer: Buffer): void {
    // Deserialize the ack packet
    const ack = new Ack(buffer).deserialize();

    // Iterate over the sequences in the ack packet
    for (const sequence of ack.sequences) {
      // Check if this is the sequence we're tracking for ping calculation
      if (this.lastAckId !== null && sequence === this.lastAckId) {
        const roundTripTime = Date.now() - this.ackTimeStamp;
        this.ping = Math.round(roundTripTime);

        // Reset ping tracking
        this.lastAckId = null;
        this.ackTimeStamp = 0;
      }

      this.session.onAck(ack);
    }
  }

  /**
   * Handles incoming nacks
   * @param buffer The packet buffer
   */
  protected nack(buffer: Buffer): void {
    // Deserialize the nack packet
    const nack = new Nack(buffer).deserialize();

    // Iterate over the sequences in the nack packet
    for (const sequence of nack.sequences) {
      // Check if this is the sequence we're tracking for ping calculation
      if (this.lastAckId !== null && sequence === this.lastAckId) {
        const roundTripTime = Date.now() - this.ackTimeStamp;
        this.ping = Math.round(roundTripTime);

        // Reset ping tracking
        this.lastAckId = null;
        this.ackTimeStamp = 0;
      }

      this.session.onNack(nack);
    }
  }

  /**
   * Handles an incoming connection request
   * @param buffer The packet buffer
   */
  private handleIncomingConnectionRequest(buffer: Buffer): void {
    // Create a new ConnectionRequest instance and deserialize the buffer
    const request = new ConnectionRequest(buffer).deserialize();

    // Create a new ConnectionRequestAccepted instance
    const accepted = new ConnectionRequestAccepted();

    // Set the properties of the accepted packet
    accepted.address = Address.fromIdentifier(this.rinfo);
    accepted.systemIndex = 0;
    accepted.systemAddress = [];
    accepted.requestTimestamp = request.timestamp;
    accepted.timestamp = BigInt(Date.now());

    // Send the frame
    return this.session.frameAndSend(accepted.serialize(), Priority.Normal);
  }

  /**
   * Handles an incoming connected ping
   * @param buffer The packet buffer
   */
  private handleIncomingConnectedPing(buffer: Buffer): void {
    // Create a new ConnectedPing instance and deserialize the buffer
    const ping = new ConnectedPing(buffer).deserialize();
    const pong = new ConnectedPong();
    pong.timestamp = ping.timestamp;
    pong.pingTimestamp = ping.timestamp;
    pong.timestamp = BigInt(Date.now());

    this.session.frameAndSend(pong.serialize(), Priority.Normal);
  }
}

export { Connection };
