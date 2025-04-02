import {
  Worker as WorkerThread,
  isMainThread,
  parentPort,
  workerData
} from "node:worker_threads";
import { deflateRawSync, inflateRawSync } from "node:zlib";

import {
  CompressionMethod,
  DataPacket,
  Framer,
  PacketPool,
  deserialize
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { SerializerMethod } from "../enums";

import { ConnectionProperties, Network, NetworkProperties } from "./network";

type DeserializeQueueCallback = (packets: Array<DataPacket>) => void;
type SerializeQueueCallback = (packets: Buffer) => void;

interface DeserializeMessage extends ConnectionProperties {
  method: SerializerMethod;
  index: bigint;
  buffers: Array<Uint8Array>;
}

interface SerializeMessage extends ConnectionProperties {
  method: SerializerMethod;
  index: bigint;
  packets: Array<DataPacket>;
}

type WorkerMessage = DeserializeMessage | SerializeMessage;

interface DeserializeResult {
  method: SerializerMethod;
  index: bigint;
  packets: Array<DataPacket>;
}

interface SerializeResult {
  method: SerializerMethod;
  index: bigint;
  buffer: Uint8Array;
}

type WorkerResult = DeserializeResult | SerializeResult;

class Serializer {
  /**
   * The worker thread instance that will be used to serialize and deserialize data.
   */
  private readonly worker: WorkerThread;

  /**
   * The network instance of the server.
   */
  private readonly network: Network;

  /**
   * The raknet connection instance of the server.
   */
  private readonly connection: Connection;

  /**
   * The queue of packets that are waiting to be deserialized.
   * This is used to keep track of the packets that are waiting to be processed.
   */
  private readonly dQueue = new Map<bigint, DeserializeQueueCallback>();

  /**
   * The queue of packets that are waiting to be serialized
   * This is used to keep track of the packets that are waiting to be processed.
   */
  private readonly sQueue = new Map<bigint, SerializeQueueCallback>();

  /**
   * The index of the current packet being processed.
   * This is used to keep track of the current packet being processed.
   */
  private index = 0n;

  /**
   * Get the properties of the network connection.
   */
  private get properties(): ConnectionProperties {
    return {
      ...this.network.connections.get(this.connection)!,
      serializer: null
    };
  }

  /**
   * Create a new serializer instance.
   * @param network The network instance of the server.
   */
  public constructor(network: Network, connection: Connection) {
    // Assign the network and properties to the serializer
    this.network = network;
    this.connection = connection;

    console.log(this.network.properties);

    // Create a new worker thread for the serializer
    this.worker = new WorkerThread(__filename, {
      workerData: this.network.properties
    });

    this.worker.on("message", this.onMessage.bind(this));
  }

  private onMessage(message: WorkerResult): void {
    // Switch the message method to determine what to do
    switch (message.method) {
      // Call the deserialize method with the index and data
      case SerializerMethod.Deserialize: {
        // Cast the message to the DeserializeMessage type
        message = message as DeserializeResult;

        // Map the packets to their corresponding packet classes
        const packets = message.packets.map(
          (packet) =>
            PacketPool.get(packet._id_)?.fromJson(packet) as DataPacket
        );

        // Call the callback with the result
        const callback = this.dQueue.get(message.index);
        if (callback) callback(packets);

        // Delete the callback from the queue
        this.dQueue.delete(message.index);
        break;
      }

      // Call the serialize method with the index and packets
      case SerializerMethod.Serialize: {
        // Cast the message to the SerializeMessage type
        message = message as SerializeResult;

        // Convert the array to a buffer
        const buffer = Buffer.from(message.buffer);

        // Call the callback with the result
        const callback = this.sQueue.get(message.index);
        if (callback) callback(buffer);

        // Delete the callback from the queue
        this.sQueue.delete(message.index);
        break;
      }
    }
  }

  /**
   * Terminate the worker thread for the serializer.
   */
  public terminate(): void {
    void this.worker.terminate();
  }

  public serialize(
    callback: SerializeQueueCallback,
    ...packets: Array<DataPacket>
  ): void {
    // Check if the data is empty
    if (packets.length === 0) return callback(Buffer.alloc(0));

    // Get the next index for the data
    const index = ++this.index;

    // Set the callback for the data
    this.sQueue.set(index, callback);

    // Send the data to the worker thread for processing
    this.worker.postMessage({
      ...this.properties,
      method: SerializerMethod.Serialize,
      index,
      packets
    });
  }

  public deserialize(
    callback: DeserializeQueueCallback,
    ...buffers: Array<Buffer>
  ): void {
    // Check if the data is empty
    if (buffers.length === 0) return callback([]);

    // Get the next index for the data
    const index = ++this.index;

    // Set the callback for the data
    this.dQueue.set(index, callback);

    // Send the data to the worker thread for processing
    this.worker.postMessage({
      ...this.properties,
      method: SerializerMethod.Deserialize,
      index,
      buffers
    });
  }

  /**
   * The connection and network properties of serializer.
   */
  private static readonly properties: NetworkProperties = workerData;

  static {
    // Check if this current thread is the worker thread
    if (!isMainThread && workerData?.compressionMethod !== null) {
      // Bind the worker messages to the serializer
      parentPort?.on("message", this.onMessage.bind(this));
    }
  }

  private static onMessage(message: WorkerMessage): void {
    // Switch the message method to determine what to do
    switch (message.method) {
      // Call the deserialize method with the index and data
      case SerializerMethod.Deserialize: {
        // Cast the message to the DeserializeMessage type
        message = message as DeserializeMessage;

        // Deserialize the data and get the packets
        const packets = this.deserialize(message, ...message.buffers);

        // Post the result back to the main thread
        return parentPort?.postMessage({
          method: SerializerMethod.Deserialize,
          index: message.index,
          packets
        });
      }

      // Call the serialize method with the index and packets
      case SerializerMethod.Serialize: {
        // Cast the message to the SerializeMessage type
        message = message as SerializeMessage;

        // Convert the packets to their corresponding packet classes
        const packets = message.packets.map((packet) => {
          return PacketPool.get(packet._id_)?.fromJson(packet) as DataPacket;
        });

        // Serialize the packets and get the buffers
        const buffer = this.serialize(message, ...packets);

        // Post the result back to the main thread
        return parentPort?.postMessage({
          method: SerializerMethod.Serialize,
          index: message.index,
          buffer
        });
      }
    }
  }

  public static deserialize(
    properties: ConnectionProperties,
    ...buffers: Array<Uint8Array>
  ): Array<Partial<DataPacket>> {
    // Prepare an array to hold the packets
    const packets: Array<Partial<DataPacket>> = [];

    // Iterate over the data and process it
    for (const array of buffers) {
      // Check if the buffer proper header for bedrock edition
      if (array[0] !== 0xfe) continue; // Skip if not

      // Create a buffer from the array
      const buffer = Buffer.from(array);

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
              ? inflateRawSync(decrypted)
              : algorithm === CompressionMethod.Snappy
                ? decrypted
                : decrypted;

      // Unframe the inflated buffer.
      // Buffers can contains multiple packets, so we need to unframe them.
      for (const frame of Framer.unframe(inflated)) {
        // Attempt to deserialize the buffer into a packet.
        try {
          // Deserialize the buffer into a packet.
          const packet = deserialize(frame) as DataPacket & { _id_: number };

          // Check if the packet is valid.
          if (packet) {
            // Add the packet id to the packet.
            packet["_id_"] = packet.getId();

            // Push the packet to the packets array.
            packets.push(DataPacket.toJson(packet));
          }
        } catch (reason) {
          console.log(reason);
        }
      }
    }

    // Return the packets.
    return packets;
  }

  public static serialize(
    properties: ConnectionProperties,
    ...packets: Array<DataPacket>
  ): Buffer {
    // Prepare an array to hold the buffers
    const buffers: Array<Buffer> = [];

    // Iterate over the packets and process them
    for (const packet of packets) {
      try {
        buffers.push(packet.serialize());
      } catch (reason) {
        console.log(reason);
      }
    }

    const framed = Framer.frame(...buffers);

    // Depending on the size of the framed buffer, we will compress it
    const deflated =
      framed.byteLength > this.properties.compressionThreshold &&
      properties.compression
        ? Buffer.concat([
            Buffer.from([this.properties.compressionMethod]),
            deflateRawSync(framed)
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

    // Return the payload.
    return payload;
  }
}

export { Serializer };
