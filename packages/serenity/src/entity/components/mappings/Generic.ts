import type { EntityComponent } from '../Component.js';
import { EntityInventoryComponent, EntityMovementComponent, EntityHealthComponent } from '../index.js';

const GENERIC_COMPONENTS: (typeof EntityComponent)[] = [
	EntityInventoryComponent,
	EntityMovementComponent,
	EntityHealthComponent,
];

export { GENERIC_COMPONENTS };
