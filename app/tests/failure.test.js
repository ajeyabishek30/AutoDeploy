
const { test } = require("node:test");
const assert = require("node:assert/strict");

test("CI failure demonstration - fixed", () => {
  assert.equal(2, 2);
});
