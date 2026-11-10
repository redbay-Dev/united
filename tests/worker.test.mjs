// Checks cloudflare-worker.js without deploying it: Turnstile and SMTP2GO are
// stubbed, so only the Worker's own logic runs. Run: node --test tests/*.test.mjs
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import worker from "../cloudflare-worker.js";

const ENV = { TURNSTILE_SECRET_KEY: "test-secret", SMTP2GO_API_KEY: "test-key" };
const SEND = "https://contact.unitedcivil.com.au/send";
const APEX = "https://unitedcivil.com.au";
const WWW = "https://www.unitedcivil.com.au";
const ENQUIRY = { name: "Sam", email: "sam@example.com", message: "Quote for a pad", turnstileToken: "token" };

let emails;
let turnstilePasses;

beforeEach(() => {
  emails = [];
  turnstilePasses = true;
  globalThis.fetch = async (url, init) => {
    if (String(url).includes("turnstile")) return Response.json({ success: turnstilePasses });
    emails.push(JSON.parse(init.body));
    return Response.json({ data: { succeeded: 1 } });
  };
});

const post = (origin, body) =>
  worker.fetch(
    new Request(SEND, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    ENV
  );
const preflight = (origin) => worker.fetch(new Request(SEND, { method: "OPTIONS", headers: { Origin: origin } }), ENV);

for (const origin of [APEX, WWW]) {
  test(`every reply to ${origin} lets that page read it`, async () => {
    for (const res of [await preflight(origin), await post(origin, ENQUIRY), await post(origin, { name: "Sam" })]) {
      assert.equal(res.headers.get("Access-Control-Allow-Origin"), origin);
    }
  });
}

test("a foreign origin is never echoed back", async () => {
  const res = await preflight("https://evil.example");
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), APEX);
});

test("an enquiry is emailed to info@unitedcivil.net.au, replying to the visitor", async () => {
  const res = await post(WWW, ENQUIRY);
  assert.deepEqual(await res.json(), { success: true });
  assert.equal(emails.length, 1);
  assert.deepEqual(emails[0].to, ["info@unitedcivil.net.au"]);
  assert.equal(emails[0].sender, "info@unitedcivil.net.au");
  assert.deepEqual(emails[0].custom_headers, [{ header: "Reply-To", value: "sam@example.com" }]);
  assert.match(emails[0].text_body, /Quote for a pad/);
});

test("any path other than /send is a 404 and sends nothing", async () => {
  for (const method of ["POST", "GET", "OPTIONS"]) {
    const res = await worker.fetch(
      new Request("https://contact.unitedcivil.com.au/api/heartbeat", { method, headers: { Origin: APEX }, body: method === "POST" ? "{}" : undefined }),
      ENV
    );
    assert.equal(res.status, 404, method);
  }
  assert.equal(emails.length, 0);
});

test("a body that isn't JSON is a 400, not a crash", async () => {
  const res = await worker.fetch(new Request(SEND, { method: "POST", headers: { Origin: APEX }, body: "not json" }), ENV);
  assert.equal(res.status, 400);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), APEX);
  const nullBody = await worker.fetch(new Request(SEND, { method: "POST", headers: { Origin: APEX }, body: "null" }), ENV);
  assert.equal(nullBody.status, 400);
});

test("a failed Turnstile check sends no email", async () => {
  turnstilePasses = false;
  const res = await post(APEX, ENQUIRY);
  assert.equal(res.status, 400);
  assert.equal(emails.length, 0);
});
