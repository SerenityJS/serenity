import { Reliability, Status } from "../enums";
import {
  MAX_REASSEMBLED_SIZE,
  MAX_SEGMENTS,
  RELIABLE_CHANNEL,
  UNRELIABLE_CHANNEL
} from "../constants";

import type { DataChannel, PeerConnection } from "node-datachannel";
import type { ClientIdentity, NetworkAddress } from "../types";
import type { Server } from "./server";

/**
 * Represents a NetherNet connection in the server.
 * A connection wraps a WebRTC peer connection and the two data channels the client opens on it.
 */
class Connection {
  /**
   * The server instance
   */
  protected readonly server: Server;

  /**
   * The WebRTC peer connection of the connection
   */
  public readonly peer: PeerConnection;

  /**
   * The network identifier the client signaled with
   */
  public readonly identifier: string;

  /**
   * The identity the client proved in its SDP offer, if it sent one
   */
  public readonly identity: ClientIdentity | null;

  /**
   * The remote address of the connection.
   * This is the signaling address until the connection is established, then the address WebRTC selected.
   */
  public readonly rinfo: NetworkAddress;

  /**
   * The status of the connection
   */
  public status = Status.Connecting;

  /**
   * The time the connection was created at
   */
  public readonly createdAt = Date.now();

  /**
   * The time the last message was received at
   */
  public lastUpdate = Date.now();

  /**
   * The reliable and ordered data channel
   */
  protected reliable: DataChannel | null = null;

  /**
   * The unreliable and unordered data channel
   */
  protected unreliable: DataChannel | null = null;

  /**
   * The segments of the message being reassembled
   */
  protected segments: Array<Buffer> = [];

  /**
   * The amount of bytes of the message being reassembled
   */
  protected segmentsSize = 0;

  /**
   * The amount of segments still expected for the message being reassembled
   */
  protected remainingSegments = 0;

  /**
   * Messages sent before the reliable data channel opened
   */
  protected readonly queue: Array<Buffer> = [];

  /**
   * Creates a new connection
   * @param server The server instance
   * @param peer The WebRTC peer connection
   * @param identifier The network identifier the client signaled with
   * @param identity The identity the client proved, if any
   * @param rinfo The signaling address of the client
   */
  public constructor(
    server: Server,
    peer: PeerConnection,
    identifier: string,
    identity: ClientIdentity | null,
    rinfo: NetworkAddress
  ) {
    this.server = server;
    this.peer = peer;
    this.identifier = identifier;
    this.identity = identity;
    this.rinfo = rinfo;

    // Attach the data channels the client opens
    peer.onDataChannel((channel) => this.attach(channel));

    // Close the connection once the peer connection is lost
    peer.onStateChange((state) => {
      if (state === "disconnected" || state === "failed" || state === "closed")
        this.disconnect();
    });
  }

  /**
   * The round-trip time of the connection in milliseconds
   */
  public get ping(): number {
    try {
      return Math.max(0, this.peer.rtt());
    } catch {
      return 0;
    }
  }

  /**
   * Sends a message to the connection, splitting it into segments if needed.
   * @param payload The message to send.
   * @param reliability The data channel to send the message on.
   */
  public send(payload: Buffer, reliability = Reliability.Reliable): void {
    // Check if the connection is closed
    if (this.status === Status.Disconnected) return;

    // Get the data channel for the reliability
    let channel =
      reliability === Reliability.Unreliable ? this.unreliable : this.reliable;

    // Unreliable messages fall back to the reliable channel when it is not usable
    if (reliability === Reliability.Unreliable && !channel?.isOpen())
      channel = this.reliable;

    // Queue the message until the reliable data channel is open
    if (!channel || !channel.isOpen()) return void this.queue.push(payload);

    // Each segment leaves one byte for the segment header
    const size = channel.maxMessageSize() - 1;

    // Unreliable messages cannot be segmented, so larger ones are sent reliably
    if (channel === this.unreliable && payload.byteLength > size)
      return this.send(payload, Reliability.Reliable);

    // Calculate the amount of segments needed for the message
    const total = Math.max(1, Math.ceil(payload.byteLength / size));
    if (total > MAX_SEGMENTS)
      throw new Error(
        `Message of ${payload.byteLength} bytes needs ${total} segments, the maximum is ${MAX_SEGMENTS}.`
      );

    // Send the segments, the header counts down the segments that follow
    for (let index = 0; index < total; index++) {
      const chunk = payload.subarray(index * size, (index + 1) * size);
      const message = Buffer.allocUnsafe(chunk.byteLength + 1);
      message[0] = total - index - 1;
      chunk.copy(message, 1);

      channel.sendMessageBinary(message);
    }
  }

