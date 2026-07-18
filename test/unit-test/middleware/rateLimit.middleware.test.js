import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@tigo/redis-connector", () => ({
    getValue: vi.fn(),
    setValue: vi.fn(),
}));

import { getValue, setValue } from "@tigo/redis-connector";

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

describe("RedisConnectorStore", () => {
    let store;

    beforeEach(async () => {
        vi.clearAllMocks();
        const { RedisConnectorStore } = await import(
            "../../../src/middleware/rateLimit.middleware.js"
        );
        store = new RedisConnectorStore();
    });

    describe("increment()", () => {
        it("deberia retornar totalHits=1 cuando la key no existe", async () => {
            getValue.mockResolvedValue(null);

            const result = await store.increment("::1");

            expect(getValue).toHaveBeenCalledWith("ratelimit:::1");
            expect(setValue).toHaveBeenCalledWith(
                "ratelimit:::1",
                "1",
                expect.any(Number),
            );
            expect(result.totalHits).toBe(1);
            expect(result.resetTime).toBeInstanceOf(Date);
        });

        it("deberia incrementar totalHits cuando la key ya existe", async () => {
            getValue.mockResolvedValue("3");

            const result = await store.increment("192.168.1.1");

            expect(setValue).toHaveBeenCalledWith(
                "ratelimit:192.168.1.1",
                "4",
                expect.any(Number),
            );
            expect(result.totalHits).toBe(4);
        });

        it("deberia usar TTL correcto basado en windowMs", async () => {
            getValue.mockResolvedValue(null);

            await store.increment("test");

            const ttlArg = setValue.mock.calls[0][2];
            expect(ttlArg).toBe(900);
        });
    });

    describe("decrement()", () => {
        it("deberia decrementar cuando el valor es mayor a 1", async () => {
            getValue.mockResolvedValue("5");

            await store.decrement("192.168.1.1");

            expect(setValue).toHaveBeenCalledWith(
                "ratelimit:192.168.1.1",
                "4",
                expect.any(Number),
            );
        });

        it("deberia setear a 0 cuando el valor llega a 0 o menos", async () => {
            getValue.mockResolvedValue("1");

            await store.decrement("192.168.1.1");

            expect(setValue).toHaveBeenCalledWith(
                "ratelimit:192.168.1.1",
                "0",
                expect.any(Number),
            );
        });

        it("no deberia hacer nada si la key no existe", async () => {
            getValue.mockResolvedValue(null);

            await store.decrement("unknown");

            expect(setValue).not.toHaveBeenCalled();
        });
    });

    describe("resetKey()", () => {
        it("deberia resetear el contador a 0", async () => {
            await store.resetKey("192.168.1.1");

            expect(setValue).toHaveBeenCalledWith(
                "ratelimit:192.168.1.1",
                "0",
                900,
            );
        });
    });
});
