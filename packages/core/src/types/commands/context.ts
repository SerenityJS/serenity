import { Entity } from "../../entity";
import { Dimension } from "../../world";

type CommandContext<T = NonNullable<unknown>> = {
  origin: Dimension | Entity;
} & T;

export { type CommandContext };
