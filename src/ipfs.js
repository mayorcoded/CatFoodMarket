import IpfsAPI from 'ipfs-api';

export default new IpfsAPI({
   host: 'ipfs.infura.io',
   port: 5001,
   protocol: 'https'
});
