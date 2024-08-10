import { Setup } from "./src/server/setup";

async function main() {
  await new Setup().start();
}

main();
