import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatRupiah, formatDate, formatTime, cn } from "@/lib/utils";

describe("frontend utils unit tests", () => {
  it("formatRupiah formats numbers and numeric strings as IDR currency", () => {
    assert.match(formatRupiah(1500000), /^Rp\s*1\.500\.000$/);
    assert.match(formatRupiah("950000"), /^Rp\s*950\.000$/);
    assert.match(formatRupiah("invalid"), /^Rp\s*0$/);
  });

  it("formatDate formats ISO dates in Indonesian and falls back to hyphen when empty", () => {
    assert.equal(formatDate(null), "-");
    assert.equal(formatDate(""), "-");
    const formatted = formatDate("2026-11-12T05:00:00.000Z");
    assert.match(formatted, /2026/);
    assert.match(formatted, /November/);
  });

  it("formatTime formats time strings and falls back to hyphen when empty", () => {
    assert.equal(formatTime(undefined), "-");
    assert.equal(formatTime(""), "-");
    const formatted = formatTime("2026-11-12T07:30:00.000Z");
    assert.match(formatted, /^\d{2}[.:]\d{2}$/);
  });

  it("cn joins truthy class names and skips falsy values", () => {
    assert.equal(cn("px-4", false && "hidden", null, undefined, "", "py-2"), "px-4 py-2");
    assert.equal(cn(), "");
  });
});
