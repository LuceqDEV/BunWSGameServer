import type { Connection } from "../../../game/connection";
import { ServerHeaders } from "../headers/server.header";
import { Message } from "../message";
import type { Packet } from "../packet";

export class SignInMessage extends Message<SignInMessage> {
  constructor() {
    super(ServerHeaders.signIn);
  }

  public fromPacket(packet: Packet): SignInMessage {
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

// import { ByteBuffer } from "../../buffers/byte.buffer";
// import { Packet } from "../packet";
// import { Sender } from "../../handler/sender";
// import type { Connection } from "../../../game/connection";
// import type { MessageInterface } from "../../../interfaces/message.interface";
// import { ServerHeaders } from "../headers/server.header";
// import {
//   EmailMinLength,
//   MajorVersion,
//   MinorVersion,
//   PasswordMinLength,
//   RevisionVersion,
// } from "../../../shared/constants";
// import { AlertMessage } from "./alert";
// import { AccountDatabase } from "../../../database/account.database";
// import { Memory } from "../../../server/memory";
// import type { Slots } from "../../../shared/slots";
// import { Account } from "../../../game/account";

// export class SigInMessage implements MessageInterface {
//   public constructor(
//     private email: string = "",
//     private password: string = "",
//     private major: number = 0,
//     private minor: number = 0,
//     private revision: number = 0
//   ) {}

//   fromPacket(packet: Packet): SigInMessage {
//     const byteBuffer = new ByteBuffer(packet.content);
//     const email: string = byteBuffer.getString();
//     const password: string = byteBuffer.getString();
//     const major: number = byteBuffer.getInt16();
//     const minor: number = byteBuffer.getInt16();
//     const revision: number = byteBuffer.getInt16();

//     return new SigInMessage(email, password, major, minor, revision);
//   }

//   toPacket(): Packet {
//     const byteBuffer = new ByteBuffer();
//     byteBuffer.putString(this.email);
//     byteBuffer.putString(this.password);
//     byteBuffer.putInt16(this.major);
//     byteBuffer.putInt16(this.minor);
//     byteBuffer.putInt16(this.revision);

//     return new Packet(ServerHeaders.signIn, byteBuffer.getBuffer());
//   }

//   send(connection: Connection): void {
//     Sender.dataToAllExcept(connection, this.toPacket());
//   }

//   async handle(connection: Connection, packet: Packet): Promise<void> {
//     const signInPacket = this.fromPacket(packet);

//     if (!this._validateVersion(signInPacket, connection)) return;
//     if (!this._validateCredentials(signInPacket, connection)) return;

//     const accountDatabase: AccountDatabase = new AccountDatabase();
//     const connections: Slots<Connection> = Memory.get().clientConnections;

//     try {
//       const result = await accountDatabase.findAccountByEmail(signInPacket.email);

//       if (!this._validateAccount(result, connection)) return;
//       if (this._isAccountLogged(signInPacket.email, connections)) return;

//       const existingConnection = connections.get(connection.id);

//       if (existingConnection) {
//         existingConnection.account = new Account(result!.id, result!.name, result!.email, result!.enabled);
//         existingConnection.logged = true;
//       }

//       signInPacket.send(connection);
//     } catch (error) {
//       new AlertMessage("Ops! o email informado não é válido!").send(connection);
//       return;
//     }
//   }

//   private _validateVersion(packet: SigInMessage, connection: Connection): boolean {
//     if (packet.major !== MajorVersion || packet.minor !== MinorVersion || packet.revision !== RevisionVersion) {
//       new AlertMessage("Ops! o cliente está desatualizado!").send(connection);
//       return false;
//     }
//     return true;
//   }

//   private _validateCredentials(packet: SigInMessage, connection: Connection): boolean {
//     if (packet.email.length < EmailMinLength) {
//       new AlertMessage("Ops! o email informado é muito pequeno!").send(connection);
//       return false;
//     }

//     if (packet.password.length < PasswordMinLength) {
//       new AlertMessage("Ops! a senha informada é muito pequena!").send(connection);
//       return false;
//     }

//     return true;
//   }

//   private _validateAccount(result: any, connection: Connection): boolean {
//     if (result == null) {
//       new AlertMessage("Ops! o email informado não pertence a um usuário cadastrado!").send(connection);
//       return false;
//     }

//     if (!result.enabled) {
//       new AlertMessage("Ops! a sua conta foi desativada, entre em contato com o suporte para mais detalhes.").send(
//         connection
//       );
//       return false;
//     }

//     return true;
//   }

//   private _isAccountLogged(email: string, connections: Slots<Connection>): boolean {
//     for (const conn of connections.getFilledSlotsAsList()) {
//       if (conn?.logged && conn.account?.email === email) {
//         new AlertMessage("Ops! a sua conta já está conectada!").send(conn);

//         conn.disconnect();
//         return true;
//       }
//     }
//     return false;
//   }
// }
