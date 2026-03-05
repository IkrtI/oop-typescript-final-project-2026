const API = "";

const state = {
  products: [],
  customers: [],
  orders: [],
};

const els = {
  apiStatus: document.getElementById("apiStatus"),
  toast: document.getElementById("toast"),
  statsCards: document.getElementById("statsCards"),

  refreshAllBtn: document.getElementById("refreshAllBtn"),
  openCreateProductBtn: document.getElementById("openCreateProductBtn"),
  openCreateCustomerBtn: document.getElementById("openCreateCustomerBtn"),

  orderForm: document.getElementById("createOrderForm"),
  orderCustomerId: document.getElementById("orderCustomerId"),
  orderItems: document.getElementById("orderItems"),
  addOrderItemBtn: document.getElementById("addOrderItemBtn"),
  orderPaymentMethod: document.getElementById("orderPaymentMethod"),
  orderAddress: document.getElementById("orderAddress"),
  orderNote: document.getElementById("orderNote"),

  historyCustomerSelect: document.getElementById("historyCustomerSelect"),
  loadHistoryBtn: document.getElementById("loadHistoryBtn"),

  ordersList: document.getElementById("ordersList"),
  productsTable: document.getElementById("productsTable"),
  customersTable: document.getElementById("customersTable"),
  customerHistory: document.getElementById("customerHistory"),
  insightsTopBuyers: document.getElementById("insightsTopBuyers"),
  insightsTopProducts: document.getElementById("insightsTopProducts"),

  modalBackdrop: document.getElementById("modalBackdrop"),
  modalTitle: document.getElementById("modalTitle"),
  modalBody: document.getElementById("modalBody"),
  modalCloseBtn: document.getElementById("modalCloseBtn"),
};

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message || "Request failed";
    throw new Error(message);
  }

  return body.data;
}

function showToast(message, isError = false) {
  els.toast.textContent = message;
  els.toast.className =
    "pointer-events-none fixed bottom-5 right-5 z-50 rounded-xl px-4 py-2 text-sm font-semibold text-white opacity-100 transition " +
    (isError
      ? "bg-rose-600 shadow-lg shadow-rose-900/30"
      : "bg-violet-600 shadow-lg shadow-violet-900/30");

  setTimeout(() => {
    els.toast.className =
      "pointer-events-none fixed bottom-5 right-5 z-50 rounded-xl px-4 py-2 text-sm font-semibold text-white opacity-0 transition";
  }, 2500);
}

function setStatus(ok) {
  els.apiStatus.textContent = ok ? "API: online" : "API: unavailable";
  els.apiStatus.className =
    "rounded-xl border px-4 py-2.5 text-sm " +
    (ok
      ? "border-emerald-300/50 bg-emerald-500/15 text-emerald-100"
      : "border-rose-300/50 bg-rose-500/15 text-rose-100");
}

function customerName(customerId) {
  return state.customers.find((customer) => customer.id === customerId)?.fullName || customerId;
}

function buildProductSalesMap() {
  const map = new Map();

  for (const order of state.orders) {
    for (const item of order.items) {
      const row = map.get(item.productId) || {
        sold: 0,
        revenue: 0,
        buyers: new Set(),
      };

      row.sold += item.quantity;
      row.revenue += item.subtotal;
      row.buyers.add(order.customerId);
      map.set(item.productId, row);
    }
  }

  return map;
}

function buildCustomerSalesMap() {
  const map = new Map();

  for (const order of state.orders) {
    const row = map.get(order.customerId) || {
      orderCount: 0,
      totalSpent: 0,
    };

    row.orderCount += 1;
    row.totalSpent += order.totalAmount;
    map.set(order.customerId, row);
  }

  return map;
}

