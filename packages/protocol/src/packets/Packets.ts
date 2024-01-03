import { Disconnect } from '@serenityjs/raknet-protocol';
import { Packet } from '../enums';
import { Login } from './Login';
import { RequestNetworkSettings } from './RequestNetworkSettings';

const Packets = {
	[Packet.Login]: Login, // 1
	// Gap
	[Packet.Disconnect]: Disconnect, // 3
	// Gap
	[Packet.RequestNetworkSettings]: RequestNetworkSettings, // 193
};

export { Packets };
