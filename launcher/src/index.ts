import { Serenity } from "./serenity";

export * from "./serenity";
export * from "./handlers";
export * from "./properties";
export * from "./providers";
export * from "./types";
export * from "./worlds";
export * from "./events";

/**
 * The serenity instance.
 */
const serenity = new Serenity();

export { serenity };
