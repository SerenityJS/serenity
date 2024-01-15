import { ContainerCloseHandler } from './ContainerCloseHandler';
import { InteractHandler } from './Interact';
import { LoginHandler } from './Login';
import { MovePlayerHandler } from './MovePlayer';
import { PacketViolationWarningHandler } from './PacketViolationWarning';
import { PlayerActionHandler } from './PlayerActionHandler';
import { RequestNetworkSettingsHandler } from './RequestNetworkSettings';
import { ResourcePackClientResponseHandler } from './ResoucePackClientResponse';
import { TextHandler } from './Text';

export * from './NetworkHandler';

const NETWORK_HANDLERS = [
	RequestNetworkSettingsHandler,
	LoginHandler,
	ResourcePackClientResponseHandler,
	MovePlayerHandler,
	PacketViolationWarningHandler,
	TextHandler,
	InteractHandler,
	ContainerCloseHandler,
	PlayerActionHandler,
];

export { NETWORK_HANDLERS };