function renderStats() {
  const totalRevenue = state.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const productSales = buildProductSalesMap();
  const totalUnitsSold = [...productSales.values()].reduce((sum, row) => sum + row.sold, 0);

  const cards = [
    ["Products", state.products.length, "text-indigo-200"],
    ["Customers", state.customers.length, "text-fuchsia-200"],
    ["Orders", state.orders.length, "text-violet-200"],
    ["Revenue", `${totalRevenue.toLocaleString()} THB`, "text-pink-200"],
    ["Units Sold", totalUnitsSold.toLocaleString(), "text-indigo-200"],
  ];

  els.statsCards.innerHTML = cards
    .map(
      ([title, value, color]) => `
      <article class="rounded-2xl border border-violet-300/25 bg-slate-900/60 p-4 backdrop-blur-sm">
        <p class="text-xs uppercase tracking-[0.12em] text-slate-400">${title}</p>
        <p class="heading-font mt-1 text-2xl font-bold ${color}">${value}</p>
      </article>`,
    )
    .join("");
}

function renderOrderItemSelectors() {
  const productOptions = state.products
    .map(
      (product) =>
        `<option value="${product.id}">${esc(product.name)} • stock ${product.stockQuantity}</option>`,
    )
    .join("");

  const rows = [...els.orderItems.querySelectorAll("[data-order-item-product]")];
  if (!rows.length && state.products.length) {
    addOrderItemRow();
    return;
  }

  rows.forEach((selectEl) => {
    const selected = selectEl.value;
    selectEl.innerHTML = productOptions;
    if (selected) {
      selectEl.value = selected;
    }
  });
}

function addOrderItemRow(selectedId = "", quantity = 1) {
  if (!state.products.length) {
    showToast("No products available", true);
    return;
  }

  const options = state.products
    .map(
      (product) =>
        `<option value="${product.id}" ${product.id === selectedId ? "selected" : ""}>${esc(product.name)} • stock ${product.stockQuantity}</option>`,
    )
    .join("");

  const row = document.createElement("div");
  row.className = "grid gap-2 rounded-xl border border-violet-300/20 bg-slate-950/60 p-2 md:grid-cols-[1fr_110px_auto] md:items-end";
  row.innerHTML = `
    <label class="text-xs text-slate-300">Product
      <select data-order-item-product class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-900/80 px-2 py-2 text-sm text-slate-100">${options}</select>
    </label>
    <label class="text-xs text-slate-300">Qty
      <input data-order-item-qty type="number" min="1" value="${Number(quantity) || 1}" class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-900/80 px-2 py-2 text-sm text-slate-100" />
    </label>
    <button type="button" data-order-item-remove class="rounded-lg border border-rose-300/35 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-100">Remove</button>
  `;

  els.orderItems.appendChild(row);
}

