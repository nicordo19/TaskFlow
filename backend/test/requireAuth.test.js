const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth");

const secret = "secret-local-reserve-aux-tests";
const userId = "507f1f77bcf86cd799439011";
let originalSecret;

beforeEach(() => {
  originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = secret;
});

afterEach(() => {
  if (originalSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSecret;
});

function setup(t, cookies) {
  const req = { cookies };
  const res = {
    status: t.mock.fn(function (code) { this.statusCode = code; return this; }),
    json: t.mock.fn(function (body) { this.body = body; return this; }),
  };
  const next = t.mock.fn();
  // Tous les accès utilisateur sont simulés, sans connexion à MongoDB.
  const findById = t.mock.method(User, "findById", async () => null);
  return { req, res, next, findById };
}

function assertRejected(context, message, status = 401) {
  assert.equal(context.res.statusCode, status);
  assert.deepEqual(context.res.body, { error: message });
  assert.equal(context.res.json.mock.callCount(), 1);
  assert.equal(context.next.mock.callCount(), 0);
  assert.equal(context.req.user, undefined);
}

for (const cookies of [undefined, {}]) {
  test(`une requête sans token est refusée (${JSON.stringify(cookies)})`, async (t) => {
    const context = setup(t, cookies);
    await requireAuth(context.req, context.res, context.next);
    assertRejected(context, "Authentification requise");
    assert.equal(context.findById.mock.callCount(), 0);
  });
}

for (const [label, createToken] of [
  ["malformé", () => "token-invalide"],
  ["signé avec un autre secret", () => jwt.sign({ userId }, "autre-secret")],
  ["expiré", () => jwt.sign({ userId, exp: 1 }, secret)],
]) {
  test(`un token ${label} est refusé avant toute recherche utilisateur`, async (t) => {
    const context = setup(t, { taskflow_token: createToken() });
    await requireAuth(context.req, context.res, context.next);
    assertRejected(context, "Session invalide ou expirée");
    assert.equal(context.findById.mock.callCount(), 0);
  });
}

test("un token sans identifiant utilisateur est refusé", async (t) => {
  const context = setup(t, { taskflow_token: jwt.sign({}, secret) });
  await requireAuth(context.req, context.res, context.next);
  assertRejected(context, "Session invalide");
  assert.equal(context.findById.mock.callCount(), 0);
});

test("un utilisateur supprimé ne peut plus accéder à sa session", async (t) => {
  const context = setup(t, { taskflow_token: jwt.sign({ userId }, secret) });
  await requireAuth(context.req, context.res, context.next);
  assertRejected(context, "Utilisateur introuvable");
  assert.deepEqual(context.findById.mock.calls[0].arguments, [userId]);
});

test("une session valide transmet uniquement les informations publiques", async (t) => {
  const context = setup(t, { taskflow_token: jwt.sign({ userId }, secret) });
  context.findById.mock.mockImplementation(async () => ({
    _id: { toString: () => userId },
    name: "Alice", email: "alice@example.com", password: "hash-confidentiel",
  }));
  await requireAuth(context.req, context.res, context.next);
  assert.deepEqual(context.req.user, { id: userId, name: "Alice", email: "alice@example.com" });
  assert.equal(context.findById.mock.callCount(), 1);
  assert.deepEqual(context.findById.mock.calls[0].arguments, [userId]);
  assert.equal(context.next.mock.callCount(), 1);
  assert.deepEqual(context.next.mock.calls[0].arguments, []);
  assert.equal(context.res.status.mock.callCount(), 0);
  assert.equal(context.res.json.mock.callCount(), 0);
});

test("une erreur de base renvoie 500 sans divulguer les détails", async (t) => {
  const context = setup(t, { taskflow_token: jwt.sign({ userId }, secret) });
  context.findById.mock.mockImplementation(async () => {
    throw new Error("Détails privés de connexion");
  });
  t.mock.method(console, "error", () => {});
  await requireAuth(context.req, context.res, context.next);
  assertRejected(context, "Erreur interne du serveur", 500);
});
