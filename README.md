# tama-tools
Tools for [tama.meme](https://tama.meme) for and by the Ronin memecoin community. These are typescript micro-apps intended to demonstrate single interactions with the tama meme ecosystem. Each micro-app will have its own getting started guide.

### Prerequisites

To use any of the apps in this repo, you will need the following installed via a nodejs package manager:

[ethers6](https://docs.ethers.org/v6/getting-started/)
[viem](https://viem.sh/docs/getting-started.html)
[wagmi](https://wagmi.sh/react/getting-started)

You will also need some basic knowledge of blockchain, and specifically, the [Ronin chain](https://docs.roninchain.com/developers/quickstart).

### Installing

These micro-apps function as a yarn mono-repo. You will need yarn installed in order for the apps to work as intended:
```
npm install --global yarn
```
If you don't want to use npm, follow one of yarn's [alternative methods](https://classic.yarnpkg.com/lang/en/docs/install).
As this is intended to function as a monorepo, all commands are intended to be run from the root directory of the repo. Installing the dependencies for your chosen app: 

```
yarn workspace create-memecoin install
```

Follow up by running the app in dev mode to quickly interact:

```
yarn workspace create-memecoin run-dev
```

See the Getting Started Guide the app to understand particular commands.

## Testing

All tests should be run against the [Saigon testnet](https://saigon-app.roninchain.com/) for Ronin. To understand how to connect with testnet and interact with it, see the [Ronin docs](https://support.roninchain.com/hc/en-us/articles/14035929237787-Accessing-Saigon-Testnet).


## Deployment

As a reminder, these micro-apps are not production ready and should not be deployed as such. These are intended to assit the community in creating your own apps using this or similar code and to gain a better technical understanding of tama.meme.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
