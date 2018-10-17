import TruffleContract from 'truffle-contract';
import Marketplace from "../build/contracts/Marketplace.json";
import web3 from "./web3";

const marketplace = TruffleContract(Marketplace);
marketplace.setProvider(web3.currentProvider);

if (typeof marketplace.currentProvider.sendAsync !== "function") {
    marketplace.currentProvider.sendAsync = function() {
        return marketplace.currentProvider.send.apply(
            marketplace.currentProvider, arguments
        );
    };
}

export default marketplace;
