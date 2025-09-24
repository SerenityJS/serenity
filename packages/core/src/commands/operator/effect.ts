import { EffectType } from "@serenityjs/protocol";
import type { World } from "../../world";
import { BooleanEnum, ClearEnum, EffectEnum, IntegerEnum, TargetEnum } from "../enums";
import { EntityEffectsTrait } from "../../entity";

const register = (world: World) => {
  // Register the effect command
  world.commandPalette.register(
    "effect",
    "Add an effect to a target.",
    (registry) => {
      // Set the permissions of the command
      registry.permissions = ["serenity.operator"];

      // Create an overload for the command
      registry.overload(
        {
          target: TargetEnum,
          effect: EffectEnum,
          seconds: [IntegerEnum, true],
          amplifier: [IntegerEnum, true],
          hideParticles: [BooleanEnum, true]
        },
        (context) => {
          // Get the target from the context
          const targets = context.target.result;
          const effect = context.effect.result;
          const effectType = EffectType[effect as keyof typeof EffectType]
          if (!targets) throw new Error("Invalid target.");
          if (!effectType) throw new Error("Invalid effect.");
          const seconds = context.seconds?.result ?? 5;
          const amplifier = context.amplifier?.result ?? 0;
          const showParticles = !(context.hideParticles?.result ?? false);

          // Create an array to hold result messages.
          const messages: string[] = [];

          for (const target of targets) {
            if (target.hasEffect(effectType)) {
              target.removeEffect(effectType);
            }
            target.addEffect(effectType, seconds, { amplifier, showParticles });
            messages.push(`§fGave ${effectType} * ${amplifier} to ${target.nameTag} for ${seconds} seconds`);
          }

          // Return the message
          return {
            message: messages.join("\n")
          };
        }
      );

      // Create an overload for the command
      registry.overload(
        {
          target: TargetEnum,
          clear: ClearEnum,
          effect: [EffectEnum, true],
        },
        (context) => {
          // Get the target from the context
          const targets = context.target.result;
          const effect = context.effect.result;
          if (!targets) throw new Error("Invalid target.");

          const effectType = EffectType[effect as keyof typeof EffectType]

          // Create an array to hold result messages.
          const messages: string[] = [];

          if (effect) {
            for (const target of targets) {
              if (target.hasEffect(effectType)) {
                target.removeEffect(effectType);
                messages.push(`§fTook ${effect} from ${target.nameTag}`);
              } else {
                messages.push(`§cCouldn't take ${effect} from ${target.nameTag} as they do not have the effect`);
              }
            }
          } else {
            for (const target of targets) {
              const effects = target.getTrait(EntityEffectsTrait).getEffects()
              for (const effect of effects) {
                target.removeEffect(effect);
              }
              messages.push(`§fTook all effects from ${target.nameTag}`);
            }
          }

          // Return the message
          return {
            message: messages.join("\n")
          };
        }
      );
    },
    () => { }
  );
};

export default register;
