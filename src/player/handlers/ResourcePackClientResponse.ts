import type { ResourcePackClientResponse } from '@serenityjs/protocol';
import { Packets, ResourcePackStack, ResourceStatus, StartGame } from '@serenityjs/protocol';
import type { NetworkSession } from '../NetworkSession';
import { Handler } from './Handler';
import { Handlers } from './index';

class ResourcePackClientResponseHandler extends Handler {
	public static override handle(packet: ResourcePackClientResponse, session: NetworkSession): void {
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
				return session.send(stack.serialize());
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
				Handlers.get(Packets.StartGame)!.handle(new StartGame(), session);
			}
		}
	}
}

export { ResourcePackClientResponseHandler };
