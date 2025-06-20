import { ItemTypeCanDestroyInCreativeComponent } from "./can-destroy-in-creative";
import { ItemTypeDisplayNameComponent } from "./display-name";
import { ItemTypeBlockPlacerComponent } from "./block-placer";
import { ItemTypeWearableComponent } from "./wearable";
import { ItemTypeMaxStackComponent } from "./max-stack-size";
import { ItemTypeIconComponent } from "./icon";
import { ItemTypeItemPropertiesComponent } from "./item-properties";
import { ItemTypeCooldownComponent } from "./cooldown";
import { ItemTypeDiggerComponent } from "./digger";
import { ItemTypeHandEquippedComponent } from "./hand_equipped";
import { ItemTypeFoodComponent } from "./food";

const ItemTypeComponents = [
  ItemTypeCanDestroyInCreativeComponent,
  ItemTypeDisplayNameComponent,
  ItemTypeBlockPlacerComponent,
  ItemTypeWearableComponent,
  ItemTypeMaxStackComponent,
  ItemTypeIconComponent,
  ItemTypeItemPropertiesComponent,
  ItemTypeCooldownComponent,
  ItemTypeDiggerComponent,
  ItemTypeHandEquippedComponent,
  ItemTypeFoodComponent
];

export * from "./component";
export * from "./can-destroy-in-creative";
export * from "./display-name";
export * from "./block-placer";
export * from "./wearable";
export * from "./max-stack-size";
export * from "./icon";
export * from "./item-properties";
export * from "./cooldown";
export * from "./digger";
export * from "./hand_equipped";
export * from "./food";

export { ItemTypeComponents };
