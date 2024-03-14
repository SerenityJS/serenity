import { NetworkPacketEvent } from "./packet-event";

import type {
	AddEntity,
	AddPlayer,
	Animate,
	AvailableCommands,
	BiomeDefinitionList,
	BlockPickRequest,
	ChangeDimension,
	ChunkRadiusUpdate,
	CommandOutput,
	CommandRequest,
	ContainerClose,
	ContainerOpen,
	CreativeContent,
	Disconnect,
	Interact,
	InventoryContent,
	InventorySlot,
	InventoryTransaction,
	ItemStackRequest,
	ItemStackResponse,
	LevelChunk,
	LevelEvent,
	Login,
	MobEquipment,
	ModalFormRequest,
	ModalFormResponse,
	MoveEntity,
	MovePlayer,
	NetworkChunkPublisherUpdate,
	NetworkSettings,
	Packet,
	PacketViolationWarning,
	PlayStatus,
	PlayerAction,
	PlayerAuthInput,
	PlayerHotbar,
	PlayerList,
	RemoveEntity,
	RequestChunkRadius,
	RequestNetworkSettings,
	ResourcePackClientResponse,
	ResourcePackStack,
	ResourcePacksInfo,
	Respawn,
	ScriptMessage,
	SetCommandsEnabled,
	SetEntityData,
	SetLocalPlayerAsInitialized,
	SetPlayerGameType,
	SetTitle,
	StartGame,
	Text,
	ToastRequest,
	UpdateAbilities,
	UpdateAdventureSettings,
	UpdateAttributes,
	UpdateBlock
} from "@serenityjs/protocol";

/**
 * All available network events.
 */
interface NetworkEvents {
	[Packet.Login]: [NetworkPacketEvent<Login>];
	[Packet.PlayStatus]: [NetworkPacketEvent<PlayStatus>];
	[Packet.Disconnect]: [NetworkPacketEvent<Disconnect>];
	[Packet.ResourcePacksInfo]: [NetworkPacketEvent<ResourcePacksInfo>];
	[Packet.ResourcePackStack]: [NetworkPacketEvent<ResourcePackStack>];
	[Packet.ResourcePackClientResponse]: [
		NetworkPacketEvent<ResourcePackClientResponse>
	];
	[Packet.Text]: [NetworkPacketEvent<Text>];
	[Packet.StartGame]: [NetworkPacketEvent<StartGame>];
	[Packet.AddPlayer]: [NetworkPacketEvent<AddPlayer>];
	[Packet.AddEntity]: [NetworkPacketEvent<AddEntity>];
	[Packet.RemoveEntity]: [NetworkPacketEvent<RemoveEntity>];
	[Packet.MoveEntity]: [NetworkPacketEvent<MoveEntity>];
	[Packet.MovePlayer]: [NetworkPacketEvent<MovePlayer>];
	[Packet.UpdateBlock]: [NetworkPacketEvent<UpdateBlock>];
	[Packet.LevelEvent]: [NetworkPacketEvent<LevelEvent>];
	[Packet.UpdateAttributes]: [NetworkPacketEvent<UpdateAttributes>];
	[Packet.InventoryTransaction]: [NetworkPacketEvent<InventoryTransaction>];
	[Packet.MobEquipment]: [NetworkPacketEvent<MobEquipment>];
	[Packet.Interact]: [NetworkPacketEvent<Interact>];
	[Packet.BlockPickRequest]: [NetworkPacketEvent<BlockPickRequest>];
	[Packet.PlayerAction]: [NetworkPacketEvent<PlayerAction>];
	[Packet.SetEntityData]: [NetworkPacketEvent<SetEntityData>];
	[Packet.Animate]: [NetworkPacketEvent<Animate>];
	[Packet.Respawn]: [NetworkPacketEvent<Respawn>];
	[Packet.ContainerOpen]: [NetworkPacketEvent<ContainerOpen>];
	[Packet.ContainerClose]: [NetworkPacketEvent<ContainerClose>];
	[Packet.PlayerHotbar]: [NetworkPacketEvent<PlayerHotbar>];
	[Packet.InventoryContent]: [NetworkPacketEvent<InventoryContent>];
	[Packet.InventorySlot]: [NetworkPacketEvent<InventorySlot>];
	[Packet.LevelChunk]: [NetworkPacketEvent<LevelChunk>];
	[Packet.SetCommandsEnabled]: [NetworkPacketEvent<SetCommandsEnabled>];
	[Packet.ChangeDimension]: [NetworkPacketEvent<ChangeDimension>];
	[Packet.SetPlayerGameType]: [NetworkPacketEvent<SetPlayerGameType>];
	[Packet.PlayerList]: [NetworkPacketEvent<PlayerList>];
	[Packet.RequestChunkRadius]: [NetworkPacketEvent<RequestChunkRadius>];
	[Packet.ChunkRadiusUpdate]: [NetworkPacketEvent<ChunkRadiusUpdate>];
	[Packet.AvailableCommands]: [NetworkPacketEvent<AvailableCommands>];
	[Packet.CommandRequest]: [NetworkPacketEvent<CommandRequest>];
	[Packet.CommandOutput]: [NetworkPacketEvent<CommandOutput>];
	[Packet.SetTitle]: [NetworkPacketEvent<SetTitle>];
	[Packet.ModalFormRequest]: [NetworkPacketEvent<ModalFormRequest>];
	[Packet.ModalFormResponse]: [NetworkPacketEvent<ModalFormResponse>];
	[Packet.SetLocalPlayerAsInitialized]: [
		NetworkPacketEvent<SetLocalPlayerAsInitialized>
	];
	[Packet.NetworkChunkPublisherUpdate]: [
		NetworkPacketEvent<NetworkChunkPublisherUpdate>
	];
	[Packet.BiomeDefinitionList]: [NetworkPacketEvent<BiomeDefinitionList>];
	[Packet.NetworkSettings]: [NetworkPacketEvent<NetworkSettings>];
	[Packet.PlayerAuthInput]: [NetworkPacketEvent<PlayerAuthInput>];
	[Packet.CreativeContent]: [NetworkPacketEvent<CreativeContent>];
	[Packet.ItemStackRequest]: [NetworkPacketEvent<ItemStackRequest>];
	[Packet.ItemStackResponse]: [NetworkPacketEvent<ItemStackResponse>];
	[Packet.PacketViolationWarning]: [NetworkPacketEvent<PacketViolationWarning>];
	[Packet.ScriptMessage]: [NetworkPacketEvent<ScriptMessage>];
	[Packet.ToastRequest]: [NetworkPacketEvent<ToastRequest>];
	[Packet.UpdateAbilities]: [NetworkPacketEvent<UpdateAbilities>];
	[Packet.UpdateAdventureSettings]: [
		NetworkPacketEvent<UpdateAdventureSettings>
	];
	[Packet.RequestNetworkSettings]: [NetworkPacketEvent<RequestNetworkSettings>];
}

export { NetworkEvents };
