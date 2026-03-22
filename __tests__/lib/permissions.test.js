import { describe, it, expect } from "vitest";
import { parsePermissions } from "@/lib/team";

describe("parsePermissions", () => {
  it("parses comma-separated permissions", () => {
    const perms = parsePermissions("manage_contacts,view_invoices,manage_billing");
    expect(perms).toContain("manage_contacts");
    expect(perms).toContain("view_invoices");
    expect(perms).toContain("manage_billing");
  });

  it("returns empty array for empty string", () => {
    expect(parsePermissions("")).toEqual([]);
  });

  it("returns empty array for null/undefined", () => {
    expect(parsePermissions(null)).toEqual([]);
    expect(parsePermissions(undefined)).toEqual([]);
  });

  it("trims whitespace from permissions", () => {
    const perms = parsePermissions(" manage_contacts , view_invoices ");
    expect(perms).toContain("manage_contacts");
    expect(perms).toContain("view_invoices");
  });
});
