import type { Interact } from '@serenityjs/protocol';
import { InteractActions, ContainerOpen, WindowId, WindowType } from '@serenityjs/protocol';
import type { Player } from '../Player';
import { PlayerHandler } from './PlayerHandler';

class InteractHandler extends PlayerHandler {
	public static override handle(packet: Interact, player: Player): void {
		if (packet.action === InteractActions.OpenInventory) {
			// crashing people
			const open = new ContainerOpen();
			open.windowId = WindowId.Inventory;
			open.windowType = WindowType.Inventory;
			open.position = { x: 0, y: 0, z: 0 };
			open.targetRuntimeId = player.runtimeId;
			player.sendPacket(open);
		}
	}
}

export { InteractHandler };
