import { Air } from './Air';
import { Bedrock } from './Bedrock';
import { Dirt } from './Dirt';
import { Grass } from './Grass';
import { Stone } from './Stone';

export * from './Block';
export * from './Air';
export * from './Stone';
export * from './Dirt';
export * from './Grass';
export * from './Bedrock';

const VANILLA_BLOCKS = [Stone, Air, Dirt, Grass, Bedrock];

export { VANILLA_BLOCKS };
