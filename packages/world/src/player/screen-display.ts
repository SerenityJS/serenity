import {
	HudElement,
	HudElementData,
	HudVisibility,
	SetHudPacket
} from "@serenityjs/protocol";

import type { Player } from "./player";

class ScreenDisplay {
	/**
	 * The player the screen display is binded to.
	 */
	protected readonly player: Player;

	/**
	 * The elements that are hidden from the screen display.
	 */
	public readonly hiddenElements = new Set<HudElement>();

	/**
	 * Creates a new screen display.
	 * @param player The player the screen display is binded to.
	 * @returns A new screen display.
	 */
	public constructor(player: Player) {
		this.player = player;
	}

	/**
	 * Hide a specific element from the screen display.
	 * @param element The element to hide.
	 */
	public hideElement(...elements: Array<HudElement>): void {
		// Add the element to the hidden elements.
		for (const element of elements) this.hiddenElements.add(element);

		// Create a new SetHudPacket.
		const packet = new SetHudPacket();

		// Map the hidden elements to the packet.
		packet.elements = [...this.hiddenElements].map(
			(element) => new HudElementData(element)
		);

		// Set the visibility to hidden.
		packet.visibility = HudVisibility.Hide;

		// Send the packet to the player.
		this.player.session.send(packet);
	}

	/**
	 * Show a specific element from the screen display.
	 * @param element The element to show.
	 */
	public showElement(...elements: Array<HudElement>): void {
		// Remove the element from the hidden elements.
		for (const element of elements) this.hiddenElements.delete(element);

		// Create a new SetHudPacket.
		const packet = new SetHudPacket();

		// Map the hidden elements to the packet.
		packet.elements = [...this.hiddenElements].map(
			(element) => new HudElementData(element)
		);

		// Set the visibility to shown.
		packet.visibility = HudVisibility.Reset;

		// Send the packet to the player.
		this.player.session.send(packet);
	}

	/**
	 * Hide all elements from the screen display.
	 */
	public hideAllElements(): void {
		// Add all elements to the hidden elements.
		const values = Object.values(HudElement).filter(
			(element) => typeof element === "number"
		);

		// Add the elements to the hidden elements.
		this.hideElement(...values);
	}

	/**
	 * Show all elements from the screen display.
	 */
	public showAllElements(): void {
		// Remove all elements from the hidden elements.
		const values = Object.values(HudElement).filter(
			(element) => typeof element === "number"
		);

		// Remove the elements from the hidden elements.
		this.showElement(...values);
	}
}

export { ScreenDisplay };
