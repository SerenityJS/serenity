---
 title: Creating a Custom Block
 group: Documents
---

# Introduction
Serenity provides powerful tools for creating custom blocks that can be used in your server instance. This guide will walk you through the process of creating a custom block, including defining its properties, behaviors, and how to use it in your server.

## Creating a Custom Block
To create a custom block, you need to first define its basic properties. This is done by creating a new instance of the `CustomBlockType` class provided by the `@serenityjs/core` package. Below is an example of how to create a simple custom block.

```typescript
import { CustomBlockType } from '@serenityjs/core';

// Define a custom block type
// The first argument is the block ID, and the second argument is an object with additional options
const exampleBlockType = new CustomBlockType("serenity:example_block", { solid: true });
```

Once a custom block type is created, you can define its components via accessing the `components` property. Each component can have its own set of properties, which can be defined before or after the block type is created. These components are the same as used in the Vanilla Minecraft Addon system, which allows for the ease of use and understanding. Custom blocks from vanilla Minecraft can be easily converted to custom blocks in Serenity.

In the next example, we will assign a component to the base block type. Which means all permutations will inherit this component, unless overridden.

```typescript
import { MaterialRenderMethod } from '@serenityjs/protocol';

// The base type will emit light with a level of 15
exampleBlockType.components.setLightEmission(15);

// Get the base geometry component and set the model identifier
const geometry = exampleBlockType.components.getGeometry();
geometry.setModelIdentifier("geometry.example_block");

// Get the base material component and create a default material instance
const materials = exampleBlockType.components.getMaterialInstances();
materials.createMaterialInstance("*", {
  texture: "example_block",
  render_method: MaterialRenderMethod.AlphaTest
});
```

## Block Permutations
Block permutations are a way to define different variations of a block called states. Each permutation can have its own set of component properties. To create a permutation, you can use the `createPermutation` method on the `CustomBlockType` instance. The state of a permutation can be a string, number, or boolean.

```typescript
const permutation = exampleBlockType.createPermutation({
  boolean_state: true,
  number_state: 42,
  string_state: "example",
});
```

Permutations can override the base components of the block type. In this next example, we will create 2 permutations of the block type. The first permutation will have a different light emission level of zero, and the second permutation will have a light emission level of 15. This will create two different variations of the block, where one emits light and the other does not.

```typescript
// Create a permutation with a different light emission level
const permutation1 = exampleBlockType.createPermutation({ powered: false });
permutation1.components.setLightEmission(0); // Level 0 will not emit light

// Create another permutation with a different light emission level
const permutation2 = exampleBlockType.createPermutation({ powered: true });
permutation2.components.setLightEmission(15); // Level 15 will emit light
```

## Block Traits
Block traits are a way to define additional properties for a block. These traits can be used to define the behavior of the block in the game. For example, you can define a trait that makes the block emit light when interacted with. To create a trait, you create a new class that extends the `BlockTrait` class. Below is an example of how to create a simple block trait that makes the block emit light when interacted with.

First we need to extends upon the code above, we need to make the base block type interactable. This is done by calling the `setIsInteractable` method within the components property of the block type. This will allow us to properly interact with the block in the game.

```typescript
// This will make the block type interactable
exampleBlockType.components.setIsInteractable(true);
```

Next, we can create a new class that extends the `BlockTrait` class. This class will define the behavior of the block when it is interacted with. In this example, we will create a trait that makes the block emit light when interacted with. Traits add a sense of reusability to the code, as they can be used in multiple blocks. This is similar to how components are used in the block type.

```typescript
import { BlockTrait } from '@serenityjs/core';

class ExampleBlockTrait extends BlockTrait {
  // Every trait must have a unique identifier
  public static readonly identifier = "serenity:example_block_trait";

  public onInteract(): void {
    // Get the powered state of the block, which we defined in the permutation
    const state = this.block.getState("powered");

    // Toggle the powered state of the block
    this.block.setState("powered", !state);
  }
}
```

Once the trait is defined, you can register it with the block type. This means when the block is initially created, it will have the trait applied to it. You can register the trait by calling the `registerTrait` method on the block type instance.

```typescript
// The block type will now have the trait applied to it
exampleBlockType.registerTrait(ExampleBlockTrait);
```

## Conclusion
In this guide, we have covered the basics of creating a custom block in Serenity. We have defined a custom block type, created permutations, and added traits to define the behavior of the block. Once these steps are completed, you will need to register the block type to the world instance. This is done by calling the `registerType` method on the `blockPalette` property of the world instance.

```typescript
world.blockPalette.registerType(exampleBlockType);

// Optionally, you can register the block trait as well
world.blockPalette.registerTrait(ExampleBlockTrait);
```

If you are interested in the full code snippet, you can find it [here](https://github.com/SerenityJS/serenity/tree/main/docs/custom-block/code.ts)!