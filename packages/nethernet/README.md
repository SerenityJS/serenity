# NetherNet

The NetherNet transport for SerenityJS. Since Minecraft: Bedrock Edition 26.60, clients only join servers over NetherNet; RakNet is no longer supported.

NetherNet is built on WebRTC. A client joins in two steps:

1. It queries `GET /v1/join` over HTTPS, then HTTP, for the server information (name, protocol, players...).
2. It posts its SDP offer to `POST /v1/join/{networkId}`, and receives the server's SDP answer. Game data then flows over two WebRTC data channels, `ReliableDataChannel` and `UnreliableDataChannel`.

The server signals over TCP and multiplexes the WebRTC traffic of every connection over UDP, **both on the same port** (19132 by default). Open that port for TCP and UDP in your firewall and port forwarding.

The protocol is documented in Mojang's [NetherNet HTTP Signaling guide](https://mojang.github.io/bedrock-protocol-docs/guides/nether-net-onboarding-guide/).

## Trust and the operator key

Every SDP answer carries an identity assertion signed by the operator key, saved at `identityPath` (`./nethernet.pem` by default). Clients that signal over plain HTTP pin this key the first time they join, and ask the player whether to trust it. Keep the file: if it changes, every player is asked again. Share it between servers to have them trusted as one.

To skip the prompt entirely, serve signaling over HTTPS with a certificate that is valid for the address players use, with `tlsCertificatePath` and `tlsKeyPath`.

## NAT

Clients only reach the addresses listed as candidates in the SDP answer. The local addresses of the machine are listed, and so is the address the client used to reach the signaling server, ranked first. A server behind NAT with its port forwarded therefore works without configuration. If clients reach the UDP port at another address or port than the signaling port, set `publicAddress` and `publicPort`.

## Properties

| Property | Default | Description |
| --- | --- | --- |
| `address` | `0.0.0.0` | The address signaling and WebRTC are bound to. |
| `port` | `19132` | The TCP and UDP port of the server. |
| `message` | `NetherNet Server` | The server name shown before joining. |
| `levelName` | `world` | The level name shown before joining. |
| `gameType` | `0` | The default game mode shown before joining. |
| `maxConnections` | `40` | The maximum amount of connections, including ones still negotiating. |
| `identityPath` | `./nethernet.pem` | The operator key; `null` generates a new one on every start. |
| `identityDomain` | `self` | The domain clients may show next to the operator key. |
| `tlsCertificatePath` | `null` | A PEM certificate to serve signaling over HTTPS with. |
| `tlsKeyPath` | `null` | The PEM key of the certificate. |
| `publicAddress` | `null` | The address clients reach the server at, if it differs from the one they signal to. |
| `publicPort` | `null` | The UDP port clients reach the server at, if it differs from the one they signal to. |
| `requireIdentity` | `false` | Whether to reject offers without a valid identity assertion. |
| `negotiationTimeout` | `15000` | The time a client has to open its data channels after the answer. |
| `inactivityTimeout` | `0` | The time without any message after which a connection is closed; `0` disables it. Dead peers are detected by WebRTC itself within 30 seconds, and clients can be silent for long, such as on the resource pack prompt. |

## Usage

```ts
import { Server } from "@serenityjs/nethernet";

const server = new Server({ port: 19132, message: "My Server" });

server.on("connect", (connection) => {
  // The identity the client proved in its offer, if any
  console.log(connection.identifier, connection.identity?.publicKey);
});

server.on("message", (connection, payload) => {
  // A complete message, reassembled from its segments
  connection.send(payload);
});

await server.start();
```
