import { AccountUtils } from "../../../../utils/account.utils";
import { EmailUtils } from "../../../../utils/email.utils";
import { VersionUtils } from "../../../../utils/version.utils";
import { AccountDatabase } from "../../../database/account.database";
import { Account } from "../../../game/account";
import type { Connection } from "../../../game/connection";
import { Memory } from "../../../server/memory";
import type { Slots } from "../../../shared/slots";
import { ByteBuffer } from "../../buffers/byte.buffer";
import { Sender } from "../../handler/sender";
import { ServerHeaders } from "../headers/server.header";
import { Message } from "../message";
import { Packet } from "../packet";
import { AlertMessage } from "./alert";

export class AccessAccountMessage extends Message<AccessAccountMessage> {
  private email: string;
  private password: string;
  private major: number;
  private minor: number;
  private revision: number;

  constructor() {
    super(ServerHeaders.AuthenticationSuccess);
    this.email = "";
    this.password = "";
    this.major = 0;
    this.minor = 0;
    this.revision = 0;
  }

  public fromPacket(packet: Packet): AccessAccountMessage {
    const byteBuffer = new ByteBuffer(packet.content);

    const message: AccessAccountMessage = new AccessAccountMessage();
    message.email = byteBuffer.getString();
    message.password = byteBuffer.getString();
    message.major = byteBuffer.getInt16();
    message.minor = byteBuffer.getInt16();
    message.revision = byteBuffer.getInt16();

    return message;
  }

  public toPacket(): Packet {
    const id = this.getPacketId();
    const buffer = new ByteBuffer().getBuffer();

    return new Packet(id, buffer);
  }

  public async handle(connection: Connection, packet: Packet): Promise<void> {
    const accessPacket = this.fromPacket(packet);
    const accountDatabase: AccountDatabase = new AccountDatabase();
    const clientConnections: Slots<Connection> = Memory.get().clientConnections;

    if (VersionUtils.validate(accessPacket.major, accessPacket.minor, accessPacket.revision)) {
      new AlertMessage("Ops! o cliente está desatualizado!").send(connection);

      return;
    }

    if (EmailUtils.isInvalidEmail(accessPacket.email)) {
      new AlertMessage("Ops! o email informando é inválido.").send(connection);

      return;
    }

    if (AccountUtils.isEmailShort(accessPacket.email)) {
      new AlertMessage("Ops! o email informado é muito pequeno!").send(connection);

      return;
    }

    if (AccountUtils.isPasswordShort(accessPacket.password)) {
      new AlertMessage("Ops! a senha informada é muito pequena!").send(connection);

      return;
    }

    try {
      const result = await accountDatabase.findAccountByEmail(accessPacket.email);

      if (result == null) {
        new AlertMessage("Ops! o email informado não pertence a um usuário cadastrado!").send(connection);

        return;
      }

      if (AccountUtils.isAccountDisabled(result!.enabled)) {
        new AlertMessage("Ops! a sua conta foi desativada, entre em contato com o suporte para mais detalhes.").send(
          connection
        );

        return;
      }

      var isLogged = this.isAccountLogged(accessPacket.email, clientConnections);

      if (isLogged) {
        new AlertMessage("Ops! a sua conta já estava conectada! Considere trocar sua senha...").send(connection);

        return;
      }

      const account: Connection | undefined = clientConnections.get(connection.id);

      if (account == undefined) {
        new AlertMessage(
          "Ops, não foi possível continuar! se o problema persistir entre em contato com o suporte para mais detalhes"
        ).send(connection);

        return;
      }

      account.account = new Account(result.id, result.name, result.email, result.enabled);
      account.logged = true;

      new AlertMessage("Acessando sua conta...").send(connection);

      accessPacket.send(connection);
    } catch (error) {
      new AlertMessage("Ops! o email informado não é válido!").send(connection);

      return;
    }
  }

  protected sendPacket(connection: Connection, packet: Packet): void {
    Sender.dataTo(connection, packet);
  }

