import { NetworkPacketEvent } from "./packet-event";

import type {
	AddEntityPacket,
	AddPlayerPacket,
	AnimatePacket,
	AvailableCommandsPacket,
	BiomeDefinitionListPacket,
	BlockPickRequestPacket,
	ChangeDimensionPacket,
	ChunkRadiusUpdatePacket,
	CommandOutputPacket,
	CommandRequestPacket,
	ContainerClosePacket,
	ContainerOpenPacket,
	CreativeContentPacket,
	DisconnectPacket,
	InteractPacket,
	InventoryContentPacket,
	InventorySlotPacket,
	InventoryTransactionPacket,
	ItemComponentPacket,
	ItemStackRequestPacket,
	ItemStackResponsePacket,
	LevelChunkPacket,
	LevelEventPacket,
	LoginPacket,
	MobEquipmentPacket,
	ModalFormRequestPacket,
	ModalFormResponsePacket,
	MoveEntityPacket,
	MovePlayerPacket,
	NetworkChunkPublisherUpdatePacket,
	NetworkSettingsPacket,
	Packet,
	PacketViolationWarningPacket,
	PlayStatusPacket,
	PlayerActionPacket,
	PlayerAuthInputPacket,
	PlayerHotbarPacket,
	PlayerListPacket,
	RemoveEntityPacket,
	RequestChunkRadiusPacket,
	RequestNetworkSettingsPacket,
	ResourcePackClientResponsePacket,
	ResourcePackStackPacket,
	ResourcePacksInfoPacket,
	RespawnPacket,
	ScriptMessagePacket,
	SetCommandsEnabledPacket,
	SetEntityDataPacket,
	SetLocalPlayerAsInitializedPacket,
	SetPlayerGameTypePacket,
	SetTitlePacket,
	StartGamePacket,
	TextPacket,
	ToastRequestPacket,
	UpdateAbilitiesPacket,
	UpdateAdventureSettingsPacket,
	UpdateAttributesPacket,
	UpdateBlockPacket
} from "@serenityjs/protocol";

/**
 * All available network events.
 */
