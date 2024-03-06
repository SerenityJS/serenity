import type { Packet } from '@serenityjs/bedrock-protocol';
import { CommandRequest as CommandRequestPacket, DisconnectReason } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session.js';
import { NetworkHandler } from './NetworkHandler.js';

class CommandRequest extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = CommandRequestPacket.ID;

	public static override handle(packet: CommandRequestPacket, session: NetworkSession): void {
    const player = session.player;

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);
    
    void this.serenity.commandManager.dispatchCommand(player, packet.rawCommand.slice(1));
  }
}

export { CommandRequest };
