# tama-tools
Tools for [tama.meme](https://tama.meme) for and by the Ronin memecoin community. These are typescript code snippets intended to demonstrate single interactions with the tama meme ecosystem.

### Prerequisites

To use anything in this repo, you will need the following installed via a nodejs package manager:

[ethers](https://docs.ethers.org/v6/getting-started/)
[wagmi](https://wagmi.sh/react/getting-started)

You will also need some basic knowledge of typescript and blockchain, specifically the [Ronin chain](https://docs.roninchain.com/developers/quickstart).

### Installing

You will need to setup an environment around the snippet to include it in your code. After adding the ethers v6 or higher and wagmi to your package.json, you will want to refactor the exmples to fit your app. 
For example, the wagmi signature used as an example signer assumes a react frontend. If you intend use this as a backend service, you will need to incorporate your own signer.

## Testing

All tests should be run against the [Saigon testnet](https://saigon-app.roninchain.com/) for Ronin. To understand how to connect with testnet and interact with it, see the [Ronin docs](https://support.roninchain.com/hc/en-us/articles/14035929237787-Accessing-Saigon-Testnet).

The main contract for tama meme on Saigon is: 0xfbdb66ce17543b425962be05d4d44d6f0b7f1b94


## Deployment

As a reminder, these snippets are not production ready and should not be deployed as such. These are intended to assist the community in creating your own apps. Use this to gain a better technical understanding of tama.meme.

The main contract for tama meme on Ronin is: 0xA54b0184D12349Cf65281C6F965A74828DDd9E8F

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
