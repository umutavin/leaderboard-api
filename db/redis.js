const redis = require('redis');

class Redis {
  constructor() {
    this.connected = false
    this.client = null
  }

  getConnection() {
    if (this.connected) return this.client
    else {
      this.client = redis.createClient(process.env.REDIS_URI || "redis://localhost:6379");
      this.client.on('error', function (err) {
        console.log('Error on redis connection: ', err)
      });
      this.client.on("connect", function () {
        console.log("Redis is connected!");
      });
      this.connected = true;
      return this.client
    }

  }
}
// This will be a singleton class. After first connection npm will cache this object for whole runtime.
// Every time you will call this getConnection() you will get the same connection back
module.exports = new Redis()