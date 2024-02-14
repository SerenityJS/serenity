import { Serenity, BlockType } from '@serenityjs/serenity';

const serenity = new Serenity();

serenity.start();

const world = serenity.getDefaultWorld();

serenity.on('Shutdown', (event) => {
	console.log(event);
});

const dirt = BlockType.resolve('minecraft:redstone_wire');

console.log(dirt.getPermutation());
