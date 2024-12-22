import { type RemoteInfo, createSocket } from "node:dgram";

import { Emitter } from "@serenityjs/emitter";
import { Logger, LoggerColors } from "@serenityjs/logger";

import {
  MAX_MTU_SIZE,
  MIN_MTU_SIZE,
  RAKNET_PROTOCOL,
  RAKNET_TICK_LEN
} from "../constants";
import { Bitflags } from "../enums";

import { Offline } from "./offline";

import type { RaknetEvents, RaknetServerProperties } from "../types";
import type { Connection } from "./connection";

const DefaultRaknetServerProperties: RaknetServerProperties = {
  address: "0.0.0.0",
  port: 19132,
  protocol: RAKNET_PROTOCOL,
  version: "1.0.0",
  message: "Raknet Server",
  maxConnections: 40,
  mtuMaxSize: MAX_MTU_SIZE,
  mtuMinSize: MIN_MTU_SIZE
};

/**
 * The raknet server
 */
class Server extends Emitter<RaknetEvents> {
  /**
   * The server tick interval
   */
  protected interval: NodeJS.Timeout | null = null;

  /**
   * The raknet properties for the server instance.
   */
  public readonly properties: RaknetServerProperties;

  /**
   * The raknet server logger
   */
  public readonly logger = new Logger("Raknet", LoggerColors.CyanBright);

  /**
   * The server socket
   */
  public readonly socket = createSocket("udp4");

  /**
   * The server connections
   */
  public readonly connections = new Set<Connection>();

  public readonly guid = BigInt(Math.floor(Math.random() * 2 ** 64));

  /**
   * The address the raknet server is bound to.
   */
  public get address(): string {
    return this.properties.address;
  }

  /**
   * The address the raknet server is bound to.
   */
  public set address(value: string) {
    this.properties.address = value;
  }

  /**
   * The port the raknet server is bound to.
   */
  public get port(): number {
    return this.properties.port;
  }

  /**
   * The port the raknet server is bound to.
   */
  public set port(value: number) {
    this.properties.port = value;
  }

  /**
   * The maximum transmission unit size for the server.
   */
  public get maxMtuSize(): number {
    return this.properties.mtuMaxSize;
  }

  /**
   * The maximum transmission unit size for the server.
   */
  public set maxMtuSize(value: number) {
    this.properties.mtuMaxSize = value;
  }

  /**
   * The minimum transmission unit size for the server.
   */
  public get minMtuSize(): number {
    return this.properties.mtuMinSize;
  }

  /**
   * The minimum transmission unit size for the server.
   */
  public set minMtuSize(value: number) {
    this.properties.mtuMinSize = value;
  }

  /**
   * The protocol version of the server.
   */
  public get protocol(): number {
    return this.properties.protocol;
  }

  /**
   * The protocol version of the server.
   */
  public set protocol(value: number) {
    this.properties.protocol = value;
  }

  /**
   * The version of the server.
   */
  public get version(): string {
    return this.properties.version;
  }

  /**
   * The version of the server.
   */
  public set version(value: string) {
    this.properties.version = value;
  }

  /**
   * The message of the day of the server.
   */
  public get message(): string {
    return this.properties.message;
  }

  /**
   * The message of the day of the server.
   */
  public set message(value: string) {
    this.properties.message = value;
  }

  /**
   * The max connections of the server.
   */
  public get maxConnections(): number {
    return this.properties.maxConnections;
  }

  /**
   * The max connections of the server.
   */
  public set maxConnections(value: number) {
    this.properties.maxConnections = value;
  }

  /**
   * Weather the server is alive
   */
  public alive = true;

  /**
   */
  public constructor(properties?: Partial<RaknetServerProperties>) {
    super();

    // Assign the server properties with the default properties
    this.properties = { ...DefaultRaknetServerProperties, ...properties };

    // Bind the incoming messages to the handle method
    this.socket.on("message", this.handle.bind(this));
    this.socket.unref();

    // Bind server instance to the offline handler
    Offline.server = this;
  }

  /**
   * Starts the server
   */
  public start(shouldTick = true) {
    this.socket.bind(this.port, this.address);

    // Create a tick function
    const tick = () =>
      setTimeout(() => {
        // Check if the server is alive, if not clear the interval
        if (!this.alive || !this.interval) return;

        // Update the connections for the server
        for (const connection of this.connections) connection.tick();

        // Call the tick method for each connection
        return tick();
      }, RAKNET_TICK_LEN);

    // Set the interval to the tick method
    if (shouldTick) this.interval = tick();
  }

  /**
   * Stops the server
   */
  public stop() {
    try {
      // Clear the interval
      if (this.interval) this.interval = null;

      // Close the socket
      this.socket.close();
    } catch {
      void this.emit("error", new Error("Failed to close the server"));
    }
  }

  protected handle(buffer: Buffer, rinfo: RemoteInfo): void {
    // Get the first byte of the buffer, this is the packet header.
    // The packet header contains the packet identifier and the flags associated with the packet.
    const header = buffer[0];

    // Sanity check for the packet header
    if (!header) throw new Error("Invalid packet header");

    // Check if the datagram is an offline packet, if so handle it accordingly
    const offline = (header & Bitflags.Valid) === 0;

    // Attempt to find the connection in the connection set
    const connection = [...this.connections.values()].find(
      (x) => x.rinfo.address === rinfo.address && x.rinfo.port === rinfo.port
    );

    // Check if the remote client is not connected to the server
    // And if the remote client is sending an offline packet
    if (offline)
      // Pass the buffer and remote client information to the offline handler
      return Offline.handle(buffer, rinfo);

    // Check if the remote client has an established connection with the server
    // And if the remote client is sending a connected packet
    if (!offline && connection)
      // Pass the buffer to the connection handler
      return connection.incoming(buffer);
  }

  public send(buffer: Buffer, rinfo: RemoteInfo): void {
    this.socket.send(buffer, rinfo.port, rinfo.address);
  }
}

export { Server };
