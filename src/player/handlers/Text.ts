import type { Text } from '@serenityjs/protocol';
import type { Player } from '../Player';
import { PlayerHandler } from './PlayerHandler';

class TextHandler extends PlayerHandler {
	public static override handle(packet: Text, player: Player): void {
		const players = [...player.world.players.values()];
		for (const p of players) {
			p.sendMessage(`§7${player.username} §8§l>§r ${packet.message.replace('§', '')}`);
		}
	}
}

export { TextHandler };
