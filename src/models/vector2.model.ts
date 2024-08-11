export class Vector2 {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public x: number;
  public y: number;

  public copyWith(modifyObject: Partial<Vector2>): Vector2 {
    return Object.assign(Object.create(Vector2.prototype), this, modifyObject);
  }
}
