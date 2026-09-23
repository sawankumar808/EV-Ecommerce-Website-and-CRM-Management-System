import axios from "axios";

const configuredBase =
  import.meta.env.VITE_API_URL ||
  "https://ev-ecommerce-website-and-crm-management.onrender.com/api";

const API_BASE =
  configuredBase
    .replace(/\/+$/, "")
    .replace(/\/api\/?$/, "") +
  "/api";

function normalizeApiPath(rawUrl) {
  if (
    !rawUrl ||
    /^https?:\/\//i.test(rawUrl)
  ) {
    return rawUrl;
  }

  let url = rawUrl.startsWith("/")
    ? rawUrl
    : `/${rawUrl}`;

  const hadApiPrefix =
    url === "/api" ||
    url.startsWith("/api/");

  if (hadApiPrefix) {
    url = url.replace(
      /^\/api(?=\/|$)/,
      ""
    );
  }

  /*
   * AUTH
   */
  if (url.startsWith("/auth/")) {
    return url;
  }

  /*
   * PUBLIC PRODUCTS LIST
   */
  if (
    url === "/public-products" ||
    url.startsWith("/public-products/")
  ) {
    return url;
  }

  /*
   * PUBLIC BATTERY
   */
  if (
    !hadApiPrefix &&
    /^\/batteries\/[^/]+\/?$/.test(url)
  ) {
    const serial = url.split("/")[2];
    return `/battery/public-battery/${encodeURIComponent(serial)}/`;
  }

  const aliases = [
    /* Dashboard */
    ["/dashboard-summary", "/crm/dashboard-summary"],
    ["/reports-summary", "/crm/reports-summary"],
    ["/sales-team-summary", "/accounts/sales-team-summary"],

    /* Roles */
    ["/roles/catalog", "/accounts/roles/catalog"],
    ["/roles", "/accounts/roles"],
    ["/public-roles", "/accounts/public-roles"],

    /* Users */
    ["/users/me", "/accounts/me"],
    ["/users", "/accounts/users"],

    /* Vendor */
    ["/vendor/register", "/vendors/vendor/register"],
    ["/vendor/me", "/vendors/vendor/me"],
    ["/vendor/products", "/vendors/vendor/products"],
    ["/vendor/customers", "/vendors/vendor/customers"],
    ["/vendor/batteries", "/vendors/vendor/batteries"],
    ["/vendor/scooters", "/vendors/vendor/scooters"],
    ["/vendor/orders", "/vendors/vendor/orders"],

    /* Vendor pricing */
    ["/vendor-product-prices", "/products/vendor-product-prices"],

    /* Battery */
    ["/battery-batches", "/battery/battery-batches"],
    ["/batteries", "/battery/batteries"],
    ["/public-battery", "/battery/public-battery"],

    /* Main CRUD */
    ["/vendors", "/vendors/vendors"],
    ["/customers", "/customers/customers"],
    ["/scooters", "/scooters/scooters"],
    ["/coupons", "/coupons/coupons"],

    /* CRM */
    ["/pipeline-stages", "/crm/pipeline-stages"],
    ["/lead-sources", "/crm/lead-sources"],
    ["/leads", "/crm/leads"],
    ["/follow-ups", "/crm/follow-ups"],
    ["/quotations", "/crm/quotations"],
    ["/quotation-items", "/crm/quotation-items"],
    ["/tasks", "/crm/tasks"],
    ["/notifications", "/crm/notifications"],
    ["/sales", "/crm/sales"],
  ];

  for (const [from, to] of aliases) {
    if (
      url === from ||
      url.startsWith(`${from}/`) ||
      url.startsWith(`${from}?`)
    ) {
      return `${to}${url.slice(from.length)}`;
    }
  }

  return url;
}

const client = axios.create({
  baseURL: API_BASE,
});

client.interceptors.request.use(
  (config) => {
    config.url = normalizeApiPath(config.url);

    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("access");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const publicPaths = [
      "/",
      "/about",
      "/products",
      "/contact",
      "/login",
      "/vendor/register",
    ];

    const currentPath = window.location.pathname;

    const isPublicPage =
      publicPaths.includes(currentPath) ||
      currentPath.startsWith("/products/") ||
      currentPath.startsWith("/battery/");

    if (error.response?.status === 401 && !isPublicPage) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token");
      localStorage.removeItem("access");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default client;