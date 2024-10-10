import { Serenity } from "@serenityjs/core";
import { Logger } from "@serenityjs/logger";

Logger.DEBUG = true;

const serenity = new Serenity({ port: 19142 });

serenity.network.raknet.message = "2";

serenity.start();

// serenity.network.on("all", (data) => console.log(data.packet));
