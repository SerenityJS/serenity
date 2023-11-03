import type { ResourcePackClientResponse } from '@serenityjs/protocol';
import { ResourcePackStack, ResourceStatus, StartGame } from '@serenityjs/protocol';
import type { Player } from '../Player';
import { PlayerHandler } from './PlayerHandler';

class ResourcePackClientResponseHandler extends PlayerHandler {
	public static override handle(packet: ResourcePackClientResponse, player: Player): void {
		switch (packet.status) {
			case ResourceStatus.HaveAllPacks: {
				// Send a ResourcePackStack packet to the player
				const stack = new ResourcePackStack();
				stack.mustAccept = false;
				stack.gameVersion = this.serenity.minecraftVersion;
				stack.experiments = [];
				stack.experimentsPreviouslyToggled = false;
				stack.resourcePacks = [];
				stack.behaviorPacks = [];
				// Send the stack to the player
				return player.sendPacket(stack);
			}

			case ResourceStatus.None: {
				return this.logger.error('Not implemented yet: ResourceStatus.None case');
			}

			case ResourceStatus.Refused: {
				return this.logger.error('Not implemented yet: ResourceStatus.Refused case');
			}

			case ResourceStatus.SendPacks: {
				return this.logger.error('Not implemented yet: ResourceStatus.SendPacks case');
			}

			case ResourceStatus.Completed: {
				// This is were we continue the login process
				// Send the start game packet to the player
				const handler = player.getHandler('StartGame');
				if (!handler) {
					return this.logger.error('Failed to get StartGame handler!');
				}

				return handler.handle(new StartGame(), player);
			}
		}
	}
}

export { ResourcePackClientResponseHandler };
