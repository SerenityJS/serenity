// NOTE: Please try to put the packets in the order according to their id. Thx!

import { Packet } from "../../enums";

import { AddEntityPacket } from "./add-entity";
import { AddPlayerPacket } from "./add-player";
import { AnimatePacket } from "./animate";
import { AvailableCommandsPacket } from "./available-commands";
import { BiomeDefinitionListPacket } from "./biome-definition-list";
import { BlockPickRequestPacket } from "./block-pick-request";
import { ChangeDimensionPacket } from "./change-dimension";
import { ChunkRadiusUpdatePacket } from "./chunk-radius-update";
import { CommandOutputPacket } from "./command-output";
import { CommandRequestPacket } from "./command-request";
import { ContainerClosePacket } from "./container-close";
import { ContainerOpenPacket } from "./container-open";
import { CreativeContentPacket } from "./creative-content";
import { DisconnectPacket } from "./disconnect";
import { InteractPacket } from "./interact";
import { InventoryContentPacket } from "./inventory-content";
import { InventorySlotPacket } from "./inventory-slot";
import { InventoryTransactionPacket } from "./inventory-transaction";
import { ItemStackRequestPacket } from "./item-stack-request";
import { ItemStackResponsePacket } from "./item-stack-response";
import { LevelChunkPacket } from "./level-chunk";
import { LevelEventPacket } from "./level-event";
import { LoginPacket } from "./login";
import { MobEquipmentPacket } from "./mob-equipment";
import { ModalFormRequestPacket } from "./modal-form-request";
import { ModalFormResponsePacket } from "./modal-form-response";
import { MoveEntityPacket } from "./move-entity";
import { MovePlayerPacket } from "./move-player";
import { NetworkChunkPublisherUpdatePacket } from "./network-chunk-publisher-update";
import { NetworkSettingsPacket } from "./network-settings";
import { PacketViolationWarningPacket } from "./packet-violation-warning";
import { PlayStatusPacket } from "./play-status";
import { PlayerActionPacket } from "./player-action";
import { PlayerAuthInputPacket } from "./player-auth-input";
import { PlayerHotbarPacket } from "./player-hotbar";
import { PlayerListPacket } from "./player-list";
import { RemoveEntityPacket } from "./remove-entity";
import { RequestChunkRadiusPacket } from "./request-chunk-radius";
import { RequestNetworkSettingsPacket } from "./request-network-settings";
import { ResourcePackClientResponsePacket } from "./resource-pack-client-response";
import { ResourcePackStackPacket } from "./resource-pack-stack";
import { ResourcePacksInfoPacket } from "./resource-packs-info";
import { RespawnPacket } from "./respawn";
import { ScriptMessagePacket } from "./script-message";
import { SetCommandsEnabledPacket } from "./set-commands-enabled";
import { SetEntityDataPacket } from "./set-entity-data";
import { SetLocalPlayerAsInitializedPacket } from "./set-local-player-as-initialized";
import { SetPlayerGameTypePacket } from "./set-player-game-type";
import { SetTitlePacket } from "./set-title";
import { StartGamePacket } from "./start-game";
import { TextPacket } from "./text";
import { ToastRequestPacket } from "./toast-request";
import { UpdateAbilitiesPacket } from "./update-abilities";
import { UpdateAdventureSettingsPacket } from "./update-adventure-settings";
import { UpdateAttributesPacket } from "./update-attributes";
import { UpdateBlockPacket } from "./update-block";

