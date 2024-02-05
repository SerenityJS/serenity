import { Serenity } from '../packages/serenity/src';

const serenity = new Serenity({
	address: '0.0.0.0',
	debug: true,
});

serenity.start();
