import { ToastRequest } from "@serenityjs/protocol";

const packet = new ToastRequest();
packet.title = "Hello, World!";
packet.message = "This is a toast notification from Serenity/JS";

console.log(packet.serialize());

const request = new ToastRequest(packet.serialize()).deserialize();
console.log(request);

// setTimeout(() => {
// 	console.log("I WAS ALIVE FOR 10 SECONDS!");
// }, 10_000);

// jfewioj
