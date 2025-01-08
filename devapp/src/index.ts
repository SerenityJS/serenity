import {
  Serenity,
  LevelDBProvider,
  Player,
  ItemStack,
  ItemIdentifier,
  ItemEnchantableTrait
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";
import { ContainerName, Enchantment } from "@serenityjs/protocol";

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

for (const [, world] of serenity.worlds)
  world.commands.register("test", "", ({ origin }) => {
    if (!(origin instanceof Player)) return;

    const item1 = new ItemStack(ItemIdentifier.DiamondSword);
    const ench1 = item1.addTrait(ItemEnchantableTrait);
    ench1.addEnchantment(Enchantment.Knockback, 1);

    const item2 = new ItemStack(ItemIdentifier.DiamondSword);
    const ench2 = item2.addTrait(ItemEnchantableTrait);
    ench2.addEnchantment(Enchantment.Knockback, 2);

    const item3 = new ItemStack(ItemIdentifier.DiamondSword);
    const ench3 = item3.addTrait(ItemEnchantableTrait);
    ench3.addEnchantment(Enchantment.Knockback, 3);

    const item10 = new ItemStack(ItemIdentifier.DiamondSword);
    const ench10 = item10.addTrait(ItemEnchantableTrait);
    ench10.addEnchantment(Enchantment.Knockback, 10);

    const container = origin.getContainer(ContainerName.Inventory);

    container?.addItem(item1);
    container?.addItem(item2);
    container?.addItem(item3);
    container?.addItem(item10);
  });
