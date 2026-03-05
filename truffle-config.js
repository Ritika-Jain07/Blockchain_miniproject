module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,       // Ganache
      network_id: "*"   // any network
    }
  },
  compilers: {
    solc: {
      version: "0.8.17"
    }
  }
};