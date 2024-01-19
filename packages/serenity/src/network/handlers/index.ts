import { BlockPickRequestHandler } from './BlockPickRequest';
import { ContainerCloseHandler } from './ContainerCloseHandler';
import { InteractHandler } from './Interact';
import { InventoryTransactionHandler } from './InventoryTransaction';
import { LoginHandler } from './Login';
import { MovePlayerHandler } from './MovePlayer';
import { PacketViolationWarningHandler } from './PacketViolationWarning';
import { PlayerActionHandler } from './PlayerAction';
import { RequestNetworkSettingsHandler } from './RequestNetworkSettings';
import { ResourcePackClientResponseHandler } from './ResoucePackClientResponse';
import { SetLocalPlayerAsInitializedHandler } from './SetLocalPlayerAsInitialized';
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
	BlockPickRequestHandler,
	SetLocalPlayerAsInitializedHandler,
	InventoryTransactionHandler,
];

export { NETWORK_HANDLERS };
