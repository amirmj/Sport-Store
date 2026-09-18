# Sport Store storefront

## Architecture and API assessment

The original application was a Spring Boot REST API with a placeholder page. The storefront uses native ES modules and Spring's static resources, so `./mvnw package` produces a complete deployable application without a Node build step. Node is only used for development checks.

Pages use hash navigation (`/#/shop`, `/#/product/1`, `/#/bag`, `/#/checkout`, `/#/account`, `/#/orders`, `/#/order/1`). REST endpoint paths remain unchanged. The home controller forwards to the static entry point. Only the entry point and `/storefront/**` GET resources are newly public.

| Storefront behavior | Existing API |
| --- | --- |
| Catalog and client-side search/category/sort | `GET /products` |
| Product detail | `GET /products/{id}` |
| Guest bag | `POST /carts`, `GET /carts/{id}` |
| Add / change quantity / remove | `POST /carts/{id}/items`, `PUT` / `DELETE /carts/{id}/items/{productId}` |
| Account creation | `POST /users` |
| Login, session refresh, identity | `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me` |
| Submit order request | `POST /checkout` with `{ "cartId": "uuid" }` |
| Order history / confirmation | `GET /orders`, `GET /orders/{id}` |

Access tokens remain in memory. A non-sensitive browser marker opts into the API's HttpOnly refresh cookie on reload; the bag UUID is stored locally. The client retries authenticated requests once after a 401 and successful refresh. Network/server failures during checkout are never automatically retried and direct the shopper to check order history. Mutations are serialized in the UI, and totals come from the API.

### Current backend limits

- Checkout creates a `PENDING` order and clears the cart; there is no Stripe Checkout/session/charge implementation. The UI explicitly describes an **order request**, requires acknowledgment, and never collects card details or reports a successful payment.
- Delivery addresses, shipping/tax calculation, stock, sizes/colors, ratings, discounts, and currency metadata are absent. The website does not invent these. USD is the storefront display convention and should be confirmed before launch.
- There is no categories endpoint. Labels follow the eight category IDs in `V6__populate_databases.sql`; unknown IDs fall back to “Equipment.”
- Product image fields are absent. Bundled sport-category photography is explicitly illustrative and should be replaced with merchant-provided product images once the API supports them.
- Logout is local to the browser: the API has no refresh-token revocation/logout endpoint. A production logout endpoint should expire the refresh cookie and revoke refresh tokens.
- Carts are public UUID resources, not associated with accounts. Production should review ownership enforcement. Checkout should gain a transaction and idempotency key before payment processing is introduced.
- The existing MySQL migrations use mixed-case `order_Items` while JPA uses `order_items`. The local database below uses `lower_case_table_names=1`; existing production databases need a deliberate migration if case-sensitive.
- Development configuration already contains a database password. Move production credentials to a secret manager/environment and rotate any credential that has been used outside local development.

## Run locally

Requires **Java 21**, Docker, and the included **Maven 3.9.9 wrapper**.

```sh
docker run -d --name sport-store-mysql \
  -p 127.0.0.1:3306:3306 \
  -e MYSQL_ROOT_PASSWORD=local-sport-store \
  -e MYSQL_DATABASE=store_api \
  mysql:8.0.42 --lower-case-table-names=1

# Wait until the database reports "ready for connections".
docker logs sport-store-mysql

export SPRING_DATASOURCE_PASSWORD=local-sport-store
export JWT_SECRET="$(openssl rand -base64 32)"
export STRIPE_SECRET_KEY=not-configured
./mvnw -Dflyway.password="$SPRING_DATASOURCE_PASSWORD" flyway:migrate
./mvnw spring-boot:run
```

Use `docker start sport-store-mysql` on subsequent runs. These credentials are for an isolated local development database only. Apply the included Flyway migrations before starting the app; the current dependencies do not run Flyway automatically at startup. Open `http://localhost:8080`; no separate frontend server or CORS configuration is needed.

The existing refresh cookie is `Secure`; use HTTPS in deployed environments. Browsers that disallow Secure cookies on HTTP will require signing in again after a reload during local development.

## Checks

```sh
# Java context test and packaged application (database/env above required)
./mvnw verify

# Development tools, Node 24
npm install
npm run check

# Live API integration against an isolated local instance; creates a test account/order
node test/integration.js
# Override origin with STORE_URL if needed.
```

The Java compiler checks the Spring integration. TypeScript strictly checks the JavaScript through JSDoc. ESLint checks client and test code. Node tests cover filtering, escaping, honest checkout states, API payloads, 401 refresh, and avoiding duplicate submissions after network/server failures.

No pre-commit hooks are configured. Browser interaction and visual checks are separate from these shell checks.

## Visual assets

Fonts: DM Sans and Barlow Condensed, locally hosted under their bundled SIL Open Font Licenses.

Photographs are downloaded from Unsplash for category illustration:

| File | Unsplash photo ID |
| --- | --- |
| running.jpg | `photo-1552674605-db6ffd4facb5` |
| shoes.jpg | `photo-1542291026-7eec264c27ff` |
| football.jpg | `photo-1574629810360-7efbbe195018` |
| basketball.jpg | `photo-1546519638-68e109498ffc` |
| fitness.jpg | `photo-1517836357463-d25dfeac3438` |
| cycling.jpg | `photo-1485965120184-e220f721d03e` |
| outdoor.jpg | `photo-1464822759023-fed622ff2c3b` |
| swimming.jpg | `photo-1530549387789-4c1017266635` |
| tennis.jpg | `photo-1595435934249-5df7ed86e1c0` |

Sources: `https://images.unsplash.com/{photo-id}`. [Unsplash license](https://unsplash.com/license).
