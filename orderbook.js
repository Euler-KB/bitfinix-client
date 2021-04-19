const constants = require("contants");

/**
 * This is the state of every client at any point in time
 * @type []
 */
let state = [];

//
let localState = {

  //  Client ID. This is unique for every client
  id: '',

  //  orders
  orders: [],

  //  Index to help keep track of unsynchronized orders
  lastSyncIndex: 0,
};

let _options = null;

exports.init = (opts) => {

  if(!opts.hasOwnProperty('peer')){
    throw new Error('Peer object required to work');
  }

  if(!opts.hasOwnProperty('link')){
    throw new Error('Link required to work');
  }

  if(!opts.hasOwnProperty('id'))
      throw new Error('Please specify client ID');

  const _opts =  {
    publishInterval: 50000,
    syncInterval: 1200,
    ...opts,
  };

  //  keep link reference
  _options = opts;

  //  keep id in client state
  localState.id = _options.id;

  //  publish state to service
  setInterval(() => {

    const peer = _options.peer;
    let orders = [];
    if(localState.orders.length >= localState.lastSyncIndex){
        orders = localState.orders.slice(localState.lastSyncIndex, localState.orders.length );
    }

    if(orders.length > 0){

      const data = {
        ...localState,
        orders
      };

      const info = {
        type: constants.ACTION_TYPES.SYNC_STATE,
        data
      };

      //  synchronize state
      peer.request(constants.SERVICE_NAME, info, { timeout: 10000 }, (err,data) => {

        if(err){
          console.error(err);
          return;
        }

        //  increment last sync index
        localState.lastSyncIndex += orders.length;
      });

    }

  }, _opts.publishInterval );

  //  get entire orderbook/chain
  setInterval(() => {

    const info = {
      type: constants.ACTION_TYPES.QUERY_CHAIN
    };

    //
    link.request(constants.SERVICE_NAME, info,  { timeout : 10000 } , (err,data) => {
      if(err){
        console.error(err);
        return;
      }

      //  keep global chain
      state = data;
    });

  }, _opts.syncInterval);
};

exports.addOrder = (order) => {
  localState.orders.push(order);
};
