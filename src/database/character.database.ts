import { PrismaClient, Prisma } from "@prisma/client";
import { AccountDatabase } from "./account.database";

export class CharacterDatabase {
  _account: AccountDatabase;
  _prisma: PrismaClient;

  constructor() {
    this._account = new AccountDatabase();
    this._prisma = new PrismaClient();
  }

  public async createCharacter(name: string, mapsId: number, accountId: number): Promise<boolean> {
    if (!name || !mapsId) {
      throw "Nome e ID do mapa são obrigatórios.";
    }

    try {
      await this._prisma.characters.create({
        data: {
          name: name,
          mapsId: mapsId,
          accountsId: accountId,
        },
      });

      return true;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw "Nome do personagem já está em uso.";
        }
      }
      throw "Ocorreu um erro ao criar o personagem. Por favor, tente novamente.";
    }
  }

  public async listCharactersByAccountId(accountId: number) {
    if (!accountId) {
      return "ID da conta é obrigatório.";
    }

    const account = await this._account.findAccountById(accountId);
    if (!account) {
      return "Conta não encontrada.";
    }

    return await this._prisma.characters.findMany({
      where: { accountsId: accountId },
    });
  }

  public async deleteCharacter(characterId: number, accountId: number): Promise<boolean> {
    if (!characterId || !accountId) {
      throw "ID do personagem e ID da conta são obrigatórios.";
    }

    const account = await this._account.findAccountById(accountId);
    if (!account) {
      throw "Conta não encontrada.";
    }

    const character = await this._prisma.characters.findUnique({
      where: { id: characterId },
    });

    if (!character || character.accountsId !== accountId) {
      throw "Personagem não encontrado ou não pertence a esta conta.";
    }

    try {
      await this._prisma.characters.delete({
        where: { id: characterId },
      });

      return true;
    } catch (error: any) {
      throw "Ocorreu um erro ao apagar o personagem. Por favor, tente novamente.";
    }
  }
}
