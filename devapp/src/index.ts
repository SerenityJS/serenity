import { Serenity, LevelDBProvider, CustomBlockType } from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";
import { MaterialRenderMethod } from "@serenityjs/protocol";

const exampleBlockType = new CustomBlockType("serenity:example_block", {
  solid: true
});

exampleBlockType.components.setLightEmission(15);

const geometry = exampleBlockType.components.getGeometry();
geometry.setModelIdentifier("geometry.example_block");

const materials = exampleBlockType.components.getMaterialInstances();
materials.createMaterialInstance("*", {
  texture: "example_block",
  render_method: MaterialRenderMethod.AlphaTest
});

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  serenity: {
    permissions: "./permissions.json",
    resourcePacks: "./resource_packs",
    debugLogging: true
  }
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
