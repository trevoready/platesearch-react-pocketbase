import PocketBase from "pocketbase";
const client = new PocketBase('https://api.platesearch.ca');
console.log(client);
// Export the client as a module
export default client;