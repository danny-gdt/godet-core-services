import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL,
})
  .on("error", (err) => console.log("Redis Client Error", err));

// Connect to Redis
redisClient.connect().catch(console.error);

export default redisClient; 