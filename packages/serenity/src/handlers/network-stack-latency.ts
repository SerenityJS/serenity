import { NetworkStackLatencyPacket } from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

class NetworkStackLatency extends SerenityHandler {
	public static packet = NetworkStackLatencyPacket.id;

	public static handle(): void {
		return;
	}
}

export { NetworkStackLatency };
