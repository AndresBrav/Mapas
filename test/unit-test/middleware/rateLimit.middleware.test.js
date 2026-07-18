import { describe, it, expect, vi } from "vitest";

vi.mock("@tigo/redis-connector", () => ({
    getValue: vi.fn(),
    setValue: vi.fn(),
}));

describe("rateLimit.middleware.js", () => {
    it("deberia exportar una funcion middleware", async () => {
        const { rateLimitMiddleware } =
            await import("../../../src/middleware/rateLimit.middleware.js");
        expect(typeof rateLimitMiddleware).toBe("function");
    });

    it("deberia tener 3 parametros (req, res, next)", async () => {
        const { rateLimitMiddleware } =
            await import("../../../src/middleware/rateLimit.middleware.js");
        expect(rateLimitMiddleware).toHaveLength(3);
    });
});
