# CatFoods Market

CatFoods project is an online marketplace that operates on the blockchain.

### Overview

The project theme is dry or wet cat foods selling. The cat foods posted by the store owners can be purchased by shoppers. The cat foods are listed on home page. If shoppers purchased one of them, they can see purchased goods by them pressing `Purchased Cat Foods` link on right top of the page. The cat food list can be filtered by store owner, price, type (dry, wet) etc, but filtering is not implemented yet.

### Features

- Multiple admins
- Store Owners can manage their goods on a single page.
- Stoppers can list own purchased goods.
- All user roles can sopping on CatFoods.
- Contract Base Authentication
- CatFoods can work without Metamask Extension in read only mode (without any user role etc.). In this mode, HttpProvider is used as provider.
- If metamask extension is not installed or is locked an error message is shown to visitors.
- Implemented Circuit Breaker / Emergency Stop
- Implemented Kill / Destruct Contract

### The Processes

There is an owner of marketplace called as Super Admin. Super Admin is created while the marketplace is creating.
Super Admin can add users who are Admin. A user who is admin can manage Store Owners. Store Owners can add their goods to sell in CatFoods.
When shoppers buy a good of one of Store Owners, the money transfer to CatFoods from shoppers and the money accumulates for the store owner's account. Store owners can withdraw their balances when they want.

### User Stories
An administrator opens the web app. This administrator is called Super Admin or Owner. The contract has been publish with its account address.
CatFoods reads the address and identifies that the user is Super Admin / Owner, showing them Super Admin only functions, such as managing store
owners and admins, enabling emergency stop mode, destructing contract.
The owner adds an address to the list of approved admins, so if the admin of that address logs into the app, they have access to the admin functions, such as adding a store owner.
The owner or An admin add an address to the list of approved store owners, so if the owner of that address logs into the app, they have access to the store owner functions.

An approved store owner logs into the app. The web app recognizes their address and identifies them as a store owner.
They are shown the store owner functions. They can add/remove products to their storefronts or change any of the products’ prices, quantities.
They can also withdraw any funds that the store has collected from sales.

A shopper logs into the app. The web app does not recognize their address so they are shown the generic shopper application.
From the main page they can browse all of the products that have been created in the marketplace.
They can see a list of products offered by the store, including their price, quantity and photo.
Shoppers can purchase a product, which will debit their account and send it to the store. The quantity of the item in the store’s inventory will be reduced
by the appropriate amount. Shoppers can view all purchased product by them on Purchased Product Page.

All user types can purchase a product (owner, admins, store owners).

[click here](documentation/screenshots.md) to see some screenshots.


## Technical Overview

The main goal in this project is creating fully decentralized application include product text, image etc. CatFoods is design a single page javascript application and it works any http server can serve static html, js files. It is started from zero using `truffle init` command.

### Used Technologies and software packages

- Truffle is used to test, compile, migrate the smart contracts.
- Webpack is used bundling js files and create local development server.
- React 16.4.2, RectDom
- Redux
- Semantic Ui React is used to create web elements are compatible with react.
- Web3 1.0.0-beta.35
- IPFS is used to store images of products. 
- Some openzeppelin-solidity packages are user. lifecycle/Destructible, lifecycle/Pausable, ownership/Ownable
- Ganache Desktop (ganache-cli will be used when the project is done.)
- Solidity Coverage is used to generate code coverage report (https://github.com/sc-forks/solidity-coverage )
- Solhint is used to check syntax suggestions

## Project setup

The project has been developed on macOs High Sierra 10.13.5

- Nodejs version: v8.11.3
- Npm version: 6.4.0
- Ganache CLI version: v6.1.8
- Truffle version: v4.1.14

## For Production

If you want to develop this project, please skip to the next.

Create a folder and run this command inside it.

    git clone https://github.com/mayorcoded/CatFoodMartket.git.

To install production dependencies

    npm install --only=production

To serve project

    npm run start

Project will be available your server on `3000 port. To see how to use a different port please check `server.js` file. Make sure your 3000 port is available.

### For Development

To install truffle

    npm install -g truffle

To install ganache cli. It should be ask `sudo permission

    npm install -g ganache-cli

To install all dependencies

    yarn install

To start ganache cli then open a new console tab and navigate to where the project is. With -m you can use your mneonic, this is suggested because it allows to easy import accounts on Metamask.

    ganache-cli --host "0.0.0.0" -p 8545 -m "your mneonic words"

Please run truffle test to see if everything is ok.

    truffle test

To compile and migrate contracts. Make sure build/contracts folder is empty. (in some cases truffle migrate --reset --compile-all is not work.)

    truffle compile

    truffle migrate

To serve project.

    npm run dev

You are be able to see the project on 3000 port. If you have a specific settings, please set them in `webpack.config.js -> devServer`


### Known Bugs

- A store owner can only deleted by owner. Because products is belongs to store owner. there must be a valid reason for deletion
- Some events are using in CadFoods should be organized. Some event might be affect another website visitor, especially in listings.

### Planed Features
- Upgradeable contract: Upgradable contracts are so important for production. Also developing the contracts aren't upgradable is hard to manage.
You have to add your data again and again... This consumes your developing time and your life energy. Logical changes in smart contracts won't affect your data if these data are located in safe area.
- Added purchasedDate to purchased product. Showing purchased date on purchased product page would be nice.
- In emergency stop mode (paused mode) a user who has any role can view web ui normally, but some functions have to be disable also web ui. Buy button, withdraw button etc.