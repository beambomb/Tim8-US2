import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { POPULAR_CAMPUSES, searchCampusesService } from "../../src/services/campusService.js";

describe("campusService unit tests", () => {
  it("returns POPULAR_CAMPUSES immediately when query is empty", async () => {
    const res = await searchCampusesService("");
    assert.equal(res.cached, false);
    assert.deepEqual(res.results, POPULAR_CAMPUSES);
  });

  it("matches local presets only for single-character query without calling fetch", async (t) => {
    let fetchCalled = false;
    t.mock.method(globalThis, "fetch", async () => {
      fetchCalled = true;
      return new Response("[]", { status: 200 });
    });

    const res = await searchCampusesService("u");
    assert.equal(fetchCalled, false);
    assert.equal(res.cached, false);
    assert.ok(res.results.length >= 4);
    assert.ok(res.results.some((c) => c.id === "UGM"));
  });

  it("expands campus alias, normalizes Nominatim results, deduplicates near presets, and caches results", async (t) => {
    let fetchCalls = 0;
    let capturedUrl = "";

    t.mock.method(globalThis, "fetch", async (url) => {
      fetchCalls += 1;
      capturedUrl = url;
      return {
        ok: true,
        async json() {
          return [
            {
              osm_type: "way",
              osm_id: 1001,
              name: "Universitas Muhammadiyah Yogyakarta",
              lat: "-7.8112",
              lon: "110.3215",
              address: { city: "Bantul" },
            },
            {
              osm_type: "node",
              osm_id: 1002,
              display_name: "Kampus Duplikat Dekat, Bantul, Yogyakarta",
              lat: "-7.8115",
              lon: "110.3218",
              address: { county: "Bantul" },
            },
          ];
        },
      };
    });

    const first = await searchCampusesService("UMY");
    assert.equal(fetchCalls, 1);
    assert.equal(first.cached, false);
    assert.equal(new URL(capturedUrl).searchParams.get("q"), "Universitas Muhammadiyah Yogyakarta");
    assert.equal(first.results.length, 1);
    assert.equal(first.results[0].id, "osm_way_1001");
    assert.equal(first.results[0].kota, "Bantul");
    assert.equal(first.results[0].source, "nominatim");

    const second = await searchCampusesService("umy");
    assert.equal(fetchCalls, 1, "Expected second identical query to use TTL cache");
    assert.equal(second.cached, true);
    assert.deepEqual(second.results, first.results);
  });

  it("falls back cleanly to matching presets when Nominatim fetch rejects", async (t) => {
    t.mock.method(globalThis, "fetch", async () => {
      throw new Error("Network unreachable");
    });

    const res = await searchCampusesService("Bandung");
    assert.equal(res.cached, false);
    assert.ok(res.results.some((c) => c.id === "ITB"));
  });
});
