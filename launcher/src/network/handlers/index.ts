import { AnimateHandler } from "./animate";
import { BlockPickRequestHandler } from "./block-pick-request";
import { CommandRequest } from "./command-request";
import { ContainerCloseHandler } from "./container-close";
import { DisconnectHandler } from "./disconnect";
import { InteractHandler } from "./interact";
import { InventoryTransactionHandler } from "./inventory-transaction";
import { ItemStackRequestHandler } from "./item-stack-request";
import { LoginHandler } from "./login";
import { MobEquipmentHandler } from "./mob-equipment";
import { ModalFormResponseHandler } from "./modal-form-response";
import { MovePlayerHandler } from "./move-player";
import { PacketViolationWarningHandler } from "./packet-violation-warning";
import { PlayerActionHandler } from "./player-action";
import { PlayerAuthInputHandler } from "./player-auth-input";
import { RequestChunkRadiusHandler } from "./request-chunk-radius";
import { RequestNetworkSettingsHandler } from "./request-network-settings";
import { ResourcePackClientResponseHandler } from "./resouce-pack-client-response";
import { SetLocalPlayerAsInitializedHandler } from "./set-local-player-as-initialized";
import { TextHandler } from "./text";

export * from "./network-handler";

const NETWORK_HANDLERS = [
	RequestNetworkSettingsHandler,
	RequestChunkRadiusHandler,
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
	DisconnectHandler,
	RequestChunkRadiusHandler,
	ModalFormResponseHandler,
	ItemStackRequestHandler,
	MobEquipmentHandler,
	PlayerAuthInputHandler,
	AnimateHandler,
	CommandRequest
];

export { NETWORK_HANDLERS };
