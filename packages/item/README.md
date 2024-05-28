## Introduction
This package contains the Minecraft Bedrock Edition ItemTypes, CustomItemTypes, CreativeItems, and ItemIdentifiers. The classes are developed in a way to resemble the official Bedrock Edition Scripting API. This choice was to bring familiarity to the SerenityJS ecosystem for developers making the switch from the official Bedrock Dedicated Server.

### ItemType
ItemType represents a item type in the game, which holds a possible block type. If the item identifier, for example, is "minecraft:diamond", the type is expected to not hold a block type property.
```ts
import { ItemType, ItemIdentifier } from "@serenityjs/item"

// Get the ItemType for dirt, which will contain a BlockType
const dirtItemType = ItemType.get(ItemIdentifier.Dirt)

// Get the identifier for the dirt item
dirtItemType.identifier // Expected to be "minecraft:dirt"

// Get the BlockType for the dirt block
dirtItemType.block // Expected to be BlockType.get(BlockIdentifier.Dirt)

// Get the ItemType for diamond, which will not contain a BlockType
const diamondItemType = ItemType.get(ItemIdentifier.Diamond)

// Get the identifier for the diamond item
diamondItemType.identifier // Expected to be "minecraft:diamond"

// Get the BlockType for the diamond block
diamondItemType.block // Expected to be "undefined"
```

### CustomItemType
#### Registering a Custom Item
CustomItemType allows developers to create and register custom items to SerenityJS. Custom items will also be automatically registered to the CreativeItem registery. Custom items can also be registered with a CustomBlockType.
```ts
import { CustomItemType, CreativeItem } from "@serenityjs/item"

// Create a new CustomItemType and register it to the creative inventory
// Without providing a category or a group, the item will not be displayed in the creative inventory
const rubyItemType = new CustomItemType("serenity:ruby")

// Register the custom item to the creative inventory
CreativeItem.register(rubyItemType, 0)
```

#### Registering a Custom Item with a Custom Block
```ts
import { CustomBlockType } from "@serenityjs/block"
import { CustomItemType } from "@serenityjs/item"

// Get the custom block type
const rubyBlockType = CustomBlockType.get("serenity:ruby_block")

// Create a new custom item with the custom block type
// Since a item category was given, the item will be added to the creative inventory
const rubyBlockItemType = new CustomItemType("serenity:ruby_block", rubyBlockType, ItemCategory.Construction, ItemGroup.Ore)

// Get the custom item identifier
rubyBlockItemType.identifier // Expected to be "serenity:ruby_block"

// Get the custom block type
rubyBlockItemType.block // Expected to be CustomBlockType.get("serenity:ruby_block")
```

#### Resolving a Custom Item
```ts
import { CustomItemType } from "@serenityjs/item"

// Get the custom item previously registered
const rubyItemType = CustomItemType.get("serenity:ruby")

// Get the item type identifier
rubyItemType.identifier // Expected to be "serenity:ruby"

// Get the item type of the item type
rubyItemType.block // Expected to be "undefined"
```