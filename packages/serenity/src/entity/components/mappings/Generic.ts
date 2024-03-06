import type { EntityComponent } from '../Component.js';
import {
	EntityInventoryComponent,
	EntityMovementComponent,
	EntityHealthComponent,
	EntityScaleComponent,
	EntityVariantComponent,
} from '../index.js';

const GENERIC_COMPONENTS: (typeof EntityComponent)[] = [
	EntityInventoryComponent,
	EntityMovementComponent,
	EntityHealthComponent,
	EntityScaleComponent,
	EntityVariantComponent,
];

export { GENERIC_COMPONENTS };
