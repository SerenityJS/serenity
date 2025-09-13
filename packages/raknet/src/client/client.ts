import { createSocket, RemoteInfo, Socket } from "node:dgram";

import Emitter from "@serenityjs/emitter";
import { Logger, LoggerColors } from "@serenityjs/logger";

import { NetworkSession } from "../shared";
import { Packet, Priority, Status } from "../enums";
import {
  Ack,
  Address,
  ConnectedPing,
  ConnectedPong,
  ConnectionRequestAccepted,
  FrameSet,
  Nack,
  NewIncomingConnection,
  OpenConnectionRequest1,
  UnconnectedPing,
} from "../proto";
import { Offline } from "../shared/offline";

import { ClientEvents, ClientOptions, defaultClientOptions } from "./types";

export class Client extends Emitter<ClientEvents> {
  private session: NetworkSession;
  private socket: Socket;
  public options: ClientOptions;
  public logger: Logger;
  public status: Status;
  public tick: number;
  private interval: NodeJS.Timeout | null = null;

  public constructor(options: Partial<ClientOptions> = {}) {
    super();
    this.logger = new Logger("Client", LoggerColors.MaterialCopper);
    this.options = {
      ...defaultClientOptions,
      ...options,
    };
    this.status = Status.Disconnected;
    this.tick = 0;
    Offline.client = this;
    this.socket = createSocket("udp4");
    this.session = new NetworkSession(this.options.mtu, this.logger);
    this.session.handle = this.incomingBatch.bind(this);
    this.session.send = this.send.bind(this);
    this.socket.on("message", this.handle.bind(this));
    this.interval = setInterval(
      this.onTick.bind(this),
      1000 / this.options.tickRate
    );
  }

  public onTick(): void {
    const isDisconnected = this.status === Status.Disconnected;
    const isDisconnecting = this.status === Status.Disconnecting;

    const canPing = isDisconnected && this.tick % this.options.pingRate === 0;
    if (canPing) this.ping();
    if (!isDisconnecting || !isDisconnected) {
      this.session.onTick();
    }
    this.tick++;
  }

  public ping(): void {
    const ping = new UnconnectedPing();
    ping.client = this.options.guid;
    ping.timestamp = BigInt(Date.now());
    const serialized = ping.serialize();
    this.send(serialized);
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.status = Status.Connecting;
      const request = new OpenConnectionRequest1();
      request.mtu = this.options.mtu;
      request.protocol = 11; // Only 11 is supported cuz 10 is too old
      const serialized = request.serialize();
      this.send(serialized);
      const timeout = setTimeout(() => {
        reject(new Error("Connection timed out"));
      }, this.options.timeout);
      this.onceAfter("connect", () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  public send(payload: Buffer): void {
    this.socket.send(payload, this.options.port, this.options.address);
  }

  public frameAndSend(
    payload: Buffer,
    priority: Priority = Priority.Normal
  ): void {
    this.session.frameAndSend(payload, priority);
  }

  public incomingBatch(payload: Buffer): void {
    const id = payload[0];
    switch (id) {
      case 254: {
        this.emit("encapsulated", payload);
        break;
      }
      case Packet.ConnectedPong: {
        break;
      }
      case Packet.ConnectedPing: {
        const ping = new ConnectedPing(payload).deserialize();
        const pong = new ConnectedPong();
        pong.pingTimestamp = ping.timestamp;
        pong.timestamp = BigInt(Date.now());
        this.frameAndSend(ping.serialize(), Priority.Normal);
        break;
      }
      case Packet.ConnectionRequestAccepted: {
        const accepted = new ConnectionRequestAccepted(payload).deserialize();
        const nic = new NewIncomingConnection();
        nic.serverAddress = new Address(
          this.socket.address().address,
          this.socket.address().port,
          this.socket.address().family === "IPv4" ? 4 : 6
        );
        nic.internalAddress = new Address("127.0.0.1", 0, 4);
        nic.incomingTimestamp = BigInt(Date.now());
        nic.serverTimestamp = accepted.timestamp;
        this.frameAndSend(nic.serialize(), Priority.Immediate);
        this.emit("connect");
        break;
      }
      default: {
        // this.logger.warn(`Unknown packet type: ${id}`);
        break;
      }
    }
  }

  public handle(payload: Buffer, rinfo: RemoteInfo) {
    if (payload.length < 1) return;

    let id = payload[0]!;
    const isOnline = (id & 0xf0) === 0x80;
    if (isOnline) id = 0x80;

    switch (id) {
      case Packet.FrameSet: {
        const frameSet = new FrameSet(payload).deserialize();
        this.session.onFrameSet(frameSet);
        break;
      }
      case Packet.Ack: {
        const ack = new Ack(payload).deserialize();
        this.session.onAck(ack);
        break;
      }
      case Packet.Nack: {
        const nack = new Nack(payload).deserialize();
        this.session.onNack(nack);
        break;
      }
      case Packet.OpenConnectionReply1: {
        Offline.openConnectionReply1(payload, rinfo);
        break;
      }
      case Packet.OpenConnectionReply2: {
        Offline.openConnectionReply2();
        break;
      }
    }
  }

  public disconnect(): void {
    this.socket.close();
    if (this.interval) clearInterval(this.interval);
  }
}
