import { BinaryStream } from "@serenityjs/binaryutils";

import { Bitflags, Priority, Reliability, Status, Packet } from "../enums";
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
	Nack
} from "../proto";
import { NetworkIdentifier } from "../types";

import { RaknetServer } from "./raknet";

/**
 * Represents a connection in the server
 */
class Connection {
	/**
	 * The server instance
	 */
	protected readonly server: RaknetServer;

	/**
	 * The status of the connection
	 */
	public status = Status.Connecting;

	/**
	 * The network identifier of the connection
	 */
	public readonly identifier: NetworkIdentifier;

	/**
	 * The GUID of the connection
	 */
	public readonly guid: bigint;

	/**
	 * The maximum transmission unit of the connection
	 */
	public readonly mtu: number;

	// Inputs
	protected readonly receivedFrameSequences = new Set<number>();
	protected readonly lostFrameSequences = new Set<number>();
	protected readonly inputHighestSequenceIndex: Array<number>;
	protected readonly fragmentsQueue: Map<number, Map<number, Frame>> =
		new Map();

	protected readonly inputOrderIndex: Array<number>;
	protected inputOrderingQueue: Map<number, Map<number, Frame>> = new Map();
	protected lastInputSequence = -1;

	// Outputs
	protected readonly outputBackupQueue = new Map<number, Array<Frame>>();
	protected readonly outputOrderIndex: Array<number>;
	protected readonly outputSequenceIndex: Array<number>;
	protected outputFrameQueue: FrameSet;
	protected outputSequence = 0;
	protected outputReliableIndex = 0;
	protected outputFragmentIndex = 0;

	/**
	 * Creates a new connection
	 * @param server The server instance
	 * @param identifier The network identifier
	 * @param guid The GUID
	 * @param mtu The maximum transmission unit
	 */
	public constructor(
		server: RaknetServer,
		identifier: NetworkIdentifier,
		guid: bigint,
		mtu: number
	) {
		this.server = server;
		this.identifier = identifier;
		this.guid = guid;
		this.mtu = mtu;

		// Inputs
		this.inputOrderIndex = Array.from<number>({ length: 32 }).fill(0);
		for (let index = 0; index < 32; index++) {
			this.inputOrderingQueue.set(index, new Map());
		}

		this.inputHighestSequenceIndex = Array.from<number>({ length: 32 }).fill(0);

		// Outputs
		this.outputFrameQueue = new FrameSet();
		this.outputFrameQueue.frames = [];
		this.outputOrderIndex = Array.from<number>({ length: 32 }).fill(0);
		this.outputSequenceIndex = Array.from<number>({ length: 32 }).fill(0);
	}

	/**
	 * Ticks the connection
	 */
	public tick(): void {
		// Check if the client is disconnecting or disconnected
		if (
			this.status === Status.Disconnecting ||
			this.status === Status.Disconnected
		)
			return;

		// Check if we have received any ACKs or NACKs
		// Check if we have received any packets to send an ACK for
		if (this.receivedFrameSequences.size > 0) {
			const ack = new Ack();
			ack.sequences = [...this.receivedFrameSequences].map((x) => {
				this.receivedFrameSequences.delete(x);
				return x;
			});
			this.send(ack.serialize());
		}

		// Check if we have any lost packets to send a NACK for
		if (this.lostFrameSequences.size > 0) {
			const pk = new Nack();
			pk.sequences = [...this.lostFrameSequences].map((x) => {
				this.lostFrameSequences.delete(x);
				return x;
			});
			this.send(pk.serialize());
		}

		// Send the output queue
		return this.sendFrameQueue();
	}

	/**
	 * Sends a buffer to the connection
	 */
	public send(buffer: Buffer): void {
		this.server.send(buffer, this.identifier);
	}

	/**
	 * Disconnects the connection
	 */
	public disconnect(): void {
		// Set the status to disconnecting
		this.status = Status.Disconnecting;

		// Create a new Disconnect instance
		const disconnect = new Disconnect();

		// Construct the frame
		const frame = new Frame();
		frame.reliability = Reliability.Unreliable;
		frame.orderChannel = 0;
		frame.payload = disconnect.serialize();
		// Send the frame
		this.sendFrame(frame, Priority.Immediate);

		// Emit the disconnect event, and delete the connection from the connections map
		void this.server.emit("disconnect", this);
		const key = `${this.identifier.address}:${this.identifier.port}:${this.identifier.version}`;
		this.server.connections.delete(key);

		// Set the status to disconnected
		this.status = Status.Disconnected;
	}

