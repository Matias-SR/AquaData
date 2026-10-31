import { expect, test } from "vitest";
import { sumar } from "./sumar";

test("sumar 2 y 3", () => {
    expect(sumar(2, 3)).toBe(5);
});