## Introduction
This package contains the basic behavior for Worlds within SerenityJS. Worlds are handled by WorldProviders, in which they handle the loading/saving world information such as Dimension Chunks. World Dimensions hold a TerrianGenerator property, in which this does the actual generating of Dimension Chunks.

### World
Worlds can by dynamically registered and unregistered during Serenity's runtime, this allows seperate world nodes to be used in specific cases, such as Skyblock Islands.

#### Creating a World
```ts
// First we need to decide what type of WorldProvider we want to use
// SerenityJS comes with a few built-in WorldProviders, but developers can create their own
// The built-in WorldProviders are: InternalProvider & FileSystemProvider
import { InternalProvider } from "@serenityjs/world"

// Create an instance of the InternalProvider
// This provider is used to create a world that stores all of the data in memory
const provider = new InternalProvider()

// Create a new world with the name "example-world" and the provider we just created
const world = new World("example-world", provider)
```

### Dimension
Once a new World has been registered, a new Dimension needs to registered to the World before Players can access that World. The Dimension will hold the generator in which it will use to generate Chunks for the Dimension.

#### Creating a Dimension
```ts
import { Superflat } from "@serenityjs/world"
import { DimensionType } from "@serenityjs/protocol"

// Extening upon the previous example, we must contain the world to register the new dimension
const world = new World("example-world", provider)

// Create a new dimension with the name "superflat-test" and the type "Overworld"
// We also need to pass in the WorldGenerator we want to use, in this case, Superflat
world.createDimension("superflat-test", DimensionType.Overworld, new Superflat())
```