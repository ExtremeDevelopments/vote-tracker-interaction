import { RESTManager } from "../structures/managers/REST";

const rest = new RESTManager(2312)
rest.start()
console.log(`REST API connected & binded to port ${rest.port}`)