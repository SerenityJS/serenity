import {
  Serenity,
  LevelDBProvider,
  WorldEvent,
  Player,
  EntityIdentifier,
  EntityMovementTrait,
  ItemStack,
  ItemIdentifier,
  ItemEnchantableTrait,
  EntityInventoryTrait
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";
import { Enchantment, Vector3f } from "@serenityjs/protocol";

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  serenity: {
    permissions: "./permissions.json",
    resourcePacks: "./resource_packs",
    debugLogging: true
  }
});

serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
  world.commands.register("test", "", ({ origin }) => {
    if (!(origin instanceof Player)) return;

    const inventory = origin.getTrait(EntityInventoryTrait);

    const helmet = new ItemStack(ItemIdentifier.NetheriteHelmet);
    const chestplate = new ItemStack(ItemIdentifier.NetheriteChestplate);
    const leggings = new ItemStack(ItemIdentifier.NetheriteLeggings);
    const boots = new ItemStack(ItemIdentifier.NetheriteBoots);

    const helmetEnchantments = helmet.addTrait(ItemEnchantableTrait);
    helmetEnchantments.addEnchantment(Enchantment.Unbreaking, 3);

    const chestplateEnchantments = chestplate.addTrait(ItemEnchantableTrait);
    chestplateEnchantments.addEnchantment(Enchantment.Unbreaking, 3);

    const leggingsEnchantments = leggings.addTrait(ItemEnchantableTrait);
    leggingsEnchantments.addEnchantment(Enchantment.Unbreaking, 3);

    const bootsEnchantments = boots.addTrait(ItemEnchantableTrait);
    bootsEnchantments.addEnchantment(Enchantment.Unbreaking, 3);

    inventory.container.addItem(helmet);
    inventory.container.addItem(chestplate);
    inventory.container.addItem(leggings);
    inventory.container.addItem(boots);
  });
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