const Packets = {
	[Packet.Login]: LoginPacket, // 1
	[Packet.PlayStatus]: PlayStatusPacket, // 2
	[Packet.Disconnect]: DisconnectPacket, // 5
	[Packet.ResourcePacksInfo]: ResourcePacksInfoPacket, // 6
	[Packet.ResourcePackStack]: ResourcePackStackPacket, // 7
	[Packet.ResourcePackClientResponse]: ResourcePackClientResponsePacket, // 8
	[Packet.Text]: TextPacket, // 9
	[Packet.StartGame]: StartGamePacket, // 11
	[Packet.AddPlayer]: AddPlayerPacket, // 12
	[Packet.AddEntity]: AddEntityPacket, // 13
	[Packet.RemoveEntity]: RemoveEntityPacket, // 14
	[Packet.MoveEntity]: MoveEntityPacket, // 18
	[Packet.MovePlayer]: MovePlayerPacket, // 19
	[Packet.UpdateBlock]: UpdateBlockPacket, // 21
	[Packet.LevelEvent]: LevelEventPacket, // 25
	[Packet.UpdateAttributes]: UpdateAttributesPacket, // 29
	[Packet.InventoryTransaction]: InventoryTransactionPacket, // 30
	[Packet.MobEquipment]: MobEquipmentPacket, // 31
	[Packet.Interact]: InteractPacket, // 33
	[Packet.BlockPickRequest]: BlockPickRequestPacket, // 34
	[Packet.PlayerAction]: PlayerActionPacket, // 36
	[Packet.SetEntityData]: SetEntityDataPacket, // 39
	[Packet.Animate]: AnimatePacket, // 44
	[Packet.Respawn]: RespawnPacket, // 45
	[Packet.ContainerOpen]: ContainerOpenPacket, // 46
	[Packet.ContainerClose]: ContainerClosePacket, // 47
	[Packet.PlayerHotbar]: PlayerHotbarPacket, // 48
	[Packet.InventoryContent]: InventoryContentPacket, // 49
	[Packet.InventorySlot]: InventorySlotPacket, // 50
	[Packet.LevelChunk]: LevelChunkPacket, // 58
	[Packet.SetCommandsEnabled]: SetCommandsEnabledPacket, // 59
	[Packet.ChangeDimension]: ChangeDimensionPacket, // 61
	[Packet.SetPlayerGameType]: SetPlayerGameTypePacket, // 62
	[Packet.PlayerList]: PlayerListPacket, // 63
	[Packet.RequestChunkRadius]: RequestChunkRadiusPacket, // 69
	[Packet.ChunkRadiusUpdate]: ChunkRadiusUpdatePacket, // 70
	[Packet.AvailableCommands]: AvailableCommandsPacket, // 76
	[Packet.CommandRequest]: CommandRequestPacket, // 77
	[Packet.CommandOutput]: CommandOutputPacket, // 79
	[Packet.SetTitle]: SetTitlePacket, // 88
	[Packet.ModalFormRequest]: ModalFormRequestPacket, // 100
	[Packet.ModalFormResponse]: ModalFormResponsePacket, // 101
	[Packet.SetLocalPlayerAsInitialized]: SetLocalPlayerAsInitializedPacket, // 113
	[Packet.NetworkChunkPublisherUpdate]: NetworkChunkPublisherUpdatePacket, // 121
	[Packet.BiomeDefinitionList]: BiomeDefinitionListPacket, // 122
	[Packet.NetworkSettings]: NetworkSettingsPacket, // 143
	[Packet.PlayerAuthInput]: PlayerAuthInputPacket, // 144
	[Packet.CreativeContent]: CreativeContentPacket, // 145
	[Packet.ItemStackRequest]: ItemStackRequestPacket, // 147
	[Packet.ItemStackResponse]: ItemStackResponsePacket, // 148
	[Packet.PacketViolationWarning]: PacketViolationWarningPacket, // 156
	[Packet.ScriptMessage]: ScriptMessagePacket, // 177
	[Packet.ToastRequest]: ToastRequestPacket, // 186
	[Packet.UpdateAbilities]: UpdateAbilitiesPacket, // 187
	[Packet.UpdateAdventureSettings]: UpdateAdventureSettingsPacket, // 188
	[Packet.RequestNetworkSettings]: RequestNetworkSettingsPacket // 193
};

export { Packets };
