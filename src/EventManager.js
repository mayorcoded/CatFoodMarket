/**
 *
 */
class EventManager {

    static instance;

    constructor(){
        if(EventManager.instance){
            return EventManager.instance;
        }
        EventManager.instance = this;
    }

    eventsLatestBlock = {
        // "SomeEvent": 3434
    };

    updateBlock (eventName, blockNumber) {
        this.eventsLatestBlock[eventName] = blockNumber
    }

    isCurrentEvent (eventName, blockNumber) {
        if(typeof(this.eventsLatestBlock[eventName]) === "undefined") {
            this.updateBlock(eventName, blockNumber);
            return false;
        }

        let lastBlockNumber = this.eventsLatestBlock[eventName];

        if(lastBlockNumber !== blockNumber) {
            this.updateBlock(eventName, blockNumber);
            return true;
        }

        this.updateBlock(eventName, blockNumber);
        return false;
    }

    getEvent() {
        return this.eventsLatestBlock;
    }
}

export default new EventManager;