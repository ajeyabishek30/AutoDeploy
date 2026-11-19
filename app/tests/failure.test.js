
const { test } = require("node:test");
const assert = require("node:assert/strict");

test("CI failure demonstration", () => {
  assert.equal(1, 2);
});
