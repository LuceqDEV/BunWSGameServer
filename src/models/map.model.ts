import type { CharacterModel } from "./character.model";
import type { Vector2 } from "./vector2.model";

export class MapModel {
  public id: number;
  public name: string;
  public mapSizeX: number;
  public mapSizeY: number;
  public characters: CharacterModel[];

  constructor(id: number, name: string, mapSizeX: number, mapSizeY: number, characters: CharacterModel[]) {
    this.id = id;
    this.name = name;
    this.mapSizeX = mapSizeX;
    this.mapSizeY = mapSizeY;
    this.characters = characters;
  }

  public addCharacter(character: CharacterModel, position: Vector2): void {
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

  public removeCharacter(character: CharacterModel): void {
    const index = this.characters.findIndex((char) => char.id === character.id);

    if (index !== -1) {
      this.characters.splice(index, 1);
      this._handlePlayerLeave(character.id);
    }
  }

  public updateCharacterPositionToAll(character: CharacterModel, position: Vector2): void {
    if (character) {
      character.lastMapPosition = position;
      this._updateCharacterPositionToAll(character);
    }
  }

  public getCharacterPosition(character: CharacterModel): Vector2 {
    return character.lastMapPosition;
  }

  private _sendAllCharactersToNewCharacter(character: CharacterModel): void {
    // Enviar todos os jogadores atuais para o novo jogador
    this.characters.forEach((char) => {
      if (char.id !== character.id) {
        this._notifyCharacter(character, char);
      }
    });
  }

  private _notifyAllPlayersAboutNewCharacter(character: CharacterModel): void {
    // Informar todos os jogadores sobre o novo jogador
    this.characters.forEach((char) => {
      if (char.id !== character.id) {
        this._notifyCharacter(char, character);
      }
    });
  }

  private _notifyCharacter(receiver: CharacterModel, sender: CharacterModel): void {}

  private _handlePlayerLeave(characterId: number): void {
    this.characters.forEach((char) => {
      if (char.id !== characterId) {
        this._notifyCharacterLeave(char, characterId);
      }
    });
  }

  private _notifyCharacterLeave(receiver: CharacterModel, leavingCharacterId: number): void {}

  private _updateCharacterPositionToAll(character: CharacterModel): void {
    this.characters.forEach((char) => {
      if (char.id !== character.id) {
      }
    });
  }
}
