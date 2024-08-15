import { PrismaClient, Prisma } from "@prisma/client";
import { Password } from "../shared/password";
import { EmailUtils } from "../../utils/email.utils";

export class AccountDatabase {
  prisma: PrismaClient;
  password: Password;

  constructor() {
    this.prisma = new PrismaClient();
    this.password = new Password();
  }

  public async findAccountById(id: number) {
    return await this.prisma.accounts.findUnique({
      where: { id: id },
    });
  }

  public async findAccountByEmail(email: string) {
    if (!EmailUtils.isValidEmail(email)) {
      throw "Ops! o email informado não é válido!";
    }

    return await this.prisma.accounts.findUnique({
      where: { email: email },
    });
  }

  public async createAccount(name: string, email: string, password: string, confirmPassword: string) {
    if (!name || !email || !password) {
      throw "Nome de usuário, email e senha são obrigatórios.";
    }

    if (password !== confirmPassword) {
      throw "As senhas não correspondem.";
    }

    if (password.length < 6) {
      throw "A senha deve ter pelo menos 6 caracteres.";
    }

    const hashedPassword = await this.password.hashPassword(password);

    try {
      await this.prisma.accounts.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
        },
      });

      return true;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw "Email já está em uso.";
        }
      }
      throw `Erro ao criar conta: ${error.message}`;
    }
  }

  public async accessAccount(email: string, password: string) {
    if (!email || !password) {
      throw "Email e senha são obrigatórios.";
    }

    const account = await this.findAccountByEmail(email);

    if (!account) {
      throw "Conta não encontrada.";
    }

    const passwordMatch = await this.password.verifyPassword(password, account.password!);

    if (!passwordMatch) {
      throw "Senha incorreta.";
    }

    return true;
  }
}
