/** @typedef {import('./types').Product} Product */
/** @typedef {import('./types').Category} Category */

/** @type {Category[]} */
export const categories = [
  { id: 1, name: "Running", image: "shoes", line: "Make every mile yours." },
  { id: 2, name: "Football", image: "football", line: "Bring your game." },
  { id: 3, name: "Basketball", image: "basketball", line: "Own the court." },
  { id: 4, name: "Fitness", image: "fitness", line: "Built for one more rep." },
  { id: 5, name: "Cycling", image: "cycling", line: "Take the longer route." },
  { id: 6, name: "Outdoor", image: "outdoor", line: "Find your own path." },
  { id: 7, name: "Swimming", image: "swimming", line: "Go beyond your lane." },
  { id: 8, name: "Tennis", image: "tennis", line: "Make your next point." },
];

/** @param {number | null | undefined} id */
export const categoryFor = (id) =>
  categories.find((category) => category.id === id) || {
    id: id || 0,
    name: "Equipment",
    image: "fitness",
    line: "Ready for your next.",
  };

/** @param {unknown} value */
export const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] || character,
  );

/** @param {number} value */
export const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );

/** @param {Product[]} products @param {URLSearchParams} params */
export function filterProducts(products, params) {
  const category = params.get("category");
  const query = (params.get("search") || "").trim().toLowerCase();
  const result = products.filter(
    (product) =>
      (!category || String(product.categoryId) === category) &&
      `${product.name} ${product.description} ${categoryFor(product.categoryId).name}`
        .toLowerCase()
        .includes(query),
  );
  switch (params.get("sort")) {
    case "price-low":
      return result.sort((a, b) => a.price - b.price);
    case "price-high":
      return result.sort((a, b) => b.price - a.price);
    case "name":
      return result.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return result;
  }
}

/** @param {Storage} storage @param {string} key @param {string | null} [value] */
export function stored(storage, key, value) {
  try {
    if (value === undefined) return storage.getItem(key);
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    /* Storage may be unavailable in private browsing. */
  }
  return null;
}
