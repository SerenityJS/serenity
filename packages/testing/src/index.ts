import { Packet } from '@serenityjs/bedrock-protocol';
import { Serenity } from '@serenityjs/serenity';

const serenity = new Serenity(630, '1.20.51', '0.0.0.0', 19_132, true);

serenity.start();
