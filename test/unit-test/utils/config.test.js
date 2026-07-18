import { describe, it, expect, vi, beforeEach } from "vitest";

describe("config.js", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it("deberia usar valores por defecto cuando no hay variables de entorno", async () => {
        const config = (await import("../../../src/utils/config.js")).default;

        expect(config.GEO_CACHE_TTL).toBe(86400);
        expect(config.NOMINATIM_BASE_URL).toBe(
            "https://nominatim.openstreetmap.org/search",
        );
        expect(config.OSRM_BASE_URL).toBe(
            "https://router.project-osrm.org/route/v1/driving",
        );
        expect(config.AUTH_CACHE_TTL).toBe(300);
    });

    it("deberia leer variables de entorno cuando estan definidas", async () => {
        process.env.API_BASE_PATH = "/api/v2";
        process.env.GEO_CACHE_TTL = "3600";
        process.env.NOMINATIM_BASE_URL = "https://custom.nominatim.com/search";
        process.env.OSRM_BASE_URL = "https://custom.osrm.com/route";
        process.env.AUTH_CACHE_TTL = "600";

        const config = (await import("../../../src/utils/config.js")).default;

        expect(config.API_BASE_PATH).toBe("/api/v2");
        expect(config.GEO_CACHE_TTL).toBe(3600);
        expect(config.NOMINATIM_BASE_URL).toBe(
            "https://custom.nominatim.com/search",
        );
        expect(config.OSRM_BASE_URL).toBe("https://custom.osrm.com/route");
        expect(config.AUTH_CACHE_TTL).toBe(600);
    });
});