	/**
	 * Handles incoming packets
	 * @param buffer The packet buffer
	 */
	public incoming(buffer: Buffer): void {
		// Reads the header of the packet (u8)
		// And masks it with 0xf0 to get the header
		const header = buffer[0]! & 0xf0;

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
					`Received unknown online packet 0x${id} from ${this.identifier.address}:${this.identifier.port}!`
				);

				// Emit an error for unknown packet headers
				return void this.server.emit(
					"error",
					new Error(
						`Received unknown online packet 0x${id} from ${this.identifier.address}:${this.identifier.port}!`
					)
				);
			}

			// Handle incoming acks
			case Packet.Ack: {
				this.handleIncomingAck(buffer);
				break;
			}

			// Handle incoming nacks
			case Packet.Nack: {
				this.handleIncomingNack(buffer);
				break;
			}

			// Handle incoming framesets
			case Bitflags.Valid: {
				this.handleIncomingFrameSet(buffer);
				break;
			}
		}
	}

	/**
	 * Handles incoming batch packets
	 * @param buffer The packet buffer
	 */
	public incomingBatch(buffer: Buffer): void {
		// Reads the header of the packet (u8)
		const header = buffer[0]!;

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
						`Received unknown online packet 0x${id} from ${this.identifier.address}:${this.identifier.port}!`
					);

					// Emit an error for unknown packet headers
					return void this.server.emit(
						"error",
						new Error(
							`Received unknown online packet 0x${id} from ${this.identifier.address}:${this.identifier.port}!`
						)
					);
				}

				// Check if the packet is a disconnect packet
				case Packet.Disconnect: {
					this.status = Status.Disconnecting;
					const key = `${this.identifier.address}:${this.identifier.port}:${this.identifier.version}`;
					this.server.connections.delete(key);
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
					`Received unknown online packet 0x${id} from ${this.identifier.address}:${this.identifier.port}!`
				);

				// Emit an error for unknown packet headers
				return void this.server.emit(
					"error",
					new Error(
						`Received unknown online packet 0x${id} from ${this.identifier.address}:${this.identifier.port}!`
					)
				);
			}

			// Check if the packet is a disconnect packet
			case Packet.Disconnect: {
				this.status = Status.Disconnecting;
				void this.server.emit("disconnect", this);
				const key = `${this.identifier.address}:${this.identifier.port}:${this.identifier.version}`;
				this.server.connections.delete(key);
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
	private handleIncomingAck(buffer: Buffer): void {
		// Create a new Ack instance and deserialize the buffer
		const ack = new Ack(buffer).deserialize();

		// Checks if the ack has any sequences, and removes them from the output backup queue
		if (ack.sequences.length > 0) {
			for (const sequence of ack.sequences) {
				this.outputBackupQueue.delete(sequence);
			}
		}
	}

	/**
	 * Handles incoming nacks
	 * @param buffer The packet buffer
	 */
	private handleIncomingNack(buffer: Buffer): void {
		// Create a new Nack instance and deserialize the buffer
		const nack = new Nack(buffer).deserialize();

		// Checks if the nack has any sequences, and resends them from the output backup queue
		if (nack.sequences.length > 0) {
			for (const sequence of nack.sequences) {
				if (this.outputBackupQueue.has(sequence)) {
					// Gets the lost frames and sends them again
					const frames = this.outputBackupQueue.get(sequence)!;
					for (const frame of frames) {
						this.sendFrame(frame, Priority.Immediate);
					}
				}
			}
		}
	}

	/**
	 * Handles incoming framesets
	 * @param buffer The packet buffer
	 */
	private handleIncomingFrameSet(buffer: Buffer): void {
		// Create a new FrameSet instance and deserialize the buffer
		const frameset = new FrameSet(buffer).deserialize();

		// Checks if the sequence of the frameset has already been recieved
		if (this.receivedFrameSequences.has(frameset.sequence)) {
			// Log a debug message for duplicate framesets
			this.server.logger.debug(
				`Received duplicate frameset ${frameset.sequence} from ${this.identifier.address}:${this.identifier.port}!`
			);

			return void this.server.emit(
				"error",
				new Error(
					`Recieved duplicate frameset ${frameset.sequence} from ${this.identifier.address}:${this.identifier.port}!`
				)
			);
		}

		// Removes the sequence from the lost frame sequences
		this.lostFrameSequences.delete(frameset.sequence);

		// Checks if the sequence is out of order
		if (
			frameset.sequence < this.lastInputSequence ||
			frameset.sequence === this.lastInputSequence
		) {
			// Log a debug message for out of order framesets
			this.server.logger.debug(
				`Received out of order frameset ${frameset.sequence} from ${this.identifier.address}:${this.identifier.port}!`
			);

			return void this.server.emit(
				"error",
				new Error(
					`Recieved out of order frameset ${frameset.sequence} from ${this.identifier.address}:${this.identifier.port}!`
				)
			);
		}

		// Adds the sequence to the recieved frame sequences, Ack will be sent on next tick
		this.receivedFrameSequences.add(frameset.sequence);

		// Checks if there are any missings framesets,
		// in the range of the last input sequence and the current sequence
		const diff = frameset.sequence - this.lastInputSequence;
		if (diff !== 1) {
			// Check if we are missing more than one packet
			for (
				let index = this.lastInputSequence + 1;
				index < frameset.sequence;
				index++
			) {
				// Add the missing packet to the lost queue
				// Nack will be sent on the next tick
				if (!this.receivedFrameSequences.has(index)) {
					this.lostFrameSequences.add(index);
				}
			}
		}

		// Set the last input sequence to the current sequence
		this.lastInputSequence = frameset.sequence;

		// Handle the frames
		for (const frame of frameset.frames) {
			this.handleFrame(frame);
		}
	}

	/**
	 * Handles incoming frames
	 * @param frame The frame
	 */
	private handleFrame(frame: Frame): void {
		// Checks if the packet is fragmented
		if (frame.isFragmented()) return this.handleFragment(frame);

		// Checks if the packet is sequenced
		if (frame.isSequenced()) {
			if (
				frame.sequenceIndex <
					this.inputHighestSequenceIndex[frame.orderChannel]! ||
				frame.orderIndex < this.inputOrderIndex[frame.orderChannel]!
			) {
				// Log a debug message for out of order frames
				this.server.logger.debug(
					`Recieved out of order frame ${frame.sequenceIndex} from ${this.identifier.address}:${this.identifier.port}!`
				);

				return void this.server.emit(
					"error",
					new Error(
						`Recieved out of order frame ${frame.sequenceIndex} from ${this.identifier.address}:${this.identifier.port}!`
					)
				);
			}

			// Set the new highest sequence index
			this.inputHighestSequenceIndex[frame.orderChannel] =
				frame.sequenceIndex + 1;
			// Handle the packet
			return this.incomingBatch(frame.payload);
		} else if (frame.isOrdered()) {
			// Check if the packet is out of order
			if (frame.orderIndex === this.inputOrderIndex[frame.orderChannel]) {
				this.inputHighestSequenceIndex[frame.orderChannel] = 0;
				this.inputOrderIndex[frame.orderChannel] = frame.orderIndex + 1;

				// Handle the packet
				this.incomingBatch(frame.payload);
				let index = this.inputOrderIndex[frame.orderChannel]!;
				const outOfOrderQueue = this.inputOrderingQueue.get(
					frame.orderChannel
				)!;
				for (; outOfOrderQueue.has(index); index++) {
					this.incomingBatch(outOfOrderQueue.get(index)!.payload);
					outOfOrderQueue.delete(index);
				}

				// Update the queue
				this.inputOrderingQueue.set(frame.orderChannel, outOfOrderQueue);
				this.inputOrderIndex[frame.orderChannel] = index;
			} else if (frame.orderIndex > this.inputOrderIndex[frame.orderChannel]!) {
				const unordered = this.inputOrderingQueue.get(frame.orderChannel)!;
				unordered.set(frame.orderIndex, frame);
			}
		} else {
			// Handle the packet, no need to format it
			return this.incomingBatch(frame.payload);
		}
	}

	/**
	 * Handles fragmented frames
	 * @param frame The frame
	 */
	private handleFragment(frame: Frame): void {
		// Check if we already have the fragment id
		if (this.fragmentsQueue.has(frame.fragmentId)) {
			const value = this.fragmentsQueue.get(frame.fragmentId)!;
			value.set(frame.fragmentIndex, frame);

			// Check if we have all the fragments
			// Then we can rebuild the packet
			if (value.size === frame.fragmentSize) {
				const stream = new BinaryStream();
				// Loop through the fragments and write them to the stream
				for (let index = 0; index < value.size; index++) {
					const splitPacket = value.get(index)!;
					stream.writeBuffer(splitPacket.payload);
				}

				// Construct the new frame
				// Assign the values from the original frame
				const newFrame = new Frame();
				newFrame.reliability = frame.reliability;
				newFrame.reliableIndex = frame.reliableIndex;
				newFrame.sequenceIndex = frame.sequenceIndex;
				newFrame.orderIndex = frame.orderIndex;
				newFrame.orderChannel = frame.orderChannel;
				newFrame.payload = stream.getBuffer();
				// Delete the fragment id from the queue
				this.fragmentsQueue.delete(frame.fragmentId);
				// Send the new frame to the handleFrame function
				return this.handleFrame(newFrame);
			}
		} else {
			// Add the fragment id to the queue
			this.fragmentsQueue.set(
				frame.fragmentId,
				new Map([[frame.fragmentIndex, frame]])
			);
		}
	}

	/**
	 * Sends a frame to the connection.
	 *
	 * @param frame - The frame to send
	 * @param priority - The priority of the frame
	 */
	public sendFrame(frame: Frame, priority: Priority): void {
		// Check if the packet is sequenced or ordered
		if (frame.isSequenced()) {
			// Set the order index and the sequence index
			frame.orderIndex = this.outputOrderIndex[frame.orderChannel]!;
			frame.sequenceIndex = this.outputSequenceIndex[frame.orderChannel]++;
		} else if (frame.isOrderExclusive()) {
			// Set the order index and the sequence index
			frame.orderIndex = this.outputOrderIndex[frame.orderChannel]++;
			this.outputSequenceIndex[frame.orderChannel] = 0;
		}

		// Set the reliable index
		frame.reliableIndex = this.outputReliableIndex++;

		// Split packet if bigger than MTU size
		const maxSize = this.mtu - 6 - 23;
		if (frame.payload.byteLength > maxSize) {
			const buffer = Buffer.from(frame.payload);
			const fragmentId = this.outputFragmentIndex++ % 65_536;
			for (let index = 0; index < buffer.byteLength; index += maxSize) {
				if (index !== 0) frame.reliableIndex = this.outputReliableIndex++;

				frame.payload = buffer.subarray(index, index + maxSize);
				frame.fragmentIndex = index / maxSize;
				frame.fragmentId = fragmentId;
				frame.fragmentSize = Math.ceil(buffer.byteLength / maxSize);
				this.addFrameToQueue(frame, priority | Priority.Normal);
			}
		} else {
			return this.addFrameToQueue(frame, priority);
		}
	}

	/**
	 * Adds a frame to the output queue
	 * @param frame The frame
	 * @param priority The priority
	 */
	private addFrameToQueue(frame: Frame, priority: Priority): void {
		let length = 4;
		// Add the length of the frame to the length
		for (const queuedFrame of this.outputFrameQueue.frames) {
			length += queuedFrame.getByteLength();
		}

		// Check if the frame is bigger than the MTU, if so, send the queue
		if (length + frame.getByteLength() > this.mtu - 36) {
			this.sendFrameQueue();
		}

		// Add the frame to the queue
		this.outputFrameQueue.frames.push(frame);

		// If the priority is immediate, send the queue
		if (priority === Priority.Immediate) return this.sendFrameQueue();
	}

	/**
	 * Sends the output frame queue
	 */
	public sendFrameQueue(): void {
		// Check if the queue is empty
		if (this.outputFrameQueue.frames.length > 0) {
			// Set the sequence of the frame set
			this.outputFrameQueue.sequence = this.outputSequence++;
			// Send the frame set
			this.sendFrameSet(this.outputFrameQueue);
			// Set the queue to a new frame set
			this.outputFrameQueue = new FrameSet();
			this.outputFrameQueue.frames = [];
		}
	}

	/**
	 * Sends a frame set to the connection
	 * @param frameset The frame set
	 */
	private sendFrameSet(frameset: FrameSet): void {
		// Send the frame set
		this.send(frameset.serialize());
		// Add the frame set to the backup queue
		this.outputBackupQueue.set(
			frameset.sequence,
			frameset.frames.filter((frame) => frame.isReliable())
		);
	}

	/**
	 * Handles an incoming connection request
	 * @param buffer The packet buffer
	 */
	private handleIncomingConnectionRequest(buffer: Buffer): void {
		// Create a new ConnectionRequest instance and deserialize the buffer
		const request = new ConnectionRequest(buffer).deserialize();

		// Check if the server is full
		// if (this.server.connections.size >= this.server.maxConnections) {
		// 	return this.disconnect();
		// }

		// Create a new ConnectionRequestAccepted instance
		const accepted = new ConnectionRequestAccepted();

		// Set the properties of the accepted packet
		accepted.address = Address.fromIdentifier(this.identifier);
		accepted.systemIndex = 0;
		accepted.systemAddress = [];
		accepted.requestTimestamp = request.timestamp;
		accepted.timestamp = BigInt(Date.now());

		// Set the accepted packet to a new frame
		const frame = new Frame();
		frame.reliability = Reliability.Unreliable;
		frame.orderChannel = 0;
		frame.payload = accepted.serialize();

		// Send the frame
		return this.sendFrame(frame, Priority.Normal);
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

		const frame = new Frame();
		frame.reliability = Reliability.Unreliable;
		frame.orderChannel = 0;
		frame.payload = pong.serialize();

		this.sendFrame(frame, Priority.Normal);
	}
}

export { Connection };
