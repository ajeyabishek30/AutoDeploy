
const { test } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../server");

// Start the Express app on a temporary port
async function withServer(callback) {
  const server = app.listen(0);

  try {
    await new Promise((resolve) => {
      server.once("listening", resolve);
    });

    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    await callback(baseUrl);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

// Test 1: Health check
test("Health endpoint works", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.status, "OK");
  });
});

// Test 2: Retrieve all tasks
test("GET /tasks returns an array", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/tasks`);
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(data));
  });
});

// Test 3: Create, retrieve, update and delete
test("Task CRUD operations work", async () => {
  await withServer(async (baseUrl) => {

    // Create
    const createResponse = await fetch(`${baseUrl}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "Learn Docker"
      })
    });

    assert.equal(createResponse.status, 201);

    const created = await createResponse.json();
    assert.equal(created.title, "Learn Docker");
    assert.equal(created.completed, false);

    const taskId = created.id;

    // Retrieve
    const getResponse = await fetch(
      `${baseUrl}/tasks/${taskId}`
    );

    assert.equal(getResponse.status, 200);

    const retrieved = await getResponse.json();
    assert.equal(retrieved.id, taskId);

    // Update
    const updateResponse = await fetch(
      `${baseUrl}/tasks/${taskId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: "Learn Docker",
          completed: true
        })
      }
    );

    assert.equal(updateResponse.status, 200);

    const updated = await updateResponse.json();
    assert.equal(updated.completed, true);

    // Delete
    const deleteResponse = await fetch(
      `${baseUrl}/tasks/${taskId}`,
      {
        method: "DELETE"
      }
    );

    assert.equal(deleteResponse.status, 204);

    // Verify deletion
    const missingResponse = await fetch(
      `${baseUrl}/tasks/${taskId}`
    );

    assert.equal(missingResponse.status, 404);
  });
});
