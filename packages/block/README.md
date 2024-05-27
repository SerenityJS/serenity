## About
This package contains the Minecraft Bedrock Edition BlockTypes, BlockPermutations, and BlockIdentifiers. The classes are developed in a way to resemble the official Bedrock Edition Scripting API. This choice was to bring familiarity to the SerenityJS ecosystem for developers making the switch from the official Bedrock Dedicated Server.

## Usage

### BlockType
BlockType represents a block type in the game, which hold all possible permutations the block can have.
```ts
import { BlockType, BlockIdentifier } from "@serenityjs/block"

// Get the block type for dirt
const dirtType = BlockType.get(BlockIdentifier.Dirt)

// Get the identifier of the type
dirtType.identifier // Expected to be "minecraft:dirt"
```

### BlockPermutation
BlockPermutation represents a current state of a block, for example dirt has a single state "dirt_type". This state can be changed to "coarse" or "normal" to represent a different state of dirt. This means dirt has a total of 2 permutations, one for "coarse" and one for "normal".
```ts
import { BlockPermutation, BlockIdentifier } from "@serenityjs/block"

// Get the block permutation for coarse dirt
const coarseDirtPermutation = BlockPermutation.resolve(BlockIdentifier.Dirt, { dirt_type: "coarse" })

// Get the block type for coarse dirt permutation
// Which is expected to be "minecraft:dirt"
const blockType = coarseDirtPermutation.type // Equivalent to BlockType.get(BlockIdentifier.Dirt)

// Get the block state for coarse dirt permutation
coarseDirtPermutation.state // Expected to be { dirt_type: "coarse" }
```

### CustomBlockType
#### Registering a Custom Block
CustomBlockType allows developers to create and register custom blocks to SerenityJS. Custom blocks can also be registered with permutations, which allows developers to create multiple variations of a block.
```ts
import { CustomBlockType, BlockPermutation } from "@serenityjs/block"

// Creates a custom block type with the identifier "serenity:ruby_block"
// Second parameter is indicates if the block can be waterlogged
const rubyBlockType = new CustomBlockType("serenity:ruby_block", false)

// Create a permutation for the block type
// Blank object indicates that the block has no additional permutations
const rubyBlockPermutation = BlockPermutation.create(rubyBlockType, {})

// The permutation now must be registered with the block type
rubyBlockType.register(rubyBlockPermutation)
```

#### Resolving a Custom Block
```ts
import { CustomBlockType } from "@serenityjs/block"

// Get the custom block previously registered
const rubyBlockType = CustomBlockType.get("serenity:ruby_block")

// Get the block type identifier
rubyBlockType.identifier // Expected to be "serenity:ruby_block"

// Get the permutation of the block type
rubyBlockType.permutations // Expected to be an array with a length of 1
```