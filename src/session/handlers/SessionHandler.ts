import type { Encapsulated } from '@serenityjs/protocol';
import type { Serenity } from '../../Serenity';
import { Logger } from '../../logger';
import type { NetworkSession } from '../NetworkSession';

abstract class SessionHandler {
	public static serenity: Serenity;
	public static logger = new Logger('Handlers', '#3236a8');

	public static handle(packet: Encapsulated, session: NetworkSession): void {
		this.logger.error('Handler.handle() is not implemented.');
	}
}

export { SessionHandler };
