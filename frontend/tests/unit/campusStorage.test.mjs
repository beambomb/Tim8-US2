import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_CAMPUS,
  POPULAR_CAMPUS_PRESETS,
  mergeWithDefaultCampus,
  loadGuestCampuses,
  saveGuestCampuses,
  searchCampusesDirectly,
} from "@/features/kos/utils/campusStorage";
import { setupMockWindow } from "../helpers/mockWindow.mjs";

describe("frontend campusStorage unit tests", () => {
  it("POPULAR_CAMPUS_PRESETS includes DEFAULT_CAMPUS (UGM) as first entry", () => {
    assert.equal(POPULAR_CAMPUS_PRESETS[0].id, DEFAULT_CAMPUS.id);
    assert.equal(DEFAULT_CAMPUS.isDefault, true);
  });

  it("mergeWithDefaultCampus preserves default campus, deduplicates IDs, and filters invalid coords", () => {
    const merged = mergeWithDefaultCampus([
      { id: "UGM", nama: "Duplicate UGM", latitude: -7.77, longitude: 110.37 },
      { id: "bad-coords", nama: "Broken", latitude: "abc", longitude: 110.1 },
      { nama: "No ID", latitude: -7.5, longitude: 110.5 },
      { id: "UNS", shortName: "UNS", nama: "UNS Solo", latitude: "-7.559", longitude: "110.856" },
      { id: "UNS", nama: "Duplicate UNS", latitude: -7.56, longitude: 110.85 },
    ]);

    assert.equal(merged.length, 2);
    assert.equal(merged[0].id, "UGM");
    assert.equal(merged[1].id, "UNS");
    assert.equal(merged[1].latitude, -7.559);
    assert.equal(merged[1].source, "custom");
  });

  it("saveGuestCampuses excludes DEFAULT_CAMPUS and loadGuestCampuses handles corrupt JSON", () => {
    const env = setupMockWindow();
    try {
      saveGuestCampuses([
        DEFAULT_CAMPUS,
        { id: "ITB", nama: "ITB Bandung", latitude: -6.8915, longitude: 107.6107 },
      ]);

      const loaded = loadGuestCampuses();
      assert.equal(loaded.length, 1);
      assert.equal(loaded[0].id, "ITB");

      env.localStorageMock.setItem("carikos:savedCampuses", "{broken-json");
      assert.deepEqual(loadGuestCampuses(), []);
    } finally {
      env.restore();
    }
  });

  it("searchCampusesDirectly resolves alias query and throws NOMINATIM_UNREACHABLE on total failure", async (t) => {
    let calledUrl = "";
    t.mock.method(globalThis, "fetch", async (url) => {
      calledUrl = url;
      return {
        ok: true,
        async json() {
          return [
            {
              osm_type: "node",
              osm_id: 77,
              name: "Universitas Brawijaya",
              lat: "-7.9525",
              lon: "112.6139",
              address: { city: "Malang" },
            },
          ];
        },
      };
    });

    const found = await searchCampusesDirectly("unibraw", []);
    assert.equal(new URL(calledUrl).searchParams.get("q"), "Universitas Brawijaya");
    assert.equal(found.length, 1);
    assert.equal(found[0].kota, "Malang");

    t.mock.method(globalThis, "fetch", async () => {
      throw new Error("offline");
    });

    await assert.rejects(
      () => searchCampusesDirectly("KampusX", []),
      /NOMINATIM_UNREACHABLE/
    );
  });
});
