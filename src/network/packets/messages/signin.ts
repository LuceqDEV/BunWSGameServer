import { AccountDatabase } from "../../../database/account.database";
import { Account } from "../../../game/account";
import type { Connection } from "../../../game/connection";
import { Memory } from "../../../server/memory";
import {
  EMAIL_MIN_LENGTH,
  MAJOR_VERSION,
  MINOR_VERSION,
  PASSWORD_MIN_LENGTH,
  REVISION_VERSION,
} from "../../../shared/constants";
import type { Slots } from "../../../shared/slots";
import { ByteBuffer } from "../../buffers/byte.buffer";
import { Sender } from "../../handler/sender";
import { ServerHeaders } from "../headers/server.header";
import { Message } from "../message";
import { Packet } from "../packet";
import { AlertMessage } from "./alert";

export class SignInMessage extends Message<SignInMessage> {
  private email: string;
  private password: string;
  private major: number;
  private minor: number;
  private revision: number;

  constructor(email: string = "", password: string = "", major: number = 0, minor: number = 0, revision: number = 0) {
    super(ServerHeaders.signIn);
    this.email = email;
    this.password = password;
    this.major = major;
    this.minor = minor;
    this.revision = revision;
  }

  public fromPacket(packet: Packet): SignInMessage {
    const byteBuffer = new ByteBuffer(packet.content);

    const email: string = byteBuffer.getString();
    const password: string = byteBuffer.getString();
    const major: number = byteBuffer.getInt16();
    const minor: number = byteBuffer.getInt16();
    const revision: number = byteBuffer.getInt16();

    return new SignInMessage(email, password, major, minor, revision);
  }

  public toPacket(): Packet {
    const byteBuffer = new ByteBuffer();

    return new Packet(this.getPacketId(), byteBuffer.getBuffer());
  }

  public async handle(connection: Connection, packet: Packet): Promise<void> {
    const signInPacket = this.fromPacket(packet);

    if (!this.validateVersion(signInPacket, connection)) return;
    if (!this.validateCredentials(signInPacket, connection)) return;

    const accountDatabase: AccountDatabase = new AccountDatabase();
    const connections: Slots<Connection> = Memory.get().clientConnections;

    try {
      const result = await accountDatabase.findAccountByEmail(signInPacket.email);

      if (!this.validateAccount(result, connection)) return;

      var logged = this.isAccountLogged(signInPacket.email, connections, connection);

      if (logged) {
        return;
      }

      const existingConnection = connections.get(connection.id);

      if (existingConnection) {
        existingConnection.account = new Account(result!.id, result!.name, result!.email, result!.enabled);
        existingConnection.logged = true;
      }

      new AlertMessage("Acessando sua conta...").send(connection);

      signInPacket.send(connection);
    } catch (error) {
      new AlertMessage("Ops! o email informado não é válido!").send(connection);
      return;
    }
  }

  protected sendPacket(connection: Connection, packet: Packet): void {
    Sender.dataTo(connection, this.toPacket());
  }

  private validateVersion(packet: SignInMessage, connection: Connection): boolean {
    if (packet.major !== MAJOR_VERSION || packet.minor !== MINOR_VERSION || packet.revision !== REVISION_VERSION) {
      new AlertMessage("Ops! o cliente está desatualizado!").send(connection);
      return false;
    }
    return true;
  }

  private validateCredentials(packet: SignInMessage, connection: Connection): boolean {
    if (packet.email.length < EMAIL_MIN_LENGTH) {
      new AlertMessage("Ops! o email informado é muito pequeno!").send(connection);
      return false;
    }

    if (packet.password.length < PASSWORD_MIN_LENGTH) {
      new AlertMessage("Ops! a senha informada é muito pequena!").send(connection);
      return false;
    }

    return true;
  }

  private validateAccount(result: any, connection: Connection): boolean {
    if (result == null) {
      new AlertMessage("Ops! o email informado não pertence a um usuário cadastrado!").send(connection);
      return false;
    }

    if (!result.enabled) {
      new AlertMessage("Ops! a sua conta foi desativada, entre em contato com o suporte para mais detalhes.").send(
        connection
      );
      return false;
    }

    return true;
  }

  private isAccountLogged(email: string, connections: Slots<Connection>, newConnection: Connection): boolean {
    for (const connection of connections.getFilledSlotsAsList()) {
      if (connection?.logged && connection.account?.email === email) {
        new AlertMessage("Ops! alguém tentou acessar sua conta em outro dispositivo...", true).send(connection);
        new AlertMessage("Ops! a sua conta já estava conectada! Considere trocar sua senha...").send(newConnection);

        return true;
      }
    }

    return false;
  }
}
