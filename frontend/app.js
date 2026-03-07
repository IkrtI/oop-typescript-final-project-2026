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

  loadingOverlay: document.getElementById("loadingOverlay"),
  loadingText: document.getElementById("loadingText"),
  resetDataBtn: document.getElementById("resetDataBtn"),
};

/* ── Tab navigation ── */
function initTabs() {
  const tabs = document.querySelectorAll("[role=tab]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.setAttribute("aria-selected", "false");
        t.classList.remove("text-teal-700", "font-semibold");
        t.classList.add("text-stone-400", "font-medium");
      });
      tab.setAttribute("aria-selected", "true");
      tab.classList.remove("text-stone-400", "font-medium");
      tab.classList.add("text-teal-700", "font-semibold");

      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
    });
  });
}
initTabs();

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
    "pointer-events-none fixed bottom-5 right-5 z-50 rounded-lg px-4 py-2 text-sm font-semibold text-white opacity-100 transition " +
    (isError
      ? "bg-red-600 shadow-md"
      : "bg-teal-700 shadow-md");

  setTimeout(() => {
    els.toast.className =
      "pointer-events-none fixed bottom-5 right-5 z-50 rounded-lg px-4 py-2 text-sm font-semibold text-white opacity-0 transition";
  }, 2500);
}

function setStatus(ok) {
  els.apiStatus.textContent = ok ? "API: online" : "API: unavailable";
  els.apiStatus.className =
    "rounded-lg border px-3 py-2 text-xs " +
    (ok
      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
      : "border-red-300 bg-red-50 text-red-700");
}

function showLoading(text = "กำลังโหลดข้อมูล...") {
  els.loadingText.textContent = text;
  els.loadingOverlay.classList.remove("hidden");
  els.loadingOverlay.classList.add("flex");
}

function hideLoading() {
  els.loadingOverlay.classList.add("hidden");
  els.loadingOverlay.classList.remove("flex");
}

function customerName(customerId) {
  return state.customers.find((customer) => customer.id === customerId)?.fullName || customerId;
}

function isMobileView() {
  return window.innerWidth < 768;
}

function openCustomerActionSheet(customerId) {
  const customer = state.customers.find((item) => item.id === customerId);
  if (!customer) {
    return;
  }

  openModal(
    `จัดการลูกค้า: ${customer.fullName}`,
    `<div class="grid gap-2">
      <button data-customer-orders="${customerId}" class="w-full rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-left text-sm font-semibold text-teal-700">ดูออเดอร์ของลูกค้า</button>
      <button data-customer-edit="${customerId}" class="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2 text-left text-sm font-semibold text-stone-700">แก้ไขข้อมูลลูกค้า</button>
      <button data-customer-delete="${customerId}" class="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-left text-sm font-semibold text-red-600">ลบลูกค้า</button>
      <button data-modal-close class="w-full rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600">ปิด</button>
    </div>`,
  );
}

function openProductActionSheet(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  openModal(
    `จัดการสินค้า: ${product.name}`,
    `<div class="grid gap-2">
      <button data-product-buyers="${productId}" class="w-full rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-left text-sm font-semibold text-teal-700">ดูลูกค้าที่ซื้อ</button>
      <button data-product-edit="${productId}" class="w-full rounded-lg border border-stone-300 bg-stone-50 px-4 py-2 text-left text-sm font-semibold text-stone-700">แก้ไขสินค้า</button>
      <button data-product-delete="${productId}" class="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-left text-sm font-semibold text-red-600">ลบสินค้า</button>
      <button data-modal-close class="w-full rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600">ปิด</button>
    </div>`,
  );
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

  const cards = [
    ["Products", state.products.length],
    ["Customers", state.customers.length],
    ["Orders", state.orders.length],
    ["Total Revenue", `${totalRevenue.toLocaleString()} THB`],
  ];

  els.statsCards.innerHTML = cards
    .map(
      ([title, value]) => `
      <article class="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase tracking-wide text-stone-400">${title}</p>
        <p class="heading-font mt-1 text-2xl font-bold text-stone-800">${value}</p>
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
  row.className = "grid gap-2 rounded-lg border border-stone-200 bg-stone-50 p-2.5 sm:grid-cols-[1fr_100px_auto] sm:items-end";
  row.innerHTML = `
    <label class="text-xs font-medium text-stone-600">สินค้า
      <select data-order-item-product class="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2 py-2 text-sm text-stone-800">${options}</select>
    </label>
    <label class="text-xs font-medium text-stone-600">จำนวน
      <input data-order-item-qty type="number" min="1" value="${Number(quantity) || 1}" class="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2 py-2 text-sm text-stone-800" />
    </label>
    <button type="button" data-order-item-remove class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100">ลบ</button>
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
            `<li class="text-xs text-stone-500">${esc(item.productName)} • qty ${item.quantity} • ${item.subtotal.toLocaleString()} THB</li>`,
        )
        .join("");

      const statusOptions = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"]
        .map(
          (status) =>
            `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`,
        )
        .join("");

      return `
      <article class="rounded-lg border border-stone-200 bg-stone-50 p-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h4 class="heading-font text-sm font-semibold text-stone-800">${order.id.slice(0, 8)} • ${esc(customerName(order.customerId))}</h4>
          <span class="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">${order.totalAmount.toLocaleString()} THB</span>
        </div>
        <p class="mt-1 text-xs text-stone-400">${new Date(order.placedAt).toLocaleString()}</p>
        <ul class="mt-2 grid gap-0.5">${itemsHTML}</ul>

        <div class="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <select data-order-status="${order.id}" class="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs text-stone-700">${statusOptions}</select>
          <input data-order-tracking="${order.id}" value="${esc(order.trackingNumber || "")}" placeholder="tracking number" class="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs text-stone-700" />
          <button data-order-update="${order.id}" class="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-800">Update</button>
        </div>
      </article>`;
    })
    .join("");
}

