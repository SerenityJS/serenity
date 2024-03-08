import type { EntityComponent } from '../Component.js';
import {
	EntityInventoryComponent,
	EntityMovementComponent,
	EntityHealthComponent,
	EntityScaleComponent,
	EntityVariantComponent,
	EntityNametagComponent,
	EntityAlwaysShowNametagComponent,
	EntityCanShowNametagComponent,
	EntityBreathingComponent,
} from '../index.js';

const GENERIC_COMPONENTS: (typeof EntityComponent)[] = [
	EntityInventoryComponent,
	EntityMovementComponent,
	EntityHealthComponent,
	EntityScaleComponent,
	EntityVariantComponent,
	EntityNametagComponent,
	EntityAlwaysShowNametagComponent,
	EntityCanShowNametagComponent,
	EntityBreathingComponent,
];

export { GENERIC_COMPONENTS };
