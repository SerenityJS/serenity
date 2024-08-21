import { BinaryStream } from "@serenityjs/binarystream";

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
import { DGRAM_HEADER_SIZE, DGRAM_MTU_OVERHEAD } from "../constants";

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
	protected readonly outputOrderIndex: Array<number>;
	protected readonly outputSequenceIndex: Array<number>;

	protected outputFrames = new Set<Frame>();
	protected outputBackup = new Map<number, Array<Frame>>();

	protected outputSequence = 0;

	protected outputsplitIndex = 0;

	protected outputReliableIndex = 0;

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

		// Inputs
		this.inputOrderIndex = Array.from<number>({ length: 32 }).fill(0);
		for (let index = 0; index < 32; index++) {
			this.inputOrderingQueue.set(index, new Map());
		}

		this.inputHighestSequenceIndex = Array.from<number>({ length: 32 }).fill(0);

		// Outputs
		this.outputOrderIndex = Array.from<number>({ length: 32 }).fill(0);
		this.outputSequenceIndex = Array.from<number>({ length: 32 }).fill(0);
	}

	/**
	 * Ticks the connection
	 */
	public tick(): void {
		// Check if the client is stale
		if (this.lastUpdate + 5000 < Date.now()) {
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

		// Check if we have received any ACKs or NACKs
		// Check if we have received any packets to send an ACK for
		if (this.receivedFrameSequences.size > 0) {
			// Create a new ACK instance
			const ack = new Ack();
			ack.sequences = [...this.receivedFrameSequences];

			// Delete the sequences from the received frame sequences
			for (const sequence of this.receivedFrameSequences)
				this.receivedFrameSequences.delete(sequence);

			// Send the ACK to the remote client
			this.server.send(ack.serialize(), this.rinfo);
		}

		// Check if we have any lost packets to send a NACK for
		if (this.lostFrameSequences.size > 0) {
			const nack = new Nack();
			nack.sequences = [...this.lostFrameSequences];

			// Delete the sequences from the lost frame sequences
			for (const sequence of this.lostFrameSequences)
				this.lostFrameSequences.delete(sequence);

			// Send the NACK to the remote client
			this.server.send(nack.serialize(), this.rinfo);
		}

		// Send the output queue
		return this.sendQueue(this.outputFrames.size);
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
		frame.reliability = Reliability.ReliableOrdered;
		frame.orderChannel = 0;
		frame.payload = disconnect.serialize();

		// Send the frame
		this.sendFrame(frame, Priority.Immediate);

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
				this.handleIncomingFrameSet(buffer);
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
			// Check if the ack is not found
			if (!this.outputBackup.has(sequence))
				this.server.logger.debug(
					`Received ack for unknown sequence ${sequence} from ${this.rinfo.address}:${this.rinfo.port}.`
				);

			// Remove the ack from the set
			this.outputBackup.delete(sequence);
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
			// Get the frames from the output backup
			const frames = this.outputBackup.get(sequence) ?? [];

			// Iterate over the frames
			for (const frame of frames) {
				// Send the frame to the connection
				this.sendFrame(frame, Priority.Immediate);
			}
		}
	}

	/**
	 * Handles incoming framesets
	 * @param buffer The packet buffer
	 */
	protected handleIncomingFrameSet(buffer: Buffer): void {
		// Create a new FrameSet instance and deserialize the buffer
		const frameset = new FrameSet(buffer).deserialize();

		// Checks if the sequence of the frameset has already been recieved
		if (this.receivedFrameSequences.has(frameset.sequence)) {
			// Log a debug message for duplicate framesets
			this.server.logger.debug(
				`Received duplicate frameset ${frameset.sequence} from ${this.rinfo.address}:${this.rinfo.port}!`
			);

			return void this.server.emit(
				"error",
				new Error(
					`Recieved duplicate frameset ${frameset.sequence} from ${this.rinfo.address}:${this.rinfo.port}!`
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
				`Received out of order frameset ${frameset.sequence} from ${this.rinfo.address}:${this.rinfo.port}!`
			);

			return void this.server.emit(
				"error",
				new Error(
					`Recieved out of order frameset ${frameset.sequence} from ${this.rinfo.address}:${this.rinfo.port}!`
				)
			);
		}

		// Adds the sequence to the recieved frame sequences, Ack will be sent on next tick
		this.receivedFrameSequences.add(frameset.sequence);

		// Checks if there are any missings framesets,
		// in the range of the last input sequence and the current sequence
		// add the missing frame sequences to the lost queue
		if (frameset.sequence - this.lastInputSequence > 1) {
			for (
				let index = this.lastInputSequence + 1;
				index < frameset.sequence;
				index++
			)
				this.lostFrameSequences.add(index);
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
	protected handleFrame(frame: Frame): void {
		// Checks if the packet is fragmented
		if (frame.isSplit()) return this.handleFragment(frame);

		// Checks if the packet is sequenced
		if (frame.isSequenced()) {
			if (
				frame.sequenceIndex <
					(this.inputHighestSequenceIndex[frame.orderChannel] as number) ||
				frame.orderIndex < (this.inputOrderIndex[frame.orderChannel] as number)
			) {
				// Log a debug message for out of order frames
				this.server.logger.debug(
					`Recieved out of order frame ${frame.sequenceIndex} from ${this.rinfo.address}:${this.rinfo.port}!`
				);

				return void this.server.emit(
					"error",
					new Error(
						`Recieved out of order frame ${frame.sequenceIndex} from ${this.rinfo.address}:${this.rinfo.port}!`
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
				let index = this.inputOrderIndex[frame.orderChannel] as number;
				const outOfOrderQueue = this.inputOrderingQueue.get(
					frame.orderChannel
				) as Map<number, Frame>;
				for (; outOfOrderQueue.has(index); index++) {
					// Get the frame from the queue
					const frame = outOfOrderQueue.get(index);

					// Check if the frame is null
					if (!frame) break;

					// Handle the packet and delete it from the queue
					this.incomingBatch(frame.payload);
					outOfOrderQueue.delete(index);
				}

				// Update the queue
				this.inputOrderingQueue.set(frame.orderChannel, outOfOrderQueue);
				this.inputOrderIndex[frame.orderChannel] = index;
			} else if (
				frame.orderIndex > (this.inputOrderIndex[frame.orderChannel] as number)
			) {
				// Get the unordered queue
				const unordered = this.inputOrderingQueue.get(frame.orderChannel);

				// Check if the queue is null
				if (!unordered) return;

				// Add the frame to the queue
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
	protected handleFragment(frame: Frame): void {
		// Check if we already have the fragment id
		if (this.fragmentsQueue.has(frame.splitId)) {
			const fragment = this.fragmentsQueue.get(frame.splitId);

			// Check if the fragment is null
			if (!fragment) return;

			// Set the split frame to the fragment
			fragment.set(frame.splitIndex, frame);

			// Check if we have all the fragments
			// Then we can rebuild the packet
			if (fragment.size === frame.splitSize) {
				const stream = new BinaryStream();
				// Loop through the fragments and write them to the stream
				for (let index = 0; index < fragment.size; index++) {
					// Get the split frame from the fragment
					const sframe = fragment.get(index) as Frame;

					// Write the payload to the stream
					stream.writeBuffer(sframe.payload);
				}

				// Construct the new frame
				// Assign the values from the original frame
				const nframe = new Frame();
				nframe.reliability = frame.reliability;
				nframe.reliableIndex = frame.reliableIndex;
				nframe.sequenceIndex = frame.sequenceIndex;
				nframe.orderIndex = frame.orderIndex;
				nframe.orderChannel = frame.orderChannel;
				nframe.payload = stream.getBuffer();

				// Delete the fragment id from the queue
				this.fragmentsQueue.delete(frame.splitId);

				// Send the new frame to the handleFrame function
				return this.handleFrame(nframe);
			}
		} else {
			// Add the fragment id to the queue
			this.fragmentsQueue.set(
				frame.splitId,
				new Map([[frame.splitIndex, frame]])
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
			frame.orderIndex = this.outputOrderIndex[frame.orderChannel] as number;
			frame.sequenceIndex = (this.outputSequenceIndex[
				frame.orderChannel
			] as number)++;
		} else if (frame.isOrderExclusive()) {
			// Set the order index and the sequence index
			frame.orderIndex = (this.outputOrderIndex[
				frame.orderChannel
			] as number)++;
			this.outputSequenceIndex[frame.orderChannel] = 0;
		}

		// Split packet if bigger than MTU size
		const maxSize = this.mtu - 36;
		const splitSize = Math.ceil(frame.payload.byteLength / maxSize);

		// Increment the reliable index
		frame.reliableIndex = this.outputReliableIndex++;

		// Check if the frame is bigger than the MTU
		if (frame.payload.byteLength > maxSize) {
			// Create a new buffer from the payload and generate a fragment id
			// const buffer = Buffer.from(frame.payload);
			const splitId = this.outputsplitIndex++ % 65_536;

			// Loop through the buffer and split it into fragments based on the MTU size
			for (let index = 0; index < frame.payload.byteLength; index += maxSize) {
				const nframe = new Frame();

				// Set the reliability and the reliable index
				nframe.reliableIndex = frame.reliableIndex;
				if (index !== 0) nframe.reliableIndex = this.outputReliableIndex++;

				// Create a new frame and assign the values
				nframe.sequenceIndex = frame.sequenceIndex;
				nframe.orderIndex = frame.orderIndex;
				nframe.orderChannel = frame.orderChannel;
				nframe.reliability = frame.reliability;
				nframe.payload = frame.payload.subarray(index, index + maxSize);
				nframe.splitIndex = index / maxSize;
				nframe.splitId = splitId;
				nframe.splitSize = splitSize;

				// Add the frame to the queue
				this.queueFrame(nframe, priority);
			}
		} else {
			return this.queueFrame(frame, priority);
		}
	}

	/**
	 * Adds a frame to the output queue
	 * @param frame The frame
	 * @param priority The priority
	 */
	private queueFrame(frame: Frame, priority: Priority): void {
		let length = DGRAM_HEADER_SIZE;

		// Add the length of the frame to the length
		for (const frame of this.outputFrames) length += frame.getByteLength();

		// Check if the frame is bigger than the MTU, if so, send the queue
		if (length + frame.getByteLength() > this.mtu - DGRAM_MTU_OVERHEAD)
			// Send the queue as upcoming frames will be too big
			this.sendQueue(this.outputFrames.size);

		// Add the frame to the queue
		this.outputFrames.add(frame);

		// If the priority is immediate, send the queue
		if (priority === Priority.Immediate) return this.sendQueue(1);
	}

	/**
	 * Sends the output frame queue
	 */
	public sendQueue(amount: number): void {
		// Check if the queue is empty
		if (this.outputFrames.size === 0) return;

		// Create a new frame set
		const frameset = new FrameSet();

		// Assign the frame set properties
		frameset.sequence = this.outputSequence++;
		frameset.frames = [...this.outputFrames].slice(0, amount);

		// Add the frame set to the backup map
		this.outputBackup.set(frameset.sequence, frameset.frames);

		// Remove the frames from the queue
		for (const frame of frameset.frames) this.outputFrames.delete(frame);

		// Send the frame set to the remote client
		return this.server.send(frameset.serialize(), this.rinfo);
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

		// Set the accepted packet to a new frame
		const frame = new Frame();
		frame.reliability = Reliability.ReliableOrdered;
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
		frame.reliability = Reliability.ReliableOrdered;
		frame.orderChannel = 0;
		frame.payload = pong.serialize();

		this.sendFrame(frame, Priority.Normal);
	}
}

export { Connection };
