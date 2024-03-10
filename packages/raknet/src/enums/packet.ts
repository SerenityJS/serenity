// NOTE: Please keep all packets in numerical order by their id. Thanks!

enum Packet {
	ConnectedPing = 0x00, // 0
	UnconnectedPing = 0x01, // 1
	ConnectedPong = 0x03, // 3
	OpenConnectionRequest1 = 0x05, // 5
	OpenConnectionReply1 = 0x06, // 6
	OpenConnectionRequest2 = 0x07, // 7
	OpenConnectionReply2 = 0x08, // 8
	ConnectionRequest = 0x09, // 9
	ConnectionRequestAccepted = 0x10, // 16
	NewIncomingConnection = 0x13, // 19
	Disconnect = 0x15, // 21
	IncompatibleProtocolVersion = 0x19, // 25
	UnconnectedPong = 0x1c, // 28
	FrameSet = 0x80, // 128
	Nack = 0xa0, // 160
	Ack = 0xc0 // 192
}

export { Packet };
