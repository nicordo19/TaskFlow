const { test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");

// Validation en mémoire uniquement : aucun appel à save() ni à MongoDB.
const ownerId = new mongoose.Types.ObjectId();

test("une nouvelle tâche reçoit les valeurs par défaut attendues", async () => {
  const task = new Task({ title: "Préparer le projet", user: ownerId });
  await task.validate();
  assert.equal(task.status, "todo");
  assert.equal(task.description, "");
  assert.equal(task.dueDate, null);
  assert.ok(task.user.equals(ownerId));
});

test("les espaces autour du titre et de la description sont supprimés", async () => {
  const task = new Task({
    title: "  Tester le projet  ",
    description: "  Écrire les tests  ",
    user: ownerId,
  });
  await task.validate();
  assert.equal(task.title, "Tester le projet");
  assert.equal(task.description, "Écrire les tests");
});

for (const title of [undefined, "", "   "]) {
  test(`une tâche refuse un titre vide : ${JSON.stringify(title)}`, async () => {
    await assert.rejects(new Task({ title, user: ownerId }).validate(),
      (error) => error.errors.title.kind === "required");
  });
}

test("une tâche exige un propriétaire", async () => {
  await assert.rejects(new Task({ title: "Ma tâche" }).validate(),
    (error) => error.errors.user.kind === "required");
});

for (const status of ["todo", "doing", "done"]) {
  test(`le statut ${status} est accepté`, async () => {
    const task = new Task({ title: "Ma tâche", user: ownerId, status });
    await task.validate();
    assert.equal(task.status, status);
  });
}

test("une tâche refuse un statut inconnu", async () => {
  await assert.rejects(new Task({
    title: "Ma tâche", user: ownerId, status: "archived",
  }).validate(), (error) => error.errors.status.kind === "enum");
});

test("une tâche accepte une date valide et refuse une date illisible", async () => {
  const task = new Task({
    title: "Ma tâche", user: ownerId, dueDate: "2026-12-01",
  });
  await task.validate();
  assert.equal(task.dueDate.toISOString(), "2026-12-01T00:00:00.000Z");
  task.dueDate = "pas-une-date";
  await assert.rejects(task.validate(),
    (error) => error.errors.dueDate.name === "CastError");
});

test("le nom et l'adresse email sont normalisés", async () => {
  const user = new User({
    name: "  Alice  ", email: "  ALICE@EXAMPLE.COM  ", password: "hash-de-test",
  });
  await user.validate();
  assert.equal(user.name, "Alice");
  assert.equal(user.email, "alice@example.com");
});

for (const field of ["name", "email", "password"]) {
  test(`un utilisateur exige le champ ${field}`, async () => {
    const data = { name: "Alice", email: "alice@example.com", password: "hash-de-test" };
    delete data[field];
    await assert.rejects(new User(data).validate(),
      (error) => error.errors[field].kind === "required");
  });
}

test("un nom de 100 caractères est accepté, 101 est refusé", async () => {
  const user = new User({
    name: "a".repeat(100), email: "alice@example.com", password: "hash-de-test",
  });
  await user.validate();
  user.name = "a".repeat(101);
  await assert.rejects(user.validate(),
    (error) => error.errors.name.kind === "maxlength");
});
