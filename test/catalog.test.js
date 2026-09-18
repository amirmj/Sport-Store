import assert from "node:assert/strict";
import test from "node:test";
import {
  categoryFor,
  escapeHtml,
  filterProducts,
  stored,
} from "../src/main/resources/static/storefront/catalog.js";
import {
  checkout,
  home,
  orderPage,
  productCard,
  shop,
} from "../src/main/resources/static/storefront/views.js";

const products = [
  {
    id: 1,
    name: "Daily Runner",
    description: "Lightweight shoes",
    price: 129.99,
    categoryId: 1,
  },
  {
    id: 2,
    name: "Training Gloves",
    description: "Breathable grip",
    price: 24.99,
    categoryId: 4,
  },
  {
    id: 3,
    name: "Trail Runner",
    description: "Outdoor running shoes",
    price: 99.99,
    categoryId: 1,
  },
];

test("search combines category, case-insensitive descriptions and numeric price sorting without mutating source data", () => {
  assert.deepEqual(
    filterProducts(
      products,
      new URLSearchParams("category=1&search=SHOES&sort=price-low"),
    ).map((product) => product.id),
    [3, 1],
  );
  assert.deepEqual(
    products.map((product) => product.id),
    [1, 2, 3],
  );
  assert.deepEqual(
    filterProducts(products, new URLSearchParams("category=4&search=shoes")),
    [],
  );
});

test("unknown categories have a usable fallback", () => {
  assert.equal(categoryFor(50).name, "Equipment");
  assert.equal(categoryFor(null).image, "fitness");
});

test("catalog and product templates escape untrusted text", () => {
  assert.equal(escapeHtml("<script>\"&'"), "&lt;script&gt;&quot;&amp;&#39;");
  const html = productCard({
    ...products[0],
    name: "<img src=x onerror=alert(1)>",
  });
  assert.ok(!html.includes("<img src=x"));
  assert.ok(html.includes("&lt;img src=x"));
  const search = shop(
    products,
    new URLSearchParams("search=%22%3E%3Cscript%3E"),
    "",
  );
  assert.ok(!search.includes("<script>"));
});

test("empty and failed catalogs do not substitute fake products", () => {
  assert.match(home([], ""), /New gear is on the way/);
  assert.match(home(null, "Store unavailable"), /Store unavailable/);
  assert.ok(!home(null, "Store unavailable").includes("product-card"));
});

test("checkout requires sign-in and explicitly describes a pending, unpaid order", () => {
  const cart = {
    id: "test-cart",
    items: [{ product: products[0], quantity: 2, totalPrice: 259.98 }],
    totalPrice: 259.98,
  };
  const signedOut = checkout(cart, null, products, "");
  assert.match(signedOut, /Sign in to continue/);
  assert.ok(!signedOut.includes('data-action="place-order"'));
  const signedIn = checkout(
    cart,
    { user_id: 1, name: "Alex", email: "alex@example.com" },
    products,
    "",
  );
  assert.match(signedIn, /Place order request/);
  assert.match(signedIn, /You will not be charged/);
  assert.match(signedIn, /\$259\.98/);
  assert.match(signedIn, /id="order-consent"/);
});

test("pending confirmation never implies payment was successful", () => {
  const html = orderPage(
    {
      id: 42,
      status: "PENDING",
      createdAt: "2026-09-18",
      items: [],
      totalPrice: 99,
    },
    products,
    true,
  );
  assert.match(html, /Order request received/);
  assert.match(html, /No payment has been collected/);
  assert.match(html, /PENDING/);
});

test("blocked browser storage does not break shopping", () => {
  const storage = {
    getItem() {
      throw new Error("Disabled");
    },
    setItem() {
      throw new Error("Disabled");
    },
    removeItem() {
      throw new Error("Disabled");
    },
  };
  assert.equal(stored(storage, "cart"), null);
  assert.equal(stored(storage, "cart", "123"), null);
  assert.equal(stored(storage, "cart", null), null);
});
