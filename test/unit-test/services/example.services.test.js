import { describe, it, expect, vi } from "vitest";

vi.mock("../../../src/repositories/example.repository.js", () => ({
    insertExample: vi.fn(),
    selectExampleById: vi.fn(),
}));

vi.mock("@tigo/kafka-connector", () => ({
    publish: vi.fn().mockResolvedValue(true),
}));

import { insertExample, selectExampleById } from "../../../src/repositories/example.repository.js";
import { publish } from "@tigo/kafka-connector";
import { createExampleService, getExampleService } from "../../../src/services/example.services.js";

describe("example.services.js", () => {
    it("createExampleService should delegate to insertExample and return the row", async () => {
        const created = { id: 1, name: "item" };
        publish.mockResolvedValue();
        insertExample.mockResolvedValue(created);

        const result = await createExampleService({ name: "item" });

        expect(insertExample).toHaveBeenCalledWith({ name: "item" });
        expect(result).toEqual(created);
    });

    it("getExampleService should return the example when found", async () => {
        const example = { id: 1, name: "item" };
        selectExampleById.mockResolvedValue(example);

        const result = await getExampleService({ id: 1 });

        expect(selectExampleById).toHaveBeenCalledWith(1);
        expect(result).toEqual(example);
    });

    it("getExampleService should throw NOT_FOUND when example does not exist", async () => {
        selectExampleById.mockResolvedValue(null);

        await expect(getExampleService({ id: 999 })).rejects.toThrow("example 999 not found");
        await expect(getExampleService({ id: 999 })).rejects.toHaveProperty("errorCode", "NF001");
    });
});
