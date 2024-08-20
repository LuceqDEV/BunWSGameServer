import { EMAIL_MIN_LENGTH, PASSWORD_MIN_LENGTH } from "../src/shared/constants";

export class AccountUtils {
  public static isEmailShort(email: string): boolean {
    return email.length < EMAIL_MIN_LENGTH;
  }

  public static isPasswordShort(password: string): boolean {
    return password.length < PASSWORD_MIN_LENGTH;
  }

  public static isNameValid(name: string): boolean {
    return name.length < PASSWORD_MIN_LENGTH;
  }

  public static isAccountDisabled(isEnabled: boolean): boolean {
    return !isEnabled;
  }
}
