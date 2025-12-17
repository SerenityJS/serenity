<br/>
<p align="center">
  <a href="https://github.com/SerenityJS/serenity">
    <img src="https://raw.githubusercontent.com/SerenityJS/serenity/develop/public/serenityjs-banner.png" alt="Logo">
  </a>
  <p align="center">
    <strong><font size = "5.5">Minecraft Bedrock Edition Server Software</font></strong>
    <br/>
    <br/>
    <a href="https://serenityjs.net"><strong>Explore Documentation »</strong></a>
    <br/>
    <br/>
    <a href="https://github.com/SerenityJS/serenity/issues">Report Bug</a>
    <br/>
    <br/>
    <a href="https://discord.gg/jUcC3q59zg">
      <img alt="discord" src="https://img.shields.io/discord/854092607239356457?style=for-the-badge&color=%237289DA&label=Discord&logo=discord&logoColor=white" />
    </a>
    <a href="https://github.com/SerenityJS/serenity/blob/develop/LICENSE">
      <img alt="License" src="https://img.shields.io/github/license/SerenityJS/serenity?style=for-the-badge&label=Liscense&color=hotpink" />
    </a>
    <a href="https://www.npmjs.com/package/@serenityjs/core">
      <img alt="License" src="https://img.shields.io/npm/v/@serenityjs/core?style=for-the-badge&label=NPM&logo=npm&color=red&logoColor=white" />
    </a>
    <a href="https://github.com/Mojang/bedrock-protocol-docs">
      <img alt="Protocol" src="https://img.shields.io/badge/Protocol-v898-purple?style=for-the-badge" />
    </a>
  </p>
</p>

## About The Project

Serenity is a robust and flexible Minecraft Bedrock Edition Server Software that was built from the ground up using [Rust](https://www.rust-lang.org/) and [TypeScript](https://www.typescriptlang.org/). Serenity provides a well written set of apis and tools for building Minecraft Bedrock servers, allowing developers to focus on creating unique game-play experiences, without worrying about the underlying network and protocol details. Serenity is in a active state of development, though is now approaching its first stable release. As some vanilla features are missing, we are working as hard as possible to implement these important features.

### Serenity Plugins

Serenity has a powerful plugin system that allows developers to modify and extend the functionality of the server. Plugins can be written in either TypeScript or JavaScript, and have access to the same APIs used to build Serenity itself. This means that developers can create unique gameplay experiences without having to worry about the underlying network and protocol details.

We have a public plugin repository where users can share and discover plugins made by the community. You can find the plugin repository [here](https://plugins.serenityjs.net). If you are interested in creating your own plugins, please refer to our [sample-plugin](https://github.com/SerenityJS/sample-plugin). The sample-plugin repository provides the basic structure and approach needed to create a plugin for Serenity.

## Getting Started

### Prerequisites

Before installing Serenity you first need to make sure you have the latest recommended version of [Node.js](https://nodejs.org/en/) installed on your machine. Once installed, it is recommended to fully restart your machine to allow for the full Node.js experience to be enabled. You will also need to use an integrated development environment of personal choice. [Visual Studio Code](https://code.visualstudio.com/) is the recommended environment for Serenity development.

### Installing Serenity
We provide pre-built server executable binaries for both the latest and beta releases. You can download the latest server binaries via [releases.](https://github.com/SerenityJS/serenity/releases) You can also download our beta releases, but a GitHub account is needed to access the [artifacts](https://github.com/SerenityJS/serenity/actions/workflows/release.yml) from GitHub Actions. The server binary executable is a more traditional approach that relies heavily on self or community made plugins.

We also provide an easy to use CLI installer process. The CLI scaffolds a new traditional NodeJS project with the SerenityJS packages pre-installed. This approach allows a deeper integration of Serenity into new or existing NodeJS projects. This method will work on any machine, if the machine can run NodeJS. To get started, run the following command of your choice, and follow the install prompts.

```bash
#npm
npm create serenity
#yarn
yarn create serenity
#pnpm
pnpm create serenity
```

#### Common Issues

- If the server is running, and you cannot see/join the server on your Minecraft server list, you need exempt the Minecraft client from the UWP loopback restrictions. Execute the bash command in a new terminal, while running as administrator. This applies for Windows machines only. `CheckNetIsolation.exe LoopbackExempt -a -p=S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436` You should be notified with a simple `Ok.`

### Installing Serenity Locally

Installing Serenity locally allows developers to make changes to the core of the application. Clone or download a local copy of the Serenity repository to a preferred area on your machine. You can then open the Serenity folder in your preferred integrated development environment. You will now need to run a few terminal commands before starting.

Serenity is built off of the foundation of [Yarn Workspaces](https://yarnpkg.com/features/workspaces) for quick and easy development. Before installing Serenity, you will first need to install [Yarn](https://yarnpkg.com/). To do this, please read through the [Installation Guide](https://yarnpkg.com/getting-started/install) provided by the developers of Yarn.

#### Setting Up Locally

- First you will need to initialize the folder using Yarn. Copy and run the command `yarn install`, follow any steps that may appear on screen.

- Next you are now ready to build the project, since the project is coded in TypeScript, it will first need to be compiled to JavaScript before running. To do this, run the command `yarn build`, this command will then compile the project into JavaScript.

- Finally you are now ready to start the Serenity server. First you will need to point your terminal to the devapp directory via `cd devapp`. Next run the command `yarn dev`, you should then see the server starting in the console.