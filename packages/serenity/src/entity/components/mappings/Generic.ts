import type { EntityComponent } from '../Component.js';
import {
	EntityInventoryComponent,
	EntityMovementComponent,
	EntityHealthComponent,
	EntityScaleComponent,
	EntityVariantComponent,
	EntityNametagComponent,
} from '../index.js';

const GENERIC_COMPONENTS: (typeof EntityComponent)[] = [
	EntityInventoryComponent,
	EntityMovementComponent,
	EntityHealthComponent,
	EntityScaleComponent,
	EntityVariantComponent,
	EntityNametagComponent,
];

export { GENERIC_COMPONENTS };
