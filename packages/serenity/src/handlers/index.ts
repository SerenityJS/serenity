import { Animate } from "./animate";
import { CommandRequest } from "./command-request";
import { ContainerClose } from "./container-close";
import { Disconnect } from "./disconnect";
import { Interact } from "./interact";
import { InventoryTransaction } from "./inventory-transaction";
import { ItemStackRequest } from "./item-stack-request";
import { Login } from "./login";
import { MobEquipment } from "./mob-equipment";
import { MovePlayer } from "./move-player";
import { PlayerAction } from "./player-action";
import { RequestNetworkSettings } from "./request-network-settings";
import { ResourcePackChunkRequest } from "./resource-pack-chunk-request";
import { ResourcePackClientResponse } from "./resource-pack-client-response";
import { SetLocalPlayerAsIntialized } from "./set-local-player-as-initialized";
import { Text } from "./text";
import { BlockPick } from "./block-pick-request";
import { NetworkStackLatency } from "./network-stack-latency";
import { Respawn } from "./respawn";
import { NpcRequest } from "./npc-request";
import { BlockActorData } from "./block-actor-data";
import { BookEdit } from "./book-edit";

const HANDLERS = [
	RequestNetworkSettings,
	Login,
	Disconnect,
	ResourcePackClientResponse,
	ResourcePackChunkRequest,
	MovePlayer,
	Interact,
	ContainerClose,
	ItemStackRequest,
	SetLocalPlayerAsIntialized,
	MobEquipment,
	PlayerAction,
	Animate,
	CommandRequest,
	Text,
	InventoryTransaction,
	BlockPick,
	NetworkStackLatency,
	Respawn,
	NpcRequest,
	BlockActorData,
	BookEdit
];

export { HANDLERS };

export * from "./serenity-handler";
export * from "./request-network-settings";
export * from "./login";
export * from "./disconnect";
export * from "./resource-pack-chunk-request";
export * from "./resource-pack-client-response";
export * from "./move-player";
export * from "./interact";
export * from "./container-close";
export * from "./item-stack-request";
export * from "./set-local-player-as-initialized";
export * from "./mob-equipment";
export * from "./player-action";
export * from "./animate";
export * from "./command-request";
export * from "./text";
export * from "./inventory-transaction";
export * from "./block-pick-request";
export * from "./network-stack-latency";
export * from "./respawn";
export * from "./npc-request";
export * from "./block-actor-data";
export * from "./book-edit";
