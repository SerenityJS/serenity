export * from "./serenity";
export * from "./handlers";
export * from "./properties";
export * from "./events";

import { Serenity } from "./serenity";

const serenity = new Serenity();

serenity.start();
