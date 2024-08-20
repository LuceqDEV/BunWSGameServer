import { MAJOR_VERSION, MINOR_VERSION, REVISION_VERSION } from "../src/shared/constants";

export class VersionUtils {
  public static validate(major: number, minor: number, revision: number): boolean {
    if (major !== MAJOR_VERSION || minor !== MINOR_VERSION || revision !== REVISION_VERSION) {
      return true;
    }

    return false;
  }
}
