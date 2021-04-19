const _ = require('lodash');
const uuidv4 = require('uuidv4')
const { PeerRPCClient }  = require('grenache-nodejs-http');
const Link = require('grenache-nodejs-link');
const orderBook = require("./orderbook");

//  TODO: Update grape port
const GRAPE_PORT = 30001;

const link = new Link({
    grape: `http://127.0.0.1:${GRAPE_PORT}`
})

link.start();

const peer = new PeerRPCClient(link, {})
peer.init();


//  initialize order book
orderBook.init({

    //  every client has a unique id - Could be user id
    id: uuidv4(),

    //  link object
    link,

    //  peer object
    peer,

    publishInterval: 1450,

    syncInterval: 1800
})

/**
 * MAIN
 * Clients will call this method to submit
 * @param order
 */
function submitOrder(order) {

    //  add order to local copy of order book
    orderBook.addOrder(order);

}