function collectOrderItems() {
  const merged = new Map();

  [...els.orderItems.querySelectorAll(".grid")].forEach((row) => {
    const productId = row.querySelector("[data-order-item-product]").value;
    const quantity = Number(row.querySelector("[data-order-item-qty]").value || 0);

    if (!productId || quantity < 1) {
      return;
    }

    merged.set(productId, (merged.get(productId) || 0) + quantity);
  });

  return [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

function renderSelects() {
  const customerOptions = state.customers
    .map((customer) => `<option value="${customer.id}">${esc(customer.fullName)} (${customer.id})</option>`)
    .join("");

  els.orderCustomerId.innerHTML = customerOptions;
  els.historyCustomerSelect.innerHTML = customerOptions;
  renderOrderItemSelectors();
}

function renderOrdersList() {
  const sorted = [...state.orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt));

  els.ordersList.innerHTML = sorted
    .map((order) => {
      const itemsHTML = order.items
        .map(
          (item) =>
            `<li class="text-xs text-slate-300">${esc(item.productName)} • qty ${item.quantity} • ${item.subtotal.toLocaleString()} THB</li>`,
        )
        .join("");

      const statusOptions = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"]
        .map(
          (status) =>
            `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`,
        )
        .join("");

      return `
      <article class="rounded-xl border border-violet-300/20 bg-slate-950/55 p-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h4 class="heading-font text-sm font-semibold text-violet-100">${order.id.slice(0, 8)} • ${esc(customerName(order.customerId))}</h4>
          <span class="rounded-full border border-indigo-300/40 bg-indigo-500/20 px-2 py-1 text-xs text-indigo-100">${order.totalAmount.toLocaleString()} THB</span>
        </div>
        <p class="mt-1 text-xs text-slate-400">${new Date(order.placedAt).toLocaleString()}</p>
        <ul class="mt-2 grid gap-1">${itemsHTML}</ul>

        <div class="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <select data-order-status="${order.id}" class="rounded-lg border border-violet-300/35 bg-slate-900/75 px-2 py-2 text-xs text-slate-100">${statusOptions}</select>
          <input data-order-tracking="${order.id}" value="${esc(order.trackingNumber || "")}" placeholder="tracking number" class="rounded-lg border border-violet-300/35 bg-slate-900/75 px-2 py-2 text-xs text-slate-100" />
          <button data-order-update="${order.id}" class="rounded-lg border border-emerald-300/40 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100">Update</button>
        </div>
      </article>`;
    })
    .join("");
}

function renderCustomersTable() {
  const salesMap = buildCustomerSalesMap();

  const rows = state.customers
    .map((customer) => {
      const info = salesMap.get(customer.id) || { orderCount: 0, totalSpent: 0 };
      return `
      <tr class="border-b border-slate-700/60 text-xs text-slate-200">
        <td class="px-3 py-2">${esc(customer.fullName)}</td>
        <td class="px-3 py-2">${esc(customer.email)}</td>
        <td class="px-3 py-2 text-right">${info.orderCount}</td>
        <td class="px-3 py-2 text-right">${info.totalSpent.toLocaleString()}</td>
        <td class="px-3 py-2">
          <div class="flex flex-wrap gap-1">
            <button data-customer-orders="${customer.id}" class="rounded-md border border-indigo-300/40 bg-indigo-500/20 px-2 py-1 text-[11px] font-semibold text-indigo-100">Orders</button>
            <button data-customer-edit="${customer.id}" class="rounded-md border border-violet-300/40 bg-violet-500/20 px-2 py-1 text-[11px] font-semibold text-violet-100">Edit</button>
            <button data-customer-delete="${customer.id}" class="rounded-md border border-rose-300/40 bg-rose-500/20 px-2 py-1 text-[11px] font-semibold text-rose-100">Delete</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  els.customersTable.innerHTML = `
    <table class="w-full min-w-[620px] bg-slate-900/40">
      <thead class="text-left text-[11px] uppercase tracking-[0.08em] text-slate-400">
        <tr>
          <th class="px-3 py-2">Name</th>
          <th class="px-3 py-2">Email</th>
          <th class="px-3 py-2 text-right">Orders</th>
          <th class="px-3 py-2 text-right">Spent</th>
          <th class="px-3 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderProductsTable() {
  const salesMap = buildProductSalesMap();

  const rows = state.products
    .map((product) => {
      const info = salesMap.get(product.id) || { sold: 0, revenue: 0, buyers: new Set() };
      return `
      <tr class="border-b border-slate-700/60 text-xs text-slate-200">
        <td class="px-3 py-2">${esc(product.name)}</td>
        <td class="px-3 py-2 text-right">${product.stockQuantity}</td>
        <td class="px-3 py-2 text-right">${info.sold}</td>
        <td class="px-3 py-2 text-right">${info.revenue.toLocaleString()}</td>
        <td class="px-3 py-2 text-right">${info.buyers.size}</td>
        <td class="px-3 py-2">
          <div class="flex flex-wrap gap-1">
            <button data-product-buyers="${product.id}" class="rounded-md border border-indigo-300/40 bg-indigo-500/20 px-2 py-1 text-[11px] font-semibold text-indigo-100">Buyers</button>
            <button data-product-edit="${product.id}" class="rounded-md border border-violet-300/40 bg-violet-500/20 px-2 py-1 text-[11px] font-semibold text-violet-100">Edit</button>
            <button data-product-delete="${product.id}" class="rounded-md border border-rose-300/40 bg-rose-500/20 px-2 py-1 text-[11px] font-semibold text-rose-100">Delete</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  els.productsTable.innerHTML = `
    <table class="w-full min-w-[700px] bg-slate-900/40">
      <thead class="text-left text-[11px] uppercase tracking-[0.08em] text-slate-400">
        <tr>
          <th class="px-3 py-2">Product</th>
          <th class="px-3 py-2 text-right">Stock</th>
          <th class="px-3 py-2 text-right">Sold</th>
          <th class="px-3 py-2 text-right">Revenue</th>
          <th class="px-3 py-2 text-right">Buyers</th>
          <th class="px-3 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function renderInsights() {
  const [buyers, products] = await Promise.all([
    api("/customer/insights/top-buyers?limit=5"),
    api("/products/insights/most-bought?limit=5"),
  ]);

  els.insightsTopBuyers.innerHTML = `
    <h3 class="heading-font text-sm font-semibold text-violet-100">Top Buyers</h3>
    <div class="mt-2 grid gap-2">
      ${(buyers || [])
        .map(
          (buyer, index) =>
            `<div class="rounded-lg border border-violet-300/20 bg-slate-900/60 p-2 text-xs text-slate-200">#${index + 1} ${esc(buyer.fullName)} • ${buyer.totalSpent.toLocaleString()} THB • ${buyer.orderCount} orders</div>`,
        )
        .join("") || '<div class="text-xs text-slate-400">No data</div>'}
    </div>`;

  els.insightsTopProducts.innerHTML = `
    <h3 class="heading-font text-sm font-semibold text-indigo-100">Top Products</h3>
    <div class="mt-2 grid gap-2">
      ${(products || [])
        .map(
          (product, index) =>
            `<div class="rounded-lg border border-indigo-300/20 bg-slate-900/60 p-2 text-xs text-slate-200">#${index + 1} ${esc(product.productName)} • sold ${product.totalQuantity} • buyers ${product.buyerCount}</div>`,
        )
        .join("") || '<div class="text-xs text-slate-400">No data</div>'}
    </div>`;
}

function openModal(title, bodyHTML) {
  els.modalTitle.textContent = title;
  els.modalBody.innerHTML = bodyHTML;
  els.modalBackdrop.classList.remove("hidden");
  els.modalBackdrop.classList.add("flex");
  els.modalBackdrop.setAttribute("aria-hidden", "false");
}

function closeModal() {
  els.modalBackdrop.classList.add("hidden");
  els.modalBackdrop.classList.remove("flex");
  els.modalBackdrop.setAttribute("aria-hidden", "true");
  els.modalBody.innerHTML = "";
}

function productFormModal(product) {
  const data = product || {
    name: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    sku: "",
    category: "ELECTRONICS",
    brand: "Apple",
    images: [""],
    status: "ACTIVE",
  };

  return `
    <form id="productModalForm" data-product-id="${esc(product?.id || "")}" class="grid gap-3 md:grid-cols-2">
      <label class="text-sm text-slate-300">Name<input id="modalProductName" required value="${esc(data.name)}" class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-slate-100" /></label>
      <label class="text-sm text-slate-300">SKU<input id="modalProductSku" required value="${esc(data.sku)}" class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-slate-100" /></label>
      <label class="text-sm text-slate-300 md:col-span-2">Description<input id="modalProductDescription" required value="${esc(data.description)}" class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-slate-100" /></label>
      <label class="text-sm text-slate-300">Price<input id="modalProductPrice" type="number" min="1" step="0.01" value="${data.price}" required class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-slate-100" /></label>
      <label class="text-sm text-slate-300">Stock<input id="modalProductStock" type="number" min="0" value="${data.stockQuantity}" required class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-slate-100" /></label>
      <label class="text-sm text-slate-300">Category
        <select id="modalProductCategory" class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-slate-100">
          <option value="ELECTRONICS" ${data.category === "ELECTRONICS" ? "selected" : ""}>ELECTRONICS</option>
          <option value="CLOTHING" ${data.category === "CLOTHING" ? "selected" : ""}>CLOTHING</option>
          <option value="HOME" ${data.category === "HOME" ? "selected" : ""}>HOME</option>
          <option value="BEAUTY" ${data.category === "BEAUTY" ? "selected" : ""}>BEAUTY</option>
          <option value="OTHER" ${data.category === "OTHER" ? "selected" : ""}>OTHER</option>
        </select>
      </label>
      <label class="text-sm text-slate-300">Status
        <select id="modalProductStatus" class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-slate-100">
          <option value="ACTIVE" ${data.status === "ACTIVE" ? "selected" : ""}>ACTIVE</option>
          <option value="OUT_OF_STOCK" ${data.status === "OUT_OF_STOCK" ? "selected" : ""}>OUT_OF_STOCK</option>
          <option value="DISCONTINUED" ${data.status === "DISCONTINUED" ? "selected" : ""}>DISCONTINUED</option>
        </select>
      </label>
      <label class="text-sm text-slate-300">Brand<input id="modalProductBrand" required value="${esc(data.brand)}" class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-slate-100" /></label>
      <label class="text-sm text-slate-300">Image URL<input id="modalProductImage" required value="${esc(data.images[0] || "")}" class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-slate-100" /></label>
      <div class="md:col-span-2 flex gap-2">
        <button type="submit" class="rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white">Save Product</button>
        <button type="button" data-modal-close class="rounded-lg border border-slate-500/60 px-4 py-2 text-sm text-slate-200">Cancel</button>
      </div>
    </form>
  `;
}

function customerFormModal(customer) {
  const data = customer || {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    status: "ACTIVE",
  };

  return `
    <form id="customerModalForm" data-customer-id="${esc(customer?.id || "")}" class="grid gap-3">
      <label class="text-sm text-slate-300">Full Name<input id="modalCustomerName" required value="${esc(data.fullName)}" class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-slate-100" /></label>
      <label class="text-sm text-slate-300">Email<input id="modalCustomerEmail" type="email" required value="${esc(data.email)}" class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-slate-100" /></label>
      <label class="text-sm text-slate-300">Phone<input id="modalCustomerPhone" required value="${esc(data.phone)}" class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-slate-100" /></label>
      <label class="text-sm text-slate-300">Address<input id="modalCustomerAddress" required value="${esc(data.address)}" class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-slate-100" /></label>
      <label class="text-sm text-slate-300">Status
        <select id="modalCustomerStatus" class="mt-1 w-full rounded-lg border border-violet-300/30 bg-slate-950/80 px-3 py-2 text-slate-100">
          <option value="ACTIVE" ${data.status === "ACTIVE" ? "selected" : ""}>ACTIVE</option>
          <option value="INACTIVE" ${data.status === "INACTIVE" ? "selected" : ""}>INACTIVE</option>
        </select>
      </label>
      <div class="flex gap-2">
        <button type="submit" class="rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white">Save Customer</button>
        <button type="button" data-modal-close class="rounded-lg border border-slate-500/60 px-4 py-2 text-sm text-slate-200">Cancel</button>
      </div>
    </form>
  `;
}

async function openCustomerOrdersModal(customerId) {
  const history = await api(`/customer/${customerId}/orders`);
  const ordersHTML = (history.orders || [])
    .map((order) => {
      const items = (order.items || [])
        .map(
          (item) => `<li class="text-xs text-slate-300">${esc(item.productName)} • qty ${item.quantity} • ${item.subtotal.toLocaleString()} THB</li>`,
        )
        .join("");

      return `
        <article class="rounded-xl border border-fuchsia-300/20 bg-slate-950/60 p-3">
          <p class="heading-font text-sm text-fuchsia-100">Order ${esc(order.id.slice(0, 8))} • ${order.status}</p>
          <p class="text-xs text-slate-400">${new Date(order.placedAt).toLocaleString()} • total ${order.totalAmount.toLocaleString()} THB</p>
          <ul class="mt-2 grid gap-1">${items}</ul>
        </article>
      `;
    })
    .join("");

  openModal(
    `Orders of ${history.customer.fullName}`,
    `<div class="grid gap-3"><?
      <div class="rounded-xl border border-fuchsia-300/20 bg-slate-950/60 p-3 text-sm text-slate-200">Total Orders: ${history.summary.totalOrders} • Total Spent: ${history.summary.totalSpent.toLocaleString()} THB</div>
      ${ordersHTML || '<div class="text-sm text-slate-400">No orders found</div>'}
    </div>`.replace("<?", ""),
  );
}

async function openProductBuyersModal(productId) {
  const rows = await api(`/products/${productId}/customers`);
  const html = (rows || [])
    .map(
      (row, index) => `
      <div class="rounded-xl border border-indigo-300/20 bg-slate-950/60 p-3 text-sm text-slate-200">
        <p class="heading-font text-indigo-100">#${index + 1} ${esc(row.fullName)}</p>
        <p class="text-xs text-slate-400">${esc(row.email)} • ${row.orderCount} orders</p>
        <p class="mt-1 text-xs">Quantity ${row.totalQuantity} • Spent ${row.totalSpent.toLocaleString()} THB</p>
      </div>`,
    )
    .join("");

  openModal(
    "Product Buyers",
    `<div class="grid gap-2">${html || '<div class="text-sm text-slate-400">No buyers yet</div>'}</div>`,
  );
}

function renderCustomerHistoryInline(history) {
  const productsHTML = (history.summary.products || [])
    .map(
      (row) =>
        `<li class="text-xs text-slate-300">${esc(row.productName)} • qty ${row.totalQuantity} • ${row.totalSpent.toLocaleString()} THB</li>`,
    )
    .join("");

  const ordersHTML = (history.orders || [])
    .map((order) => {
      const lines = (order.items || [])
        .map((item) => `${item.productName} x${item.quantity}`)
        .join(", ");
      return `<li class="text-xs text-slate-300">${order.id.slice(0, 8)} • ${order.status} • ${order.totalAmount.toLocaleString()} THB • ${esc(lines)}</li>`;
    })
    .join("");

  els.customerHistory.innerHTML = `
    <div class="grid gap-2 text-sm">
      <div class="rounded-lg border border-fuchsia-300/20 bg-slate-900/70 p-2 text-slate-200">
        <strong>${esc(history.customer.fullName)}</strong> • ${esc(history.customer.email)}
        <div class="text-xs text-slate-400">Orders: ${history.summary.totalOrders} • Total: ${history.summary.totalSpent.toLocaleString()} THB</div>
      </div>
      <div>
        <p class="mb-1 text-xs uppercase tracking-[0.08em] text-slate-400">Products in all orders</p>
        <ul class="grid gap-1">${productsHTML || '<li class="text-xs text-slate-500">No products</li>'}</ul>
      </div>
      <div>
        <p class="mb-1 text-xs uppercase tracking-[0.08em] text-slate-400">Order details</p>
        <ul class="grid gap-1">${ordersHTML || '<li class="text-xs text-slate-500">No orders</li>'}</ul>
      </div>
    </div>
  `;
}

async function loadCustomerHistory() {
  const customerId = els.historyCustomerSelect.value;
  if (!customerId) {
    return;
  }

  try {
    const history = await api(`/customer/${customerId}/orders`);
    renderCustomerHistoryInline(history);
  } catch (error) {
    showToast(error.message, true);
  }
}

async function refreshAll() {
  try {
    const [products, customers, orders] = await Promise.all([
      api("/products"),
      api("/customer"),
      api("/orders"),
    ]);

    state.products = products;
    state.customers = customers;
    state.orders = orders;

    renderStats();
    renderSelects();
    renderOrdersList();
    renderCustomersTable();
    renderProductsTable();
    await renderInsights();

    setStatus(true);
  } catch (error) {
    setStatus(false);
    showToast(error.message, true);
  }
}

async function onCreateOrder(event) {
  event.preventDefault();

  const items = collectOrderItems();
  if (!items.length) {
    showToast("Please add at least one order item", true);
    return;
  }

  const payload = {
    customerId: els.orderCustomerId.value,
    items,
    paymentMethod: els.orderPaymentMethod.value,
    shippingAddress: els.orderAddress.value,
    note: els.orderNote.value || undefined,
  };

  try {
    await api("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    showToast("Order created");
    els.orderItems.innerHTML = "";
    addOrderItemRow();
    els.orderNote.value = "";

    await refreshAll();
  } catch (error) {
    showToast(error.message, true);
  }
}

function openCreateProductModal() {
  openModal("Create Product", productFormModal(null));
}

function openCreateCustomerModal() {
  openModal("Create Customer", customerFormModal(null));
}

async function submitProductModal(form) {
  const productId = form.dataset.productId;

  const payload = {
    name: document.getElementById("modalProductName").value,
    description: document.getElementById("modalProductDescription").value,
    price: Number(document.getElementById("modalProductPrice").value),
    stockQuantity: Number(document.getElementById("modalProductStock").value),
    sku: document.getElementById("modalProductSku").value,
    category: document.getElementById("modalProductCategory").value,
    brand: document.getElementById("modalProductBrand").value,
    images: [document.getElementById("modalProductImage").value],
    status: document.getElementById("modalProductStatus").value,
  };

  if (productId) {
    await api(`/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    showToast("Product updated");
  } else {
    await api("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    showToast("Product created");
  }

  closeModal();
  await refreshAll();
}

async function submitCustomerModal(form) {
  const customerId = form.dataset.customerId;

  const payload = {
    fullName: document.getElementById("modalCustomerName").value,
    email: document.getElementById("modalCustomerEmail").value,
    phone: document.getElementById("modalCustomerPhone").value,
    address: document.getElementById("modalCustomerAddress").value,
    status: document.getElementById("modalCustomerStatus").value,
  };

  if (customerId) {
    await api(`/customer/${customerId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    showToast("Customer updated");
  } else {
    await api("/customer", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    showToast("Customer created");
  }

  closeModal();
  await refreshAll();
}

async function onClickActions(event) {
  const productEditId = event.target.dataset.productEdit;
  const productDeleteId = event.target.dataset.productDelete;
  const productBuyersId = event.target.dataset.productBuyers;

  const customerEditId = event.target.dataset.customerEdit;
  const customerDeleteId = event.target.dataset.customerDelete;
  const customerOrdersId = event.target.dataset.customerOrders;

  const orderUpdateId = event.target.dataset.orderUpdate;

  try {
    if (event.target.dataset.modalClose || event.target === els.modalBackdrop) {
      closeModal();
      return;
    }

    if (event.target.dataset.orderItemRemove) {
      event.target.closest(".grid")?.remove();
      if (!els.orderItems.querySelector("[data-order-item-product]")) {
        addOrderItemRow();
      }
      return;
    }

    if (productEditId) {
      const product = state.products.find((item) => item.id === productEditId);
      if (!product) return;
      openModal("Edit Product", productFormModal(product));
      return;
    }

    if (productDeleteId) {
      const product = state.products.find((item) => item.id === productDeleteId);
      openModal(
        "Delete Product",
        `<div class="grid gap-3 text-sm text-slate-200">
          <p>Delete <strong>${esc(product?.name || productDeleteId)}</strong> ?</p>
          <div class="flex gap-2">
            <button id="confirmDeleteProduct" class="rounded-lg bg-rose-600 px-4 py-2 text-white">Confirm Delete</button>
            <button data-modal-close class="rounded-lg border border-slate-500/60 px-4 py-2">Cancel</button>
          </div>
        </div>`,
      );
      document.getElementById("confirmDeleteProduct").addEventListener("click", async () => {
        await api(`/products/${productDeleteId}`, { method: "DELETE" });
        closeModal();
        showToast("Product deleted");
        await refreshAll();
      });
      return;
    }

    if (productBuyersId) {
      await openProductBuyersModal(productBuyersId);
      return;
    }

    if (customerEditId) {
      const customer = state.customers.find((item) => item.id === customerEditId);
      if (!customer) return;
      openModal("Edit Customer", customerFormModal(customer));
      return;
    }

    if (customerDeleteId) {
      const customer = state.customers.find((item) => item.id === customerDeleteId);
      openModal(
        "Delete Customer",
        `<div class="grid gap-3 text-sm text-slate-200">
          <p>Delete <strong>${esc(customer?.fullName || customerDeleteId)}</strong> ?</p>
          <p class="text-xs text-rose-300">If this customer has order history, API will reject this action.</p>
          <div class="flex gap-2">
            <button id="confirmDeleteCustomer" class="rounded-lg bg-rose-600 px-4 py-2 text-white">Confirm Delete</button>
            <button data-modal-close class="rounded-lg border border-slate-500/60 px-4 py-2">Cancel</button>
          </div>
        </div>`,
      );
      document.getElementById("confirmDeleteCustomer").addEventListener("click", async () => {
        await api(`/customer/${customerDeleteId}`, { method: "DELETE" });
        closeModal();
        showToast("Customer deleted");
        await refreshAll();
      });
      return;
    }

    if (customerOrdersId) {
      await openCustomerOrdersModal(customerOrdersId);
      return;
    }

    if (orderUpdateId) {
      const statusEl = document.querySelector(`[data-order-status="${orderUpdateId}"]`);
      const trackingEl = document.querySelector(`[data-order-tracking="${orderUpdateId}"]`);

      await api(`/orders/${orderUpdateId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: statusEl.value,
          trackingNumber: trackingEl.value || undefined,
        }),
      });

      showToast("Order updated");
      await refreshAll();
    }
  } catch (error) {
    showToast(error.message, true);
  }
}

