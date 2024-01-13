import { LoginHandler } from './Login';
import { MovePlayerHandler } from './MovePlayer';
import { PacketViolationWarningHandler } from './PacketViolationWarning';
import { RequestNetworkSettingsHandler } from './RequestNetworkSettings';
import { ResourcePackClientResponseHandler } from './ResoucePackClientResponse';

export * from './NetworkHandler';

const NETWORK_HANDLERS = [
	RequestNetworkSettingsHandler,
	LoginHandler,
	ResourcePackClientResponseHandler,
	MovePlayerHandler,
	PacketViolationWarningHandler,
];

export { NETWORK_HANDLERS };
