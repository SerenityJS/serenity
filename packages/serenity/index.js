const { Packet } = require("@serenityjs/protocol");

const { Serenity } = require(".");
const s = new Serenity();
s.start();

s.network.on(Packet.PacketViolationWarning, (data) => {
	console.log("PacketViolationWarning", data.packet);
});
