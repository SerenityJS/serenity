import { CustomBlockType } from '@serenityjs/core';
import { BlockTrait } from '@serenityjs/core';

// Define a custom block type
// The first argument is the block ID, and the second argument is an object with additional options
const exampleBlockType = new CustomBlockType("serenity:example_block", { solid: true });

// This will make the block type interactable
exampleBlockType.components.setIsInteractable(true);

// Create a permutation with a different light emission level
const permutation1 = exampleBlockType.createPermutation({ powered: false });
permutation1.components.setLightEmission(0); // Level 0 will not emit light

// Create another permutation with a different light emission level
const permutation2 = exampleBlockType.createPermutation({ powered: true });
permutation2.components.setLightEmission(15); // Level 15 will emit light

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

// Register the trait with the block type
exampleBlockType.registerTrait(ExampleBlockTrait);