  /**
   * Closes the connection.
   */
  public disconnect(): void {
    // Check if the connection is already closed
    if (this.status === Status.Disconnected) return;

    // Mark the connection as closed, so nothing else is sent
    const connected = this.status === Status.Connected;
    this.status = Status.Disconnected;
    this.queue.length = 0;
    this.segments = [];

    // Let the server forget the connection
    this.server.onClose(this, connected);

    // Give queued data a moment to flush before tearing down the transport
    const close = () => {
      try {
        this.reliable?.close();
        this.unreliable?.close();
        this.peer.close();
      } catch {
        // The peer connection may already be closed
      }
    };

    if (this.reliable?.isOpen() && this.reliable.bufferedAmount() > 0)
      setTimeout(close, 250).unref();
    else close();
  }

  /**
   * Attaches a data channel opened by the client.
   * @param channel The data channel to attach.
   */
  protected attach(channel: DataChannel): void {
    const label = channel.getLabel();

    // Determine the reliability of the channel from its label
    let reliability: Reliability;
    if (label === RELIABLE_CHANNEL && !this.reliable) {
      this.reliable = channel;
      reliability = Reliability.Reliable;
    } else if (label === UNRELIABLE_CHANNEL && !this.unreliable) {
      this.unreliable = channel;
      reliability = Reliability.Unreliable;
    } else {
      // Unknown and duplicate data channels are not part of the protocol
      this.server.logger.debug(
        `Closing unexpected data channel "${label}" from §u${this.rinfo.address}§r.`
      );

      return channel.close();
    }

    // Handle the messages of the channel
    channel.onMessage((message) => {
      // Data channels can deliver text or binary messages
      const buffer =
        typeof message === "string"
          ? Buffer.from(message)
          : Buffer.isBuffer(message)
            ? message
            : Buffer.from(message as ArrayBuffer);

      this.incoming(buffer, reliability);
    });

    // The connection cannot work without its reliable channel
    channel.onClosed(() => {
      if (reliability === Reliability.Reliable) this.disconnect();
    });

    channel.onError((error) =>
      this.server.logger.debug(
        `Data channel "${label}" of §u${this.rinfo.address}§r errored: ${error}`
      )
    );

    // The connection is established once the reliable channel is open
    if (reliability === Reliability.Reliable) {
      if (channel.isOpen()) this.onOpen();
      else channel.onOpen(() => this.onOpen());
    }
  }

  /**
   * Handles the reliable data channel opening.
   */
  protected onOpen(): void {
    // Check if the connection is still connecting
    if (this.status !== Status.Connecting) return;
    this.status = Status.Connected;
    this.lastUpdate = Date.now();

    // Update the remote address to the one WebRTC selected
    const pair = this.peer.getSelectedCandidatePair();
    if (pair) {
      this.rinfo.address = pair.remote.address;
      this.rinfo.port = pair.remote.port;
      this.rinfo.family = pair.remote.address.includes(":") ? "IPv6" : "IPv4";
    }

    // Let the server know the connection is established
    this.server.onOpen(this);

    // Send the messages that were queued while connecting
    for (const payload of this.queue.splice(0)) this.send(payload);
  }

  /**
   * Handles an incoming message, reassembling segmented messages.
   * @param data The message, prefixed with its segment header.
   * @param reliability The data channel the message was received on.
   */
  protected incoming(data: Buffer, reliability: Reliability): void {
    // Check if the connection is closed
    if (this.status === Status.Disconnected) return;
    this.lastUpdate = Date.now();

    // A message is at least its segment header
    if (data.byteLength < 1) return;

    // The header counts the segments that follow this one
    const remaining = data[0] as number;
    const payload = data.subarray(1);

    // Unreliable messages are never segmented
    if (reliability === Reliability.Unreliable) {
      if (remaining !== 0) return;

      return void this.server.emit("message", this, payload, reliability);
    }

    // A continuation must count down from the previous segment
    if (this.segments.length > 0 && remaining !== this.remainingSegments - 1) {
      this.server.logger.debug(
        `Received segment ${remaining} from §u${this.rinfo.address}§r while expecting ${this.remainingSegments - 1}, disconnecting.`
      );

      return this.disconnect();
    }

    // Unsegmented messages are passed on directly
    if (this.segments.length === 0 && remaining === 0)
      return void this.server.emit("message", this, payload, reliability);

    // Buffer the segment, bounding the size of the reassembled message
    this.segments.push(payload);
    this.segmentsSize += payload.byteLength;
    this.remainingSegments = remaining;

    if (this.segmentsSize > MAX_REASSEMBLED_SIZE) {
      this.server.logger.debug(
        `Segmented message from §u${this.rinfo.address}§r exceeds ${MAX_REASSEMBLED_SIZE} bytes, disconnecting.`
      );

      return this.disconnect();
    }

    // Wait for the remaining segments
    if (remaining > 0) return;

    // Reassemble the message from its segments
    const message = Buffer.concat(this.segments, this.segmentsSize);
    this.segments = [];
    this.segmentsSize = 0;

    this.server.emit("message", this, message, reliability);
  }
}

export { Connection };
