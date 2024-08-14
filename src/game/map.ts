import type { Character } from "./character";
import type { Vector2 } from "./vector2";

export class Map {
  public id: number;
  public name: string;
  public mapSizeX: number;
  public mapSizeY: number;
  public characters: Character[];

  constructor(id: number, name: string, mapSizeX: number, mapSizeY: number, characters: Character[]) {
    this.id = id;
    this.name = name;
    this.mapSizeX = mapSizeX;
    this.mapSizeY = mapSizeY;
    this.characters = characters;
  }

  public addCharacter(character: Character, position: Vector2): void {
    if (this.characters.some((char) => char.id === character.id)) {
      return;
    }

    character.lastMapPosition = position;
    this.characters.push(character);

    // Notificar todos os outros jogadores sobre o novo jogador
    this._notifyAllPlayersAboutNewCharacter(character);

    // Enviar todos os jogadores atuais para o novo jogador
    this._sendAllCharactersToNewCharacter(character);
  }

  public removeCharacter(character: Character): void {
    const index = this.characters.findIndex((char) => char.id === character.id);

    if (index !== -1) {
      this.characters.splice(index, 1);
      this._handlePlayerLeave(character.id);
    }
  }

  public updateCharacterPositionToAll(character: Character, position: Vector2): void {
    if (character) {
      character.lastMapPosition = position;
      this._updateCharacterPositionToAll(character);
    }
  }

  public getCharacterPosition(character: Character): Vector2 {
    return character.lastMapPosition;
  }

  private _sendAllCharactersToNewCharacter(character: Character): void {
    // Enviar todos os jogadores atuais para o novo jogador
    this.characters.forEach((char) => {
      if (char.id !== character.id) {
        this._notifyCharacter(character, char);
      }
    });
  }

  private _notifyAllPlayersAboutNewCharacter(character: Character): void {
    // Informar todos os jogadores sobre o novo jogador
    this.characters.forEach((char) => {
      if (char.id !== character.id) {
        this._notifyCharacter(char, character);
      }
    });
  }

  private _notifyCharacter(receiver: Character, sender: Character): void {}

  private _handlePlayerLeave(characterId: number): void {
    this.characters.forEach((char) => {
      if (char.id !== characterId) {
        this._notifyCharacterLeave(char, characterId);
      }
    });
  }

  private _notifyCharacterLeave(receiver: Character, leavingCharacterId: number): void {}

  private _updateCharacterPositionToAll(character: Character): void {
    this.characters.forEach((char) => {
      if (char.id !== character.id) {
      }
    });
  }
}
