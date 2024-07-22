import { BookEditAction, BookEditPacket } from "@serenityjs/protocol";
import { BookPage } from "@serenityjs/world";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class BookEdit extends SerenityHandler {
	public static packet = BookEditPacket.id;

	public static handle(packet: BookEditPacket, session: NetworkSession): void {
		// Get the player from the session
		// And check if the player is not undefined
		const player = this.serenity.getPlayer(session);
		const playerInventory = player?.getComponent("minecraft:inventory");
		const heldItem = playerInventory?.getHeldItem();

		if (!heldItem || !player) return;
		const writtableBook = heldItem.getComponent("minecraft:writtable_book");

		switch (packet.action) {
			case BookEditAction.ReplacePage: {
				writtableBook.setPageText(
					packet.actions.pageIndex,
					packet.actions.textA.slice(0, 256)
				);
				break;
			}
			case BookEditAction.AddPage: {
				if (!writtableBook.getPage(packet.actions.pageIndex)) return;
				writtableBook.insertPage(
					packet.actions.pageIndex,
					new BookPage(packet.actions.textA.slice(0, 256))
				);
				break;
			}
			case BookEditAction.DeletePage: {
				writtableBook.deletePage(packet.actions.pageIndex);
				break;
			}
			case BookEditAction.SwapPage: {
				writtableBook.swapPages(
					packet.actions.pageIndex,
					packet.actions.pageIndexB
				);
				break;
			}
			case BookEditAction.Finalize: {
				const { textA: title, textB: author, xuid } = packet.actions;
				const writtenBook = writtableBook.signBook(title, author, xuid);

				playerInventory?.container.setItem(
					playerInventory.selectedSlot,
					writtenBook
				);
				return;
			}
		}
		writtableBook.write();
	}
}

export { BookEdit };
