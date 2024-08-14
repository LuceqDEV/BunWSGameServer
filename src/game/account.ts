export class Account {
  constructor(id: number, name: string, email: string, enabled: boolean) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.enabled = enabled;
  }

  public id: number;
  public name: string;
  public email: string;
  public enabled: boolean;
}