function renderCustomersTable() {
  const salesMap = buildCustomerSalesMap();

  if (isMobileView()) {
    const cards = state.customers
      .map((customer) => {
        const info = salesMap.get(customer.id) || { orderCount: 0, totalSpent: 0 };
        return `
        <button type="button" data-customer-actions="${customer.id}" class="w-full rounded-lg border border-stone-200 bg-white p-3 text-left transition hover:bg-stone-50">
          <p class="text-sm font-semibold text-stone-800">${esc(customer.fullName)}</p>
          <p class="text-xs text-stone-500">${esc(customer.email)}</p>
          <div class="mt-2 flex items-center justify-between text-xs text-stone-500">
            <span>${info.orderCount} orders</span>
            <span>${info.totalSpent.toLocaleString()} THB</span>
          </div>
        </button>`;
      })
      .join("");

    els.customersTable.innerHTML = `
      <div class="grid gap-2 p-2">
        ${cards || '<p class="p-2 text-sm text-stone-400">No customers</p>'}
      </div>
    `;
    return;
  }

  const rows = state.customers
    .map((customer) => {
      const info = salesMap.get(customer.id) || { orderCount: 0, totalSpent: 0 };
      return `
      <tr class="border-b border-stone-100 text-sm text-stone-700">
        <td class="px-3 py-2.5">${esc(customer.fullName)}</td>
        <td class="px-3 py-2.5 text-stone-500">${esc(customer.email)}</td>
        <td class="px-3 py-2.5 text-right">${info.orderCount}</td>
        <td class="px-3 py-2.5 text-right">${info.totalSpent.toLocaleString()}</td>
        <td class="px-3 py-2.5">
          <div class="flex flex-wrap gap-1">
            <button data-customer-orders="${customer.id}" class="rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700 transition hover:bg-teal-100">Orders</button>
            <button data-customer-edit="${customer.id}" class="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-semibold text-stone-600 transition hover:bg-stone-100">Edit</button>
            <button data-customer-delete="${customer.id}" class="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 transition hover:bg-red-100">Delete</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  els.customersTable.innerHTML = `
    <table class="w-full min-w-[600px]">
      <thead class="bg-stone-50 text-left text-[11px] font-semibold uppercase tracking-wide text-stone-400">
        <tr>
          <th class="px-3 py-2.5">Name</th>
          <th class="px-3 py-2.5">Email</th>
          <th class="px-3 py-2.5 text-right">Orders</th>
          <th class="px-3 py-2.5 text-right">Spent</th>
          <th class="px-3 py-2.5">Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderProductsTable() {
  const salesMap = buildProductSalesMap();

  if (isMobileView()) {
    const cards = state.products
      .map((product) => {
        const info = salesMap.get(product.id) || { sold: 0, revenue: 0, buyers: new Set() };
        return `
        <button type="button" data-product-actions="${product.id}" class="w-full rounded-lg border border-stone-200 bg-white p-3 text-left transition hover:bg-stone-50">
          <p class="text-sm font-semibold text-stone-800">${esc(product.name)}</p>
          <div class="mt-1 grid grid-cols-2 gap-1 text-xs text-stone-500">
            <span>Stock: ${product.stockQuantity}</span>
            <span>Sold: ${info.sold}</span>
            <span>Buyers: ${info.buyers.size}</span>
            <span>Revenue: ${info.revenue.toLocaleString()}</span>
          </div>
        </button>`;
      })
      .join("");

    els.productsTable.innerHTML = `
      <div class="grid gap-2 p-2">
        ${cards || '<p class="p-2 text-sm text-stone-400">No products</p>'}
      </div>
    `;
    return;
  }

  const rows = state.products
    .map((product) => {
      const info = salesMap.get(product.id) || { sold: 0, revenue: 0, buyers: new Set() };
      return `
      <tr class="border-b border-stone-100 text-sm text-stone-700">
        <td class="px-3 py-2.5">${esc(product.name)}</td>
        <td class="px-3 py-2.5 text-right">${product.stockQuantity}</td>
        <td class="px-3 py-2.5 text-right">${info.sold}</td>
        <td class="px-3 py-2.5 text-right">${info.revenue.toLocaleString()}</td>
        <td class="px-3 py-2.5 text-right">${info.buyers.size}</td>
        <td class="px-3 py-2.5">
          <div class="flex flex-wrap gap-1">
            <button data-product-buyers="${product.id}" class="rounded-md border border-teal-200 bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700 transition hover:bg-teal-100">Buyers</button>
            <button data-product-edit="${product.id}" class="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-semibold text-stone-600 transition hover:bg-stone-100">Edit</button>
            <button data-product-delete="${product.id}" class="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 transition hover:bg-red-100">Delete</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  els.productsTable.innerHTML = `
    <table class="w-full min-w-[680px]">
      <thead class="bg-stone-50 text-left text-[11px] font-semibold uppercase tracking-wide text-stone-400">
        <tr>
          <th class="px-3 py-2.5">Product</th>
          <th class="px-3 py-2.5 text-right">Stock</th>
          <th class="px-3 py-2.5 text-right">Sold</th>
          <th class="px-3 py-2.5 text-right">Revenue</th>
          <th class="px-3 py-2.5 text-right">Buyers</th>
          <th class="px-3 py-2.5">Actions</th>
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
    <div class="grid gap-2">
      ${(buyers || [])
        .map(
          (buyer, index) =>
            `<div class="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
              <p class="font-semibold text-stone-800">#${index + 1} ${esc(buyer.fullName)}</p>
              <p class="mt-0.5 text-xs text-stone-500">${buyer.totalSpent.toLocaleString()} THB • ${buyer.orderCount} orders</p>
            </div>`,
        )
        .join("") || '<div class="text-sm text-stone-400">No data</div>'}
    </div>`;

  els.insightsTopProducts.innerHTML = `
    <div class="grid gap-2">
      ${(products || [])
        .map(
          (product, index) =>
            `<div class="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
              <p class="font-semibold text-stone-800">#${index + 1} ${esc(product.productName)}</p>
              <p class="mt-0.5 text-xs text-stone-500">sold ${product.totalQuantity} • buyers ${product.buyerCount}</p>
            </div>`,
        )
        .join("") || '<div class="text-sm text-stone-400">No data</div>'}
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
      <label class="text-sm font-medium text-stone-600">Name<input id="modalProductName" required value="${esc(data.name)}" class="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-800" /></label>
      <label class="text-sm font-medium text-stone-600">SKU<input id="modalProductSku" required value="${esc(data.sku)}" class="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-800" /></label>
      <label class="text-sm font-medium text-stone-600 md:col-span-2">Description<input id="modalProductDescription" required value="${esc(data.description)}" class="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-800" /></label>
      <label class="text-sm font-medium text-stone-600">Price<input id="modalProductPrice" type="number" min="1" step="0.01" value="${data.price}" required class="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-800" /></label>
      <label class="text-sm font-medium text-stone-600">Stock<input id="modalProductStock" type="number" min="0" value="${data.stockQuantity}" required class="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-800" /></label>
      <label class="text-sm font-medium text-stone-600">Category
        <select id="modalProductCategory" class="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-800">
          <option value="ELECTRONICS" ${data.category === "ELECTRONICS" ? "selected" : ""}>ELECTRONICS</option>
          <option value="CLOTHING" ${data.category === "CLOTHING" ? "selected" : ""}>CLOTHING</option>
          <option value="HOME" ${data.category === "HOME" ? "selected" : ""}>HOME</option>
          <option value="BEAUTY" ${data.category === "BEAUTY" ? "selected" : ""}>BEAUTY</option>
          <option value="OTHER" ${data.category === "OTHER" ? "selected" : ""}>OTHER</option>
        </select>
      </label>
      <label class="text-sm font-medium text-stone-600">Status
        <select id="modalProductStatus" class="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-800">
          <option value="ACTIVE" ${data.status === "ACTIVE" ? "selected" : ""}>ACTIVE</option>
          <option value="OUT_OF_STOCK" ${data.status === "OUT_OF_STOCK" ? "selected" : ""}>OUT_OF_STOCK</option>
          <option value="DISCONTINUED" ${data.status === "DISCONTINUED" ? "selected" : ""}>DISCONTINUED</option>
        </select>
      </label>
      <label class="text-sm font-medium text-stone-600">Brand<input id="modalProductBrand" required value="${esc(data.brand)}" class="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-800" /></label>
      <label class="text-sm font-medium text-stone-600">Image URL<input id="modalProductImage" required value="${esc(data.images[0] || "")}" class="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-800" /></label>
      <div class="md:col-span-2 flex gap-2">
        <button type="submit" class="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800">Save Product</button>
        <button type="button" data-modal-close class="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 transition hover:bg-stone-100">Cancel</button>
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
      <label class="text-sm font-medium text-stone-600">Full Name<input id="modalCustomerName" required value="${esc(data.fullName)}" class="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-800" /></label>
      <label class="text-sm font-medium text-stone-600">Email<input id="modalCustomerEmail" type="email" required value="${esc(data.email)}" class="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-800" /></label>
      <label class="text-sm font-medium text-stone-600">Phone<input id="modalCustomerPhone" required value="${esc(data.phone)}" class="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-800" /></label>
      <label class="text-sm font-medium text-stone-600">Address<input id="modalCustomerAddress" required value="${esc(data.address)}" class="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-800" /></label>
      <label class="text-sm font-medium text-stone-600">Status
        <select id="modalCustomerStatus" class="mt-1 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-800">
          <option value="ACTIVE" ${data.status === "ACTIVE" ? "selected" : ""}>ACTIVE</option>
          <option value="INACTIVE" ${data.status === "INACTIVE" ? "selected" : ""}>INACTIVE</option>
        </select>
      </label>
      <div class="flex gap-2">
        <button type="submit" class="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800">Save Customer</button>
        <button type="button" data-modal-close class="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 transition hover:bg-stone-100">Cancel</button>
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
          (item) => `<li class="text-xs text-stone-500">${esc(item.productName)} • qty ${item.quantity} • ${item.subtotal.toLocaleString()} THB</li>`,
        )
        .join("");

      return `
        <article class="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <p class="heading-font text-sm font-semibold text-stone-800">Order ${esc(order.id.slice(0, 8))} • ${order.status}</p>
          <p class="text-xs text-stone-400">${new Date(order.placedAt).toLocaleString()} • total ${order.totalAmount.toLocaleString()} THB</p>
          <ul class="mt-2 grid gap-1">${items}</ul>
        </article>
      `;
    })
    .join("");

  openModal(
    `Orders of ${history.customer.fullName}`,
    `<div class="grid gap-3">
      <div class="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">Total Orders: ${history.summary.totalOrders} • Total Spent: ${history.summary.totalSpent.toLocaleString()} THB</div>
      ${ordersHTML || '<div class="text-sm text-stone-400">No orders found</div>'}
    </div>`,
  );
}

async function openProductBuyersModal(productId) {
  const rows = await api(`/products/${productId}/customers`);
  const html = (rows || [])
    .map(
      (row, index) => `
      <div class="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
        <p class="heading-font font-semibold text-stone-800">#${index + 1} ${esc(row.fullName)}</p>
        <p class="text-xs text-stone-400">${esc(row.email)} • ${row.orderCount} orders</p>
        <p class="mt-1 text-xs">Quantity ${row.totalQuantity} • Spent ${row.totalSpent.toLocaleString()} THB</p>
      </div>`,
    )
    .join("");

  openModal(
    "Product Buyers",
    `<div class="grid gap-2">${html || '<div class="text-sm text-stone-400">No buyers yet</div>'}</div>`,
  );
}

function renderCustomerHistoryInline(history) {
  const productsHTML = (history.summary.products || [])
    .map(
      (row) =>
        `<li class="text-xs text-stone-500">${esc(row.productName)} • qty ${row.totalQuantity} • ${row.totalSpent.toLocaleString()} THB</li>`,
    )
    .join("");

  const ordersHTML = (history.orders || [])
    .map((order) => {
      const lines = (order.items || [])
        .map((item) => `${item.productName} x${item.quantity}`)
        .join(", ");
      return `<li class="text-xs text-stone-500">${order.id.slice(0, 8)} • ${order.status} • ${order.totalAmount.toLocaleString()} THB • ${esc(lines)}</li>`;
    })
    .join("");

  els.customerHistory.innerHTML = `
    <div class="grid gap-3 text-sm">
      <div class="rounded-lg border border-stone-200 bg-white p-3 text-stone-700">
        <strong class="text-stone-800">${esc(history.customer.fullName)}</strong> • ${esc(history.customer.email)}
        <div class="text-xs text-stone-400 mt-0.5">Orders: ${history.summary.totalOrders} • Total: ${history.summary.totalSpent.toLocaleString()} THB</div>
      </div>
      <div>
        <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">Products in all orders</p>
        <ul class="grid gap-1">${productsHTML || '<li class="text-xs text-stone-400">No products</li>'}</ul>
      </div>
      <div>
        <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">Order details</p>
        <ul class="grid gap-1">${ordersHTML || '<li class="text-xs text-stone-400">No orders</li>'}</ul>
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

async function refreshAll(showOverlay = false) {
  if (showOverlay) showLoading();
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
  } finally {
    if (showOverlay) hideLoading();
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
  const customerActionCard = event.target.closest("[data-customer-actions]");
  const productActionCard = event.target.closest("[data-product-actions]");

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

    if (customerActionCard && !event.target.dataset.customerOrders && !event.target.dataset.customerEdit && !event.target.dataset.customerDelete) {
      openCustomerActionSheet(customerActionCard.dataset.customerActions);
      return;
    }

    if (productActionCard && !event.target.dataset.productBuyers && !event.target.dataset.productEdit && !event.target.dataset.productDelete) {
      openProductActionSheet(productActionCard.dataset.productActions);
      return;
    }

    if ("orderItemRemove" in event.target.dataset) {
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
        `<div class="grid gap-3 text-sm text-stone-700">
          <p>Delete <strong>${esc(product?.name || productDeleteId)}</strong> ?</p>
          <div class="flex gap-2">
            <button id="confirmDeleteProduct" class="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700">Confirm Delete</button>
            <button data-modal-close class="rounded-lg border border-stone-300 px-4 py-2 text-stone-600 transition hover:bg-stone-100">Cancel</button>
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
        `<div class="grid gap-3 text-sm text-stone-700">
          <p>Delete <strong>${esc(customer?.fullName || customerDeleteId)}</strong> ?</p>
          <p class="text-xs text-red-500">If this customer has order history, API will reject this action.</p>
          <div class="flex gap-2">
            <button id="confirmDeleteCustomer" class="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700">Confirm Delete</button>
            <button data-modal-close class="rounded-lg border border-stone-300 px-4 py-2 text-stone-600 transition hover:bg-stone-100">Cancel</button>
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

let lastViewportBucket = isMobileView();
function onViewportResize() {
  const nowMobile = isMobileView();
  if (nowMobile === lastViewportBucket) {
    return;
  }

  lastViewportBucket = nowMobile;
  renderCustomersTable();
  renderProductsTable();
}

/* ── Default seed data ── */
const DEFAULT_CUSTOMERS = [
  { fullName: "Somchai Applefan",  email: "somchai.applefan@example.com",  phone: "0810000000", address: "10 Apple Avenue, Bangkok 10100", status: "ACTIVE" },
  { fullName: "Arisa Tech",        email: "arisa.tech@example.com",        phone: "0810137910", address: "11 Apple Avenue, Bangkok 10101", status: "ACTIVE" },
  { fullName: "Narin Pro",         email: "narin.pro@example.com",         phone: "0810275820", address: "12 Apple Avenue, Bangkok 10102", status: "ACTIVE" },
  { fullName: "Kanya Device",      email: "kanya.device@example.com",      phone: "0810413730", address: "13 Apple Avenue, Bangkok 10103", status: "ACTIVE" },
  { fullName: "Preecha Studio",    email: "preecha.studio@example.com",    phone: "0810551640", address: "14 Apple Avenue, Bangkok 10104", status: "ACTIVE" },
  { fullName: "Mali Creator",      email: "mali.creator@example.com",      phone: "0810689550", address: "15 Apple Avenue, Bangkok 10105", status: "ACTIVE" },
  { fullName: "Thanawat Office",   email: "thanawat.office@example.com",   phone: "0810827460", address: "16 Apple Avenue, Bangkok 10106", status: "ACTIVE" },
  { fullName: "Suda Mobile",       email: "suda.mobile@example.com",       phone: "0810965370", address: "17 Apple Avenue, Bangkok 10107", status: "ACTIVE" },
  { fullName: "Anan Premium",      email: "anan.premium@example.com",      phone: "0811103280", address: "18 Apple Avenue, Bangkok 10108", status: "ACTIVE" },
  { fullName: "Nicha Education",   email: "nicha.education@example.com",   phone: "0811241190", address: "19 Apple Avenue, Bangkok 10109", status: "ACTIVE" },
  { fullName: "Phuri Developer",   email: "phuri.dev@example.com",         phone: "0811379100", address: "20 Apple Avenue, Bangkok 10110", status: "ACTIVE" },
  { fullName: "Dao Business",      email: "dao.business@example.com",      phone: "0811517010", address: "21 Apple Avenue, Bangkok 10111", status: "ACTIVE" },
];

const DEFAULT_PRODUCTS = [
  { name: "iPhone 15",           price: 28900,  stockQuantity: 42, sku: "APPLE-001", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/001.jpg"], description: "iPhone 15 original Apple device with official Thailand warranty",          status: "ACTIVE" },
  { name: "iPhone 15 Plus",      price: 32900,  stockQuantity: 35, sku: "APPLE-002", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/002.jpg"], description: "iPhone 15 Plus original Apple device with official Thailand warranty",     status: "ACTIVE" },
  { name: "iPhone 15 Pro",       price: 41900,  stockQuantity: 28, sku: "APPLE-003", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/003.jpg"], description: "iPhone 15 Pro original Apple device with official Thailand warranty",      status: "ACTIVE" },
  { name: "iPhone 15 Pro Max",   price: 48900,  stockQuantity: 25, sku: "APPLE-004", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/004.jpg"], description: "iPhone 15 Pro Max original Apple device with official Thailand warranty", status: "ACTIVE" },
  { name: "iPhone 14",           price: 24900,  stockQuantity: 31, sku: "APPLE-005", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/005.jpg"], description: "iPhone 14 original Apple device with official Thailand warranty",          status: "ACTIVE" },
  { name: "iPhone 14 Plus",      price: 28900,  stockQuantity: 22, sku: "APPLE-006", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/006.jpg"], description: "iPhone 14 Plus original Apple device with official Thailand warranty",     status: "ACTIVE" },
  { name: "iPhone SE (3rd Gen)", price: 15900,  stockQuantity: 17, sku: "APPLE-007", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/007.jpg"], description: "iPhone SE (3rd Gen) original Apple device with official Thailand warranty", status: "ACTIVE" },
  { name: "iPad 10th Gen",       price: 13900,  stockQuantity: 27, sku: "APPLE-008", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/008.jpg"], description: "iPad 10th Gen original Apple device with official Thailand warranty",      status: "ACTIVE" },
  { name: "iPad Air M2",         price: 23900,  stockQuantity: 20, sku: "APPLE-009", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/009.jpg"], description: "iPad Air M2 original Apple device with official Thailand warranty",        status: "ACTIVE" },
  { name: "iPad Pro 11 M4",      price: 39900,  stockQuantity: 16, sku: "APPLE-010", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/010.jpg"], description: "iPad Pro 11 M4 original Apple device with official Thailand warranty",     status: "ACTIVE" },
  { name: "iPad Pro 13 M4",      price: 47900,  stockQuantity: 12, sku: "APPLE-011", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/011.jpg"], description: "iPad Pro 13 M4 original Apple device with official Thailand warranty",     status: "ACTIVE" },
  { name: "iPad mini",           price: 19900,  stockQuantity: 18, sku: "APPLE-012", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/012.jpg"], description: "iPad mini original Apple device with official Thailand warranty",           status: "ACTIVE" },
  { name: "MacBook Air 13 M3",   price: 38900,  stockQuantity: 14, sku: "APPLE-013", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/013.jpg"], description: "MacBook Air 13 M3 original Apple device with official Thailand warranty",  status: "ACTIVE" },
  { name: "MacBook Air 15 M3",   price: 45900,  stockQuantity: 10, sku: "APPLE-014", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/014.jpg"], description: "MacBook Air 15 M3 original Apple device with official Thailand warranty",  status: "ACTIVE" },
  { name: "MacBook Pro 14 M3",   price: 62900,  stockQuantity: 9,  sku: "APPLE-015", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/015.jpg"], description: "MacBook Pro 14 M3 original Apple device with official Thailand warranty",  status: "ACTIVE" },
  { name: "MacBook Pro 16 M3 Max", price: 119900, stockQuantity: 6, sku: "APPLE-016", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/016.jpg"], description: "MacBook Pro 16 M3 Max original Apple device with official Thailand warranty", status: "ACTIVE" },
  { name: "iMac 24 M3",          price: 49900,  stockQuantity: 11, sku: "APPLE-017", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/017.jpg"], description: "iMac 24 M3 original Apple device with official Thailand warranty",          status: "ACTIVE" },
  { name: "Mac mini M2",         price: 20900,  stockQuantity: 13, sku: "APPLE-018", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/018.jpg"], description: "Mac mini M2 original Apple device with official Thailand warranty",         status: "ACTIVE" },
  { name: "Mac Studio M2 Max",   price: 74900,  stockQuantity: 5,  sku: "APPLE-019", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/019.jpg"], description: "Mac Studio M2 Max original Apple device with official Thailand warranty",   status: "OUT_OF_STOCK" },
  { name: "Mac Pro M2 Ultra",    price: 229900, stockQuantity: 2,  sku: "APPLE-020", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/020.jpg"], description: "Mac Pro M2 Ultra original Apple device with official Thailand warranty",    status: "OUT_OF_STOCK" },
  { name: "Apple Watch SE",      price: 9490,   stockQuantity: 30, sku: "APPLE-021", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/021.jpg"], description: "Apple Watch SE original Apple device with official Thailand warranty",      status: "ACTIVE" },
  { name: "Apple Watch Series 9",price: 15900,  stockQuantity: 26, sku: "APPLE-022", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/022.jpg"], description: "Apple Watch Series 9 original Apple device with official Thailand warranty",status: "ACTIVE" },
  { name: "Apple Watch Ultra 2", price: 31900,  stockQuantity: 8,  sku: "APPLE-023", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/023.jpg"], description: "Apple Watch Ultra 2 original Apple device with official Thailand warranty", status: "ACTIVE" },
  { name: "AirPods 2",           price: 4990,   stockQuantity: 40, sku: "APPLE-024", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/024.jpg"], description: "AirPods 2 original Apple device with official Thailand warranty",           status: "ACTIVE" },
  { name: "AirPods 3",           price: 6790,   stockQuantity: 34, sku: "APPLE-025", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/025.jpg"], description: "AirPods 3 original Apple device with official Thailand warranty",           status: "ACTIVE" },
  { name: "AirPods Pro 2",       price: 8990,   stockQuantity: 37, sku: "APPLE-026", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/026.jpg"], description: "AirPods Pro 2 original Apple device with official Thailand warranty",       status: "ACTIVE" },
  { name: "AirPods Max",         price: 19900,  stockQuantity: 7,  sku: "APPLE-027", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/027.jpg"], description: "AirPods Max original Apple device with official Thailand warranty",         status: "ACTIVE" },
  { name: "HomePod mini",        price: 3990,   stockQuantity: 33, sku: "APPLE-028", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/028.jpg"], description: "HomePod mini original Apple device with official Thailand warranty",        status: "ACTIVE" },
  { name: "Apple TV 4K",         price: 5990,   stockQuantity: 21, sku: "APPLE-029", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/029.jpg"], description: "Apple TV 4K original Apple device with official Thailand warranty",         status: "ACTIVE" },
  { name: "Magic Keyboard",      price: 3790,   stockQuantity: 24, sku: "APPLE-030", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/030.jpg"], description: "Magic Keyboard original Apple device with official Thailand warranty",      status: "ACTIVE" },
  { name: "Magic Mouse",         price: 2690,   stockQuantity: 29, sku: "APPLE-031", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/031.jpg"], description: "Magic Mouse original Apple device with official Thailand warranty",         status: "ACTIVE" },
  { name: "Studio Display",      price: 54900,  stockQuantity: 4,  sku: "APPLE-032", category: "ELECTRONICS", brand: "Apple", images: ["https://example.com/apple/032.jpg"], description: "Studio Display original Apple device with official Thailand warranty",      status: "OUT_OF_STOCK" },
];

async function clearAllData() {
  showLoading("กำลังลบข้อมูลทั้งหมด...");
  try {
    await Promise.all(state.orders.map((o) => api(`/orders/${o.id}`, { method: "DELETE" })));
    await Promise.all(state.customers.map((c) => api(`/customer/${c.id}`, { method: "DELETE" })));
    await Promise.all(state.products.map((p) => api(`/products/${p.id}`, { method: "DELETE" })));
    await refreshAll();
    showToast("ลบข้อมูลทั้งหมดเรียบร้อยแล้ว");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    hideLoading();
  }
}

async function seedDefaultData() {
  showLoading("กำลังโหลด Default Data...");
  try {
    // สร้าง customers และ products พร้อมกัน → เก็บ object ที่ API return (มี id)
    const [createdCustomers, createdProducts] = await Promise.all([
      Promise.all(DEFAULT_CUSTOMERS.map((c) => api("/customer", { method: "POST", body: JSON.stringify(c) }))),
      Promise.all(DEFAULT_PRODUCTS.map((p) => api("/products", { method: "POST", body: JSON.stringify(p) }))),
    ]);

    // สร้าง 24 orders โดยใช้ id จริงที่ API assign ให้ (sequential เพื่อป้องกัน stock race)
    showLoading("กำลังสร้าง Orders...");
    const orderPayloads = generateOrderPayloads(createdCustomers, createdProducts);
    for (const payload of orderPayloads) {
      await api("/orders", { method: "POST", body: JSON.stringify(payload) });
    }

    await refreshAll();
    showToast("โหลด Default Data เรียบร้อยแล้ว (ลูกค้า 12 • สินค้า 32 • Orders 24)");
  } catch (error) {
    showToast(error.message, true);
  } finally {
    hideLoading();
  }
}

function generateOrderPayloads(customers, products) {
  const paymentMethods = ["CREDIT_CARD", "BANK_TRANSFER", "COD"];
  const payloads = [];

  for (let i = 0; i < 24; i++) {
    const customer = customers[i % customers.length];
    const firstProduct = products[i % products.length];
    const secondProduct = products[(i * 3 + 5) % products.length];

    const firstQty = (i % 3) + 1;
    const secondQty = ((i + 1) % 2) + 1;

    const items = [{ productId: firstProduct.id, quantity: firstQty }];
    if (i % 2 === 0) {
      items.push({ productId: secondProduct.id, quantity: secondQty });
    }

    payloads.push({
      customerId: customer.id,
      items,
      paymentMethod: paymentMethods[i % paymentMethods.length],
      shippingAddress: customer.address,
      note: i % 5 === 0 ? "Priority customer" : undefined,
    });
  }

  return payloads;
}

function openResetDataModal() {
  openModal(
    "จัดการข้อมูล",
    `<div class="grid gap-3 text-sm text-stone-700">
      <p class="text-xs text-stone-500">เลือกการดำเนินการที่ต้องการ</p>
      <div class="grid gap-2">
        <button id="confirmSeedData" class="w-full rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-left text-sm font-semibold text-teal-700 transition hover:bg-teal-100">
          โหลด Default Data
          <p class="mt-0.5 text-xs font-normal text-teal-600">เพิ่ม 12 ลูกค้า + 32 สินค้า + 24 Orders (Apple) ลงในระบบ</p>
        </button>
        <button id="confirmClearData" class="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-100">
          Clear All Data
          <p class="mt-0.5 text-xs font-normal text-red-400">ลบ orders, customers, products ทั้งหมดออกจากระบบ</p>
        </button>
        <button data-modal-close class="w-full rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 transition hover:bg-stone-100">ปิด</button>
      </div>
    </div>`,
  );

  document.getElementById("confirmSeedData").addEventListener("click", () => {
    closeModal();
    seedDefaultData();
  });

  document.getElementById("confirmClearData").addEventListener("click", () => {
    closeModal();
    clearAllData();
  });
}

els.refreshAllBtn.addEventListener("click", refreshAll);
els.resetDataBtn.addEventListener("click", openResetDataModal);
els.openCreateProductBtn.addEventListener("click", openCreateProductModal);
els.openCreateCustomerBtn.addEventListener("click", openCreateCustomerModal);
els.addOrderItemBtn.addEventListener("click", () => addOrderItemRow());
els.orderForm.addEventListener("submit", onCreateOrder);
els.loadHistoryBtn.addEventListener("click", loadCustomerHistory);
els.modalCloseBtn.addEventListener("click", closeModal);
document.body.addEventListener("click", onClickActions);
document.body.addEventListener("submit", onBodySubmit);
window.addEventListener("keydown", onGlobalKeydown);
window.addEventListener("resize", onViewportResize);

addOrderItemRow("", 1);
refreshAll(true);
