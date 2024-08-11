import { PrismaClient, Prisma } from "@prisma/client";

export class MapDatabase {
  _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient();
  }

  public async createMap(name: string, mapSizeX: number = 1, mapSizeY: number = 1): Promise<boolean> {
    if (!name) {
      throw "Nome do mapa é obrigatório.";
    }

    try {
      await this._prisma.maps.create({
        data: {
          name: name,
          mapSizeX: mapSizeX,
          mapSizeY: mapSizeY,
        },
      });

      return true;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw "Nome do mapa já está em uso.";
        }
      }
      throw "Ocorreu um erro ao criar o mapa. Por favor, tente novamente.";
    }
  }

  public async listAllMaps() {
    try {
      return await this._prisma.maps.findMany();
    } catch (error: any) {
      throw "Ocorreu um erro ao listar os mapas. Por favor, tente novamente.";
    }
  }

  public async updateMap(id: number, name?: string, mapSizeX?: number, mapSizeY?: number): Promise<boolean> {
    if (!id) {
      throw "ID do mapa é obrigatório.";
    }

    try {
      await this._prisma.maps.update({
        where: { id: id },
        data: {
          name: name,
          mapSizeX: mapSizeX,
          mapSizeY: mapSizeY,
        },
      });

      return true;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw "Mapa não encontrado.";
        }
      }
      throw "Ocorreu um erro ao atualizar o mapa. Por favor, tente novamente.";
    }
  }

  public async deleteMap(id: number): Promise<boolean> {
    if (!id) {
      throw "ID do mapa é obrigatório.";
    }

    try {
      await this._prisma.maps.delete({
        where: { id: id },
      });

      return true;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw "Mapa não encontrado.";
        }
      }
      throw "Ocorreu um erro ao apagar o mapa. Por favor, tente novamente.";
    }
  }
}