async function onBodySubmit(event) {
  const productForm = event.target.closest("#productModalForm");
  const customerForm = event.target.closest("#customerModalForm");

  if (!productForm && !customerForm) {
    return;
  }

  event.preventDefault();

  try {
    if (productForm) {
      await submitProductModal(productForm);
    }

    if (customerForm) {
      await submitCustomerModal(customerForm);
    }
  } catch (error) {
    showToast(error.message, true);
  }
}

function onGlobalKeydown(event) {
  if (event.key === "Escape" && !els.modalBackdrop.classList.contains("hidden")) {
    closeModal();
  }
}

els.refreshAllBtn.addEventListener("click", refreshAll);
els.openCreateProductBtn.addEventListener("click", openCreateProductModal);
els.openCreateCustomerBtn.addEventListener("click", openCreateCustomerModal);
els.addOrderItemBtn.addEventListener("click", () => addOrderItemRow());
els.orderForm.addEventListener("submit", onCreateOrder);
els.loadHistoryBtn.addEventListener("click", loadCustomerHistory);
els.modalCloseBtn.addEventListener("click", closeModal);
document.body.addEventListener("click", onClickActions);
document.body.addEventListener("submit", onBodySubmit);
window.addEventListener("keydown", onGlobalKeydown);

addOrderItemRow("", 1);
refreshAll();
