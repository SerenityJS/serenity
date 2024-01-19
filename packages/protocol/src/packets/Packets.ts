// NOTE: Please try to put the packets in the order according to their id. Thx!

import { Disconnect } from '@serenityjs/raknet-protocol';
import { Packet } from '../enums';
import { AddPlayer } from './AddPlayer';
import { BiomeDefinitionList } from './BiomeDefinitionList';
import { BlockPickRequest } from './BlockPickRequest';
import { CommandRequest } from './CommandRequest';
import { ContainerClose } from './ContainerClose';
import { ContainerOpen } from './ContainerOpen';
import { CreativeContent } from './CreativeContent';
import { Interact } from './Interact';
import { LevelChunk } from './LevelChunk';
import { Login } from './Login';
import { MovePlayer } from './MovePlayer';
import { NetworkChunkPublisherUpdate } from './NetworkChunkPublisherUpdate';
import { NetworkSettings } from './NetworkSettings';
import { PacketViolationWarning } from './PacketViolationWarning';
import { PlayStatus } from './PlayStatus';
import { PlayerAction } from './PlayerAction';
import { PlayerList } from './PlayerList';
import { RequestNetworkSettings } from './RequestNetworkSettings';
import { ResourcePackClientResponse } from './ResourcePackClientResponse';
import { ResourcePackStack } from './ResourcePackStack';
import { ResourcePacksInfo } from './ResourcePacksInfo';
import { ScriptMessage } from './ScriptMessage';
import { SelectedSlot } from './SelectedSlot';
import { SetEntityData } from './SetEntityData';
import { SetLocalPlayerAsInitialized } from './SetLocalPlayerAsInitialized';
import { SetTitle } from './SetTitle';
import { StartGame } from './StartGame';
import { Text } from './Text';
import { ToastRequest } from './ToastRequest';
import { UpdateAbilities } from './UpdateAbilities';
import { UpdateAttributes } from './UpdateAttributes';

const Packets = {
	[Packet.Login]: Login, // 1
	[Packet.PlayStatus]: PlayStatus, // 2
	// Gap
	[Packet.Disconnect]: Disconnect, // 5
	[Packet.ResourcePacksInfo]: ResourcePacksInfo, // 6
	[Packet.ResourcePackStack]: ResourcePackStack, // 7
	[Packet.ResourcePackClientResponse]: ResourcePackClientResponse, // 8
	[Packet.Text]: Text, // 9
	// Gap
	[Packet.StartGame]: StartGame, // 11
	[Packet.AddPlayer]: AddPlayer, // 12
	// Gap
	[Packet.MovePlayer]: MovePlayer, // 19
	// Gap
	[Packet.UpdateAttributes]: UpdateAttributes, // 29
	// Gap
	[Packet.SelectedSlot]: SelectedSlot, // 31
	// Gap
	[Packet.Interact]: Interact, // 33
	[Packet.BlockPickRequest]: BlockPickRequest, // 34
	// Gap
	[Packet.PlayerAction]: PlayerAction, // 36
	// Gap
	[Packet.SetEntityData]: SetEntityData, // 39
	// Gap
	[Packet.ContainerOpen]: ContainerOpen, // 46
	[Packet.ContainerClose]: ContainerClose, // 47
	// Gap
	[Packet.LevelChunk]: LevelChunk, // 58
	// Gap
	[Packet.PlayerList]: PlayerList, // 63
	// Gap
	[Packet.CommandRequest]: CommandRequest, // 77
	// Gap
	[Packet.SetTitle]: SetTitle, // 88
	// Gap
	[Packet.SetLocalPlayerAsInitialized]: SetLocalPlayerAsInitialized, // 113
	// Gap
	[Packet.NetworkChunkPublisherUpdate]: NetworkChunkPublisherUpdate, // 121
	[Packet.BiomeDefinitionList]: BiomeDefinitionList, // 122
	// Gap
	[Packet.NetworkSettings]: NetworkSettings, // 143
	// Gap
	[Packet.CreativeContent]: CreativeContent, // 145
	// Gap
	[Packet.PacketViolationWarning]: PacketViolationWarning, // 156
	// Gap
	[Packet.ScriptMessage]: ScriptMessage, // 177
	// Gap
	[Packet.ToastRequest]: ToastRequest, // 186
	[Packet.UpdateAbilities]: UpdateAbilities, // 187
	// Gap
	[Packet.RequestNetworkSettings]: RequestNetworkSettings, // 193
};

export { Packets };
