// NOTE: Please try to put the packets in the order according to their id. Thx!

import { Disconnect } from '@serenityjs/raknet-protocol';
import { Packet } from '../enums';
import { BiomeDefinitionList } from './BiomeDefinitionList';
import { CreativeContent } from './CreativeContent';
import { LevelChunk } from './LevelChunk';
import { Login } from './Login';
import { MovePlayer } from './MovePlayer';
import { NetworkSettings } from './NetworkSettings';
import { PacketViolationWarning } from './PacketViolationWarning';
import { PlayStatus } from './PlayStatus';
import { PlayerList } from './PlayerList';
import { RequestNetworkSettings } from './RequestNetworkSettings';
import { ResourcePackClientResponse } from './ResourcePackClientResponse';
import { ResourcePackStack } from './ResourcePackStack';
import { ResourcePacksInfo } from './ResourcePacksInfo';
import { ScriptMessage } from './ScriptMessage';
import { SetLocalPlayerAsInitialized } from './SetLocalPlayerAsInitialized';
import { SlashCommand } from './SlashCommand';
import { StartGame } from './StartGame';
import { UpdateAbilities } from './UpdateAbilities';

const Packets = {
	[Packet.Login]: Login, // 1
	[Packet.PlayStatus]: PlayStatus, // 2
	// Gap
	[Packet.Disconnect]: Disconnect, // 5
	[Packet.ResourcePacksInfo]: ResourcePacksInfo, // 6
	[Packet.ResourcePackStack]: ResourcePackStack, // 7
	[Packet.ResourcePackClientResponse]: ResourcePackClientResponse, // 8
	// Gap
	[Packet.StartGame]: StartGame, // 11
	// Gap
	[Packet.MovePlayer]: MovePlayer, // 19
	// Gap
	[Packet.LevelChunk]: LevelChunk, // 58
	// Gap
	[Packet.PlayerList]: PlayerList, // 63
	[Packet.SlashCommand]: SlashCommand, // 77
	// Gap
	[Packet.SetLocalPlayerAsInitialized]: SetLocalPlayerAsInitialized, // 113
	// Gap
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
	[Packet.UpdateAbilities]: UpdateAbilities, // 187
	// Gap
	[Packet.RequestNetworkSettings]: RequestNetworkSettings, // 193
};

export { Packets };
