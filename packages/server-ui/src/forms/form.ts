import {
	ClientboundCloseFormPacket,
	ModalFormCanceledReason,
	ModalFormRequestPacket,
	Packet
} from "@serenityjs/protocol";

import type { ModalFormType } from "@serenityjs/protocol";
import type { Player } from "@serenityjs/world";

interface PromiseResponse<T> {
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason: unknown) => void;
}

/**
 * Represents a server sided ui form that can be shown to a player.
 */
class Form<T> {
	/**
	 * A collective map of all pending promises for forms.
	 */
	public static readonly pending = new Map<number, PromiseResponse<never>>();

	/**
	 * The running count for network identifiers for forms.
	 */
	public static network = 1;

	/**
	 * The type of form.
	 */
	public readonly type!: ModalFormType;

	/**
	 * The network identifier of the form.
	 */
	public readonly network = Form.network++;

	/**
	 * Show the form to the player
	 * @throws {Error} If the form was canceled
	 * @param player The player to show the form to
	 * @returns A promise that resolves with the data from the form
	 */
	public show(player: Player): Promise<T> {
		// Listen for the ModalFormResponse packet
		player.session.once(Packet.ModalFormResponse, (data) => {
			// Separate the data into variables
			const { packet } = data;

			// Separate the data into variables
			const { resolve, reject } = Form.pending.get(
				packet.id
			) as PromiseResponse<T>;

			// Check if the form was cancelled
			if (packet.canceled) {
				reject(
					new Error(
						`Form was canceled by the player. Reason: ${ModalFormCanceledReason[packet.reason as ModalFormCanceledReason]}`
					)
				);
			} else {
				const data = JSON.parse(packet.data as string);
				resolve(data);
			}

			// Remove the promise from the pending map
			Form.pending.delete(packet.id);
		});

		// Return a new promise
		return new Promise((resolve, reject) => {
			// Get the payload of the form
			const payload = JSON.stringify(this);

			// Create a new ModalFormRequestPacket
			const packet = new ModalFormRequestPacket();

			// Assign the properties of the packet
			packet.id = this.network;
			packet.payload = payload;

			// Send the packet to the player
			player.session.send(packet);

			// Add the promise to the pending map
			Form.pending.set(this.network, { resolve, reject });
		});
	}

	/**
	 * Close the form for the player
	 * @param player The player to close the form for
	 */
	public close(player: Player): void {
		// Create a new ClientboundCloseFormPacket
		const packet = new ClientboundCloseFormPacket();

		// Send the packet to the player
		player.session.send(packet);
	}
}

export { Form };
