import { Setup } from "./src/server/setup";

async function main() {
    const setup: Setup = new Setup()

    await setup.start();
}

main()