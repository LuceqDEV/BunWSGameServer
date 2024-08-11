import type { ConnectionModel } from "./connection.model";
import type { Vector2 } from "./vector2.model";

export class CharacterModel {
  constructor(
    connection: ConnectionModel,
    id: number,
    name: string,
    isAdmin: boolean,
    lastLevel: number,
    lastExp: number,
    lastCurrentMap: number,
    lasMapPosition: Vector2,
    lasDirection: number,
    inMap: boolean = false
  ) {
    this.connection = connection;
    this.id = id;
    this.name = name;
    this.isAdmin = isAdmin;
    this.lastLevel = lastLevel;
    this.lastExp = lastExp;
    this.lastCurrentMap = lastCurrentMap;
    this.lastMapPosition = lasMapPosition;
    this.lastDirection = lasDirection;
    this.inMap = inMap;
  }

  public connection: ConnectionModel;
  public id: number;
  public name: string;
  public isAdmin: boolean;
  public lastLevel: number;
  public lastExp: number;
  public lastCurrentMap: number;
  public lastMapPosition: Vector2;
  public lastDirection: number;
  public inMap?: boolean;
}