  private isAccountLogged(email: string, connections: Slots<Connection>): boolean {
    for (const connection of connections.getFilledSlots()) {
      const currentConnection = connections.get(connection);

      if (currentConnection?.logged && currentConnection.account?.email === email) {
        new AlertMessage("Ops! alguém tentou acessar sua conta em outro dispositivo...", true).send(currentConnection);
        return true;
      }
    }

    return false;
  }
}

export class RegisterAccountMessage extends Message<RegisterAccountMessage> {
  private name: string = "";
  private email: string = "";
  private password: string = "";
  private confirmPassword: string = "";
  private major: number;
  private minor: number;
  private revision: number;

  constructor() {
    super(ServerHeaders.RegistrationSuccess);
    this.name = "";
    this.email = "";
    this.password = "";
    this.confirmPassword = "";
    this.major = 0;
    this.minor = 0;
    this.revision = 0;
  }

  public fromPacket(packet: Packet): RegisterAccountMessage {
    const byteBuffer = new ByteBuffer(packet.content);

    const message = new RegisterAccountMessage();
    message.name = byteBuffer.getString();
    message.email = byteBuffer.getString();
    message.password = byteBuffer.getString();
    message.confirmPassword = byteBuffer.getString();

    return message;
  }

  public toPacket(): Packet {
    const id = this.getPacketId();
    const buffer = new ByteBuffer().getBuffer();

    return new Packet(id, buffer);
  }

  public async handle(connection: Connection, packet: Packet): Promise<void> {
    const createPacket = this.fromPacket(packet);
    const accountDatabase = new AccountDatabase();

    if (VersionUtils.validate(createPacket.major, createPacket.minor, createPacket.revision)) {
      new AlertMessage("Ops! o cliente está desatualizado!").send(connection);

      return;
    }

    if (EmailUtils.isInvalidEmail(createPacket.email)) {
      new AlertMessage("Ops! o email informando é inválido.").send(connection);

      return;
    }

    if (AccountUtils.isEmailShort(createPacket.email)) {
      new AlertMessage("Ops! o email informado é muito pequeno!").send(connection);

      return;
    }

    if (AccountUtils.isPasswordShort(createPacket.password)) {
      new AlertMessage("Senha deve ter pelo menos 6 caracteres.").send(connection);
      return;
    }

    if (createPacket.password !== createPacket.confirmPassword) {
      new AlertMessage("As senhas não correspondem.").send(connection);
      return;
    }

    try {
      await accountDatabase.createAccount(
        createPacket.name,
        createPacket.email,
        createPacket.password,
        createPacket.confirmPassword
      );

      new AlertMessage("Conta criada com sucesso!").send(connection);

      createPacket.send(connection);
    } catch (error: any) {
      new AlertMessage(error).send(connection);
    }
  }

  protected sendPacket(connection: Connection, packet: Packet): void {
    Sender.dataTo(connection, packet);
  }
}

export class DeleteAccountMessage extends Message<DeleteAccountMessage> {
  constructor() {
    super(ServerHeaders.AccountDeleted);
  }

  public fromPacket(packet: Packet): DeleteAccountMessage {
    throw new Error("Method not implemented.");
  }
  public toPacket(): Packet {
    throw new Error("Method not implemented.");
  }
  public handle(connection: Connection, packet: Packet): void {
    throw new Error("Method not implemented.");
  }
  protected sendPacket(connection: Connection, packet: Packet): void {
    throw new Error("Method not implemented.");
  }
}

export class RecoverAccountMessage extends Message<RecoverAccountMessage> {
  constructor() {
    super(ServerHeaders.AccountRecovery);
  }

  public fromPacket(packet: Packet): RecoverAccountMessage {
    throw new Error("Method not implemented.");
  }
  public toPacket(): Packet {
    throw new Error("Method not implemented.");
  }
  public handle(connection: Connection, packet: Packet): void {
    throw new Error("Method not implemented.");
  }
  protected sendPacket(connection: Connection, packet: Packet): void {
    throw new Error("Method not implemented.");
  }
}
