import type { ConnectionModel } from "../models/connection.model";
import { MaxPlayers } from "../shared/constants";
import { Slots } from "../shared/slots";

export class Memory {
    private static _instance: Memory;

    public clientConnections: Slots<ConnectionModel>;

    private constructor() {
        this.clientConnections = new Slots<ConnectionModel>(MaxPlayers);
    }

    public static get(): Memory {
        if (!Memory._instance) {
            Memory._instance = new Memory();
        }
        return Memory._instance;
    }
}
