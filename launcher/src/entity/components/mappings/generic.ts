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
	EntityHasGravityComponent
} from "..";

import type { EntityComponent } from "../component";

const GENERIC_COMPONENTS: Array<typeof EntityComponent> = [
	EntityInventoryComponent,
	EntityMovementComponent,
	EntityHealthComponent,
	EntityScaleComponent,
	EntityVariantComponent,
	EntityNametagComponent,
	EntityAlwaysShowNametagComponent,
	EntityCanShowNametagComponent,
	EntityBreathingComponent,
	EntityHasGravityComponent
];

export { GENERIC_COMPONENTS };
