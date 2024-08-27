import type { LoginTokenData, PermissionLevel } from "@serenityjs/protocol";
import type { NetworkSession } from "@serenityjs/network";

interface PlayerOptions {
	session: NetworkSession;
	tokens: LoginTokenData;
	permission: PermissionLevel;
}

export { PlayerOptions };
