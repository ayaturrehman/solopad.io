import { describe, it, expect } from "vitest";
import { validatePassword } from "@/lib/passwordValidation";

describe("validatePassword", () => {
  it("accepts valid passwords (8+ chars, uppercase, lowercase, number)", () => {
    expect(validatePassword("MyStr0ng!Pass")).toBeNull();
    expect(validatePassword("Password1")).toBeNull();
    expect(validatePassword("Abcdefg1")).toBeNull();
  });

  it("rejects passwords without uppercase", () => {
    expect(validatePassword("password123")).toBe("Password must contain an uppercase letter");
  });

  it("rejects passwords without lowercase", () => {
    expect(validatePassword("PASSWORD123")).toBe("Password must contain a lowercase letter");
  });

  it("rejects passwords without number", () => {
    expect(validatePassword("Passwords")).toBe("Password must contain a number");
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(validatePassword("short")).toBeTruthy();
    expect(validatePassword("1234567")).toBeTruthy();
    expect(validatePassword("abc")).toBeTruthy();
  });

  it("rejects empty/null passwords", () => {
    expect(validatePassword("")).toBeTruthy();
    expect(validatePassword(null)).toBeTruthy();
    expect(validatePassword(undefined)).toBeTruthy();
  });
});
