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

# Block Permutations
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