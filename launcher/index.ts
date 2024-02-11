import { DimensionType } from '@serenityjs/bedrock-protocol';
import { Serenity, BetterFlat } from '@serenityjs/serenity';

const serenity = new Serenity();

serenity.start();

serenity.on('PlayerChat', (event) => {
	console.log(event.player.getDimension().players);
});