interface NetworkEvents {
	[Packet.Login]: [NetworkPacketEvent<LoginPacket>];
	[Packet.PlayStatus]: [NetworkPacketEvent<PlayStatusPacket>];
	[Packet.Disconnect]: [NetworkPacketEvent<DisconnectPacket>];
	[Packet.ResourcePacksInfo]: [NetworkPacketEvent<ResourcePacksInfoPacket>];
	[Packet.ResourcePackStack]: [NetworkPacketEvent<ResourcePackStackPacket>];
	[Packet.ResourcePackClientResponse]: [
		NetworkPacketEvent<ResourcePackClientResponsePacket>
	];
	[Packet.Text]: [NetworkPacketEvent<TextPacket>];
	[Packet.StartGame]: [NetworkPacketEvent<StartGamePacket>];
	[Packet.AddPlayer]: [NetworkPacketEvent<AddPlayerPacket>];
	[Packet.AddEntity]: [NetworkPacketEvent<AddEntityPacket>];
	[Packet.RemoveEntity]: [NetworkPacketEvent<RemoveEntityPacket>];
	[Packet.MoveEntity]: [NetworkPacketEvent<MoveEntityPacket>];
	[Packet.MovePlayer]: [NetworkPacketEvent<MovePlayerPacket>];
	[Packet.UpdateBlock]: [NetworkPacketEvent<UpdateBlockPacket>];
	[Packet.LevelEvent]: [NetworkPacketEvent<LevelEventPacket>];
	[Packet.UpdateAttributes]: [NetworkPacketEvent<UpdateAttributesPacket>];
	[Packet.InventoryTransaction]: [
		NetworkPacketEvent<InventoryTransactionPacket>
	];
	[Packet.MobEquipment]: [NetworkPacketEvent<MobEquipmentPacket>];
	[Packet.Interact]: [NetworkPacketEvent<InteractPacket>];
	[Packet.BlockPickRequest]: [NetworkPacketEvent<BlockPickRequestPacket>];
	[Packet.PlayerAction]: [NetworkPacketEvent<PlayerActionPacket>];
	[Packet.SetEntityData]: [NetworkPacketEvent<SetEntityDataPacket>];
	[Packet.Animate]: [NetworkPacketEvent<AnimatePacket>];
	[Packet.Respawn]: [NetworkPacketEvent<RespawnPacket>];
	[Packet.ContainerOpen]: [NetworkPacketEvent<ContainerOpenPacket>];
	[Packet.ContainerClose]: [NetworkPacketEvent<ContainerClosePacket>];
	[Packet.PlayerHotbar]: [NetworkPacketEvent<PlayerHotbarPacket>];
	[Packet.InventoryContent]: [NetworkPacketEvent<InventoryContentPacket>];
	[Packet.InventorySlot]: [NetworkPacketEvent<InventorySlotPacket>];
	[Packet.LevelChunk]: [NetworkPacketEvent<LevelChunkPacket>];
	[Packet.SetCommandsEnabled]: [NetworkPacketEvent<SetCommandsEnabledPacket>];
	[Packet.ChangeDimension]: [NetworkPacketEvent<ChangeDimensionPacket>];
	[Packet.SetPlayerGameType]: [NetworkPacketEvent<SetPlayerGameTypePacket>];
	[Packet.PlayerList]: [NetworkPacketEvent<PlayerListPacket>];
	[Packet.RequestChunkRadius]: [NetworkPacketEvent<RequestChunkRadiusPacket>];
	[Packet.ChunkRadiusUpdate]: [NetworkPacketEvent<ChunkRadiusUpdatePacket>];
	[Packet.AvailableCommands]: [NetworkPacketEvent<AvailableCommandsPacket>];
	[Packet.CommandRequest]: [NetworkPacketEvent<CommandRequestPacket>];
	[Packet.CommandOutput]: [NetworkPacketEvent<CommandOutputPacket>];
	[Packet.SetTitle]: [NetworkPacketEvent<SetTitlePacket>];
	[Packet.ModalFormRequest]: [NetworkPacketEvent<ModalFormRequestPacket>];
	[Packet.ModalFormResponse]: [NetworkPacketEvent<ModalFormResponsePacket>];
	[Packet.SetLocalPlayerAsInitialized]: [
		NetworkPacketEvent<SetLocalPlayerAsInitializedPacket>
	];
	[Packet.NetworkChunkPublisherUpdate]: [
		NetworkPacketEvent<NetworkChunkPublisherUpdatePacket>
	];
	[Packet.BiomeDefinitionList]: [NetworkPacketEvent<BiomeDefinitionListPacket>];
	[Packet.NetworkSettings]: [NetworkPacketEvent<NetworkSettingsPacket>];
	[Packet.PlayerAuthInput]: [NetworkPacketEvent<PlayerAuthInputPacket>];
	[Packet.CreativeContent]: [NetworkPacketEvent<CreativeContentPacket>];
	[Packet.ItemStackRequest]: [NetworkPacketEvent<ItemStackRequestPacket>];
	[Packet.ItemStackResponse]: [NetworkPacketEvent<ItemStackResponsePacket>];
	[Packet.PacketViolationWarning]: [
		NetworkPacketEvent<PacketViolationWarningPacket>
	];
	[Packet.ItemComponent]: [NetworkPacketEvent<ItemComponentPacket>];
	[Packet.ScriptMessage]: [NetworkPacketEvent<ScriptMessagePacket>];
	[Packet.ToastRequest]: [NetworkPacketEvent<ToastRequestPacket>];
	[Packet.UpdateAbilities]: [NetworkPacketEvent<UpdateAbilitiesPacket>];
	[Packet.UpdateAdventureSettings]: [
		NetworkPacketEvent<UpdateAdventureSettingsPacket>
	];
	[Packet.RequestNetworkSettings]: [
		NetworkPacketEvent<RequestNetworkSettingsPacket>
	];
	[Packet.Text]: [NetworkPacketEvent<TextPacket>];
	[Packet.CommandRequest]: [NetworkPacketEvent<CommandRequestPacket>];
}

export { NetworkEvents };
