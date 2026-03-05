const API = '';

const state = {
  products: [],
  customers: [],
  orders: [],
};

const els = {
  apiStatus: document.getElementById('apiStatus'),
  toast: document.getElementById('toast'),
  statsCards: document.getElementById('statsCards'),
  refreshAllBtn: document.getElementById('refreshAllBtn'),
  ordersList: document.getElementById('ordersList'),
  productsTable: document.getElementById('productsTable'),
  customersTable: document.getElementById('customersTable'),
  customerHistory: document.getElementById('customerHistory'),
  insightsTopBuyers: document.getElementById('insightsTopBuyers'),
  insightsTopProducts: document.getElementById('insightsTopProducts'),

  orderForm: document.getElementById('createOrderForm'),
  orderCustomerId: document.getElementById('orderCustomerId'),
  orderItems: document.getElementById('orderItems'),
  addOrderItemBtn: document.getElementById('addOrderItemBtn'),
  orderPaymentMethod: document.getElementById('orderPaymentMethod'),
  orderAddress: document.getElementById('orderAddress'),
  orderNote: document.getElementById('orderNote'),

  historyCustomerSelect: document.getElementById('historyCustomerSelect'),
  loadHistoryBtn: document.getElementById('loadHistoryBtn'),

  productForm: document.getElementById('productForm'),
  productId: document.getElementById('productId'),
  productName: document.getElementById('productName'),
  productDescription: document.getElementById('productDescription'),
  productPrice: document.getElementById('productPrice'),
  productStock: document.getElementById('productStock'),
  productSku: document.getElementById('productSku'),
  productCategory: document.getElementById('productCategory'),
  productBrand: document.getElementById('productBrand'),
  productImage: document.getElementById('productImage'),
  productStatus: document.getElementById('productStatus'),
  resetProductFormBtn: document.getElementById('resetProductFormBtn'),

  customerForm: document.getElementById('customerForm'),
  customerId: document.getElementById('customerId'),
  customerName: document.getElementById('customerName'),
  customerEmail: document.getElementById('customerEmail'),
  customerPhone: document.getElementById('customerPhone'),
  customerAddress: document.getElementById('customerAddress'),
  customerStatus: document.getElementById('customerStatus'),
  resetCustomerFormBtn: document.getElementById('resetCustomerFormBtn'),

  modalBackdrop: document.getElementById('modalBackdrop'),
  modalTitle: document.getElementById('modalTitle'),
  modalBody: document.getElementById('modalBody'),
  modalCloseBtn: document.getElementById('modalCloseBtn'),
};

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message || 'Request failed';
    throw new Error(message);
  }

  return body.data;
}

function showToast(message, isError = false) {
  els.toast.textContent = message;
  els.toast.style.background = isError ? '#991b1b' : '#0f172a';
  els.toast.classList.add('show');
  setTimeout(() => els.toast.classList.remove('show'), 2200);
}

function setStatus(ok) {
  els.apiStatus.textContent = ok ? 'API: online' : 'API: unavailable';
  els.apiStatus.style.color = ok ? '#166534' : '#991b1b';
}

function renderStats() {
  const totalRevenue = state.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const html = [
    ['Products', state.products.length],
    ['Customers', state.customers.length],
    ['Orders', state.orders.length],
    ['Total Revenue', `${totalRevenue.toLocaleString()} THB`],
  ]
    .map(
      ([name, value]) => `<article class="stat"><p>${name}</p><div class="value">${value}</div></article>`,
    )
    .join('');

  els.statsCards.innerHTML = html;
}

function customerName(customerId) {
  return state.customers.find((customer) => customer.id === customerId)?.fullName || customerId;
}

function productName(productId) {
  return state.products.find((product) => product.id === productId)?.name || productId;
}

function renderOrdersList() {
  const sorted = [...state.orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  els.ordersList.innerHTML = sorted
    .map((order) => {
      const actions = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED']
        .map(
          (status) =>
            `<option value="${status}" ${status === order.status ? 'selected' : ''}>${status}</option>`,
        )
        .join('');

      return `
      <article class="list-item">
        <h3>${order.id.slice(0, 8)} • ${customerName(order.customerId)}</h3>
        <p class="meta">${new Date(order.placedAt).toLocaleString()} • ${order.totalAmount} THB</p>
        <p class="meta">${order.items.map((item) => `${item.productName} x${item.quantity}`).join(', ')}</p>
        <div class="button-row" style="margin-top:8px;">
          <select data-order-status="${order.id}">${actions}</select>
          <input placeholder="tracking" value="${order.trackingNumber || ''}" data-order-tracking="${order.id}" />
          <button class="btn ghost" data-order-update="${order.id}">Update</button>
        </div>
      </article>`;
    })
    .join('');
}

function renderProductsTable() {
  const rows = state.products
    .map(
      (product) => `
    <tr>
      <td>${product.name}</td>
      <td>${product.price}</td>
      <td>${product.stockQuantity}</td>
      <td>${product.sku}</td>
      <td>${product.category}</td>
      <td><span class="pill ${product.status === 'ACTIVE' ? 'good' : 'bad'}">${product.status}</span></td>
      <td>
        <button class="btn ghost" data-product-edit="${product.id}">Edit</button>
        <button class="btn ghost" data-product-delete="${product.id}">Delete</button>
      </td>
    </tr>`,
    )
    .join('');

  els.productsTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th><th>Price</th><th>Stock</th><th>SKU</th><th>Category</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderCustomersTable() {
  const rows = state.customers
    .map(
      (customer) => `
    <tr>
      <td>${customer.fullName}</td>
      <td>${customer.email}</td>
      <td>${customer.phone}</td>
      <td><span class="pill ${customer.status === 'ACTIVE' ? 'good' : 'bad'}">${customer.status}</span></td>
      <td>
        <button class="btn ghost" data-customer-edit="${customer.id}">Edit</button>
        <button class="btn ghost" data-customer-delete="${customer.id}">Delete</button>
      </td>
    </tr>`,
    )
    .join('');

  els.customersTable.innerHTML = `
    <table>
      <thead>
        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderSelects() {
  const customerOptions = state.customers
    .map((customer) => `<option value="${customer.id}">${customer.fullName} (${customer.id})</option>`)
    .join('');

  els.orderCustomerId.innerHTML = customerOptions;
  els.historyCustomerSelect.innerHTML = customerOptions;
  renderOrderItemSelectors();
}

function productOptionsHTML(selectedProductId = '') {
  return state.products
    .map(
      (product) =>
        `<option value="${product.id}" ${product.id === selectedProductId ? 'selected' : ''}>${esc(product.name)} • stock ${product.stockQuantity}</option>`,
    )
    .join('');
}

function addOrderItemRow(selectedProductId = '', quantity = 1, showError = true) {
  if (!state.products.length) {
    if (showError) {
      showToast('No product available for ordering', true);
    }
    return;
  }

  const row = document.createElement('div');
  row.className = 'order-item-row';
  row.innerHTML = `
    <label>สินค้า
      <select data-order-item-product required>
        ${productOptionsHTML(selectedProductId || state.products[0].id)}
      </select>
    </label>
    <label>จำนวน
      <input data-order-item-qty type="number" min="1" value="${Number(quantity) || 1}" required />
    </label>
    <button class="btn ghost" data-order-item-remove type="button">ลบ</button>
  `;
  els.orderItems.appendChild(row);
}

function ensureOrderItemRows() {
  if (!els.orderItems.querySelector('[data-order-item-product]')) {
    addOrderItemRow('', 1, false);
  }
}

function renderOrderItemSelectors() {
  const rows = [...els.orderItems.querySelectorAll('.order-item-row')];
  if (!rows.length) {
    ensureOrderItemRows();
    return;
  }

  rows.forEach((row) => {
    const selectEl = row.querySelector('[data-order-item-product]');
    const selected = selectEl.value;
    selectEl.innerHTML = productOptionsHTML(selected);
    if (!selectEl.value && state.products[0]) {
      selectEl.value = state.products[0].id;
    }
  });
}

function collectOrderItems() {
  const map = new Map();
  const rows = [...els.orderItems.querySelectorAll('.order-item-row')];

  rows.forEach((row) => {
    const productId = row.querySelector('[data-order-item-product]').value;
    const quantity = Number(row.querySelector('[data-order-item-qty]').value || 0);
    if (!productId || quantity < 1) {
      return;
    }
    const existing = map.get(productId) || 0;
    map.set(productId, existing + quantity);
  });

  return [...map.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

function openModal(title, bodyHTML) {
  els.modalTitle.textContent = title;
  els.modalBody.innerHTML = bodyHTML;
  els.modalBackdrop.classList.add('open');
  els.modalBackdrop.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  els.modalBackdrop.classList.remove('open');
  els.modalBackdrop.setAttribute('aria-hidden', 'true');
  els.modalBody.innerHTML = '';
}

function productModalFormHTML(product) {
  return `
    <form id="productModalForm" class="stack compact">
      <label>ชื่อสินค้า<input id="modalProductName" value="${esc(product.name)}" required /></label>
      <label>รายละเอียด<input id="modalProductDescription" value="${esc(product.description)}" required /></label>
      <label>ราคา<input id="modalProductPrice" type="number" min="1" step="0.01" value="${product.price}" required /></label>
      <label>สต็อก<input id="modalProductStock" type="number" min="0" value="${product.stockQuantity}" required /></label>
      <label>SKU<input id="modalProductSku" value="${esc(product.sku)}" required /></label>
      <label>หมวดหมู่
        <select id="modalProductCategory" required>
          <option value="ELECTRONICS" ${product.category === 'ELECTRONICS' ? 'selected' : ''}>ELECTRONICS</option>
          <option value="CLOTHING" ${product.category === 'CLOTHING' ? 'selected' : ''}>CLOTHING</option>
          <option value="HOME_APPLIANCES" ${product.category === 'HOME_APPLIANCES' ? 'selected' : ''}>HOME_APPLIANCES</option>
          <option value="BOOKS" ${product.category === 'BOOKS' ? 'selected' : ''}>BOOKS</option>
          <option value="FOOD_BEVERAGES" ${product.category === 'FOOD_BEVERAGES' ? 'selected' : ''}>FOOD_BEVERAGES</option>
        </select>
      </label>
      <label>แบรนด์<input id="modalProductBrand" value="${esc(product.brand)}" required /></label>
      <label>รูปสินค้า URL<input id="modalProductImage" value="${esc(product.images[0] || '')}" required /></label>
      <label>สถานะ
        <select id="modalProductStatus" required>
          <option value="ACTIVE" ${product.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
          <option value="OUT_OF_STOCK" ${product.status === 'OUT_OF_STOCK' ? 'selected' : ''}>OUT_OF_STOCK</option>
          <option value="DISCONTINUED" ${product.status === 'DISCONTINUED' ? 'selected' : ''}>DISCONTINUED</option>
        </select>
      </label>
      <div class="button-row">
        <button class="btn primary" type="submit">บันทึกการแก้ไข</button>
        <button class="btn ghost" type="button" data-modal-close>ยกเลิก</button>
      </div>
    </form>
  `;
}

function customerModalFormHTML(customer) {
  return `
    <form id="customerModalForm" class="stack">
      <label>ชื่อ<input id="modalCustomerName" value="${esc(customer.fullName)}" required /></label>
      <label>Email<input id="modalCustomerEmail" type="email" value="${esc(customer.email)}" required /></label>
      <label>Phone<input id="modalCustomerPhone" value="${esc(customer.phone)}" required /></label>
      <label>Address<input id="modalCustomerAddress" value="${esc(customer.address)}" required /></label>
      <label>Status
        <select id="modalCustomerStatus" required>
          <option value="ACTIVE" ${customer.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
          <option value="INACTIVE" ${customer.status === 'INACTIVE' ? 'selected' : ''}>INACTIVE</option>
        </select>
      </label>
      <div class="button-row">
        <button class="btn primary" type="submit">บันทึกการแก้ไข</button>
        <button class="btn ghost" type="button" data-modal-close>ยกเลิก</button>
      </div>
    </form>
  `;
}

function openConfirmDeleteModal({ title, detail, onConfirm }) {
  openModal(
    title,
    `
      <p>${detail}</p>
      <p class="danger-note">การลบไม่สามารถย้อนกลับได้</p>
      <div class="button-row">
        <button id="confirmDeleteBtn" class="btn primary" type="button">ยืนยันลบ</button>
        <button class="btn ghost" type="button" data-modal-close>ยกเลิก</button>
      </div>
    `,
  );

  document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    try {
      await onConfirm();
      closeModal();
      await refreshAll();
    } catch (error) {
      showToast(error.message, true);
    }
  });
}

async function renderInsights() {
  const [buyers, products] = await Promise.all([
    api('/customer/insights/top-buyers?limit=5'),
    api('/products/insights/most-bought?limit=5'),
  ]);

  els.insightsTopBuyers.innerHTML = `<h3>Top Buyers</h3>${buyers
    .map(
      (buyer) =>
        `<div>${buyer.fullName} • ${buyer.totalSpent.toLocaleString()} THB • ${buyer.orderCount} orders</div>`,
    )
    .join('') || '<div>No data</div>'}`;

  els.insightsTopProducts.innerHTML = `<h3>Top Products</h3>${products
    .map(
      (product) =>
        `<div>${product.productName} • ${product.totalQuantity} sold • ${product.buyerCount} buyers</div>`,
    )
    .join('') || '<div>No data</div>'}`;
}

async function refreshAll() {
  try {
    const [products, customers, orders] = await Promise.all([
      api('/products'),
      api('/customer'),
      api('/orders'),
    ]);

    state.products = products;
    state.customers = customers;
    state.orders = orders;

    renderStats();
    renderOrdersList();
    renderProductsTable();
    renderCustomersTable();
    renderSelects();
    await renderInsights();
    setStatus(true);
  } catch (error) {
    setStatus(false);
    showToast(error.message, true);
  }
}

async function loadCustomerHistory() {
  const customerId = els.historyCustomerSelect.value;
  if (!customerId) {
    return;
  }

  try {
    const history = await api(`/customer/${customerId}/orders`);
    const productRows = history.summary.products
      .map(
        (row) => `<li>${row.productName} • qty ${row.totalQuantity} • ${row.totalSpent} THB</li>`,
      )
      .join('');

    els.customerHistory.innerHTML = `
      <div><strong>${history.customer.fullName}</strong> • ${history.customer.email}</div>
      <div>Orders: ${history.summary.totalOrders} • Total: ${history.summary.totalSpent.toLocaleString()} THB</div>
      <ul>${productRows || '<li>No products</li>'}</ul>
    `;
  } catch (error) {
    showToast(error.message, true);
  }
}

function resetProductForm() {
  els.productForm.reset();
  els.productId.value = '';
}

function resetCustomerForm() {
  els.customerForm.reset();
  els.customerId.value = '';
}

async function onCreateOrder(event) {
  event.preventDefault();
  const items = collectOrderItems();
  if (!items.length) {
    showToast('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ', true);
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
    await api('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    showToast('Order created');
    els.orderNote.value = '';
    els.orderItems.innerHTML = '';
    ensureOrderItemRows();
    await refreshAll();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function onSaveProduct(event) {
  event.preventDefault();
  const payload = {
    name: els.productName.value,
    description: els.productDescription.value,
    price: Number(els.productPrice.value),
    stockQuantity: Number(els.productStock.value),
    sku: els.productSku.value,
    category: els.productCategory.value,
    brand: els.productBrand.value,
    images: [els.productImage.value],
    status: els.productStatus.value,
  };

  const id = els.productId.value;

  try {
    if (id) {
      await api(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      showToast('Product updated');
    } else {
      await api('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showToast('Product created');
    }
    resetProductForm();
    await refreshAll();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function onSaveCustomer(event) {
  event.preventDefault();
  const payload = {
    fullName: els.customerName.value,
    email: els.customerEmail.value,
    phone: els.customerPhone.value,
    address: els.customerAddress.value,
    status: els.customerStatus.value,
  };

  const id = els.customerId.value;

  try {
    if (id) {
      await api(`/customer/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      showToast('Customer updated');
    } else {
      await api('/customer', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showToast('Customer created');
    }
    resetCustomerForm();
    await refreshAll();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function onClickActions(event) {
  const productEditId = event.target.dataset.productEdit;
  const productDeleteId = event.target.dataset.productDelete;
  const customerEditId = event.target.dataset.customerEdit;
  const customerDeleteId = event.target.dataset.customerDelete;
  const orderUpdateId = event.target.dataset.orderUpdate;

  try {
    if (productEditId) {
      const product = state.products.find((item) => item.id === productEditId);
      if (!product) return;

      openModal('แก้ไขสินค้า', productModalFormHTML(product));
      document.getElementById('productModalForm').addEventListener('submit', async (submitEvent) => {
        submitEvent.preventDefault();
        try {
          await api(`/products/${product.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              name: document.getElementById('modalProductName').value,
              description: document.getElementById('modalProductDescription').value,
              price: Number(document.getElementById('modalProductPrice').value),
              stockQuantity: Number(document.getElementById('modalProductStock').value),
              sku: document.getElementById('modalProductSku').value,
              category: document.getElementById('modalProductCategory').value,
              brand: document.getElementById('modalProductBrand').value,
              images: [document.getElementById('modalProductImage').value],
              status: document.getElementById('modalProductStatus').value,
            }),
          });
          closeModal();
          showToast('Product updated');
          await refreshAll();
        } catch (error) {
          showToast(error.message, true);
        }
      });
      return;
    }

    if (productDeleteId) {
      const product = state.products.find((item) => item.id === productDeleteId);
      openConfirmDeleteModal({
        title: 'ลบสินค้า',
        detail: `ต้องการลบสินค้า ${esc(product?.name || productDeleteId)} ใช่หรือไม่?`,
        onConfirm: async () => {
          await api(`/products/${productDeleteId}`, { method: 'DELETE' });
          showToast('Product deleted');
        },
      });
      return;
    }

    if (customerEditId) {
      const customer = state.customers.find((item) => item.id === customerEditId);
      if (!customer) return;

      openModal('แก้ไขลูกค้า', customerModalFormHTML(customer));
      document.getElementById('customerModalForm').addEventListener('submit', async (submitEvent) => {
        submitEvent.preventDefault();
        try {
          await api(`/customer/${customer.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              fullName: document.getElementById('modalCustomerName').value,
              email: document.getElementById('modalCustomerEmail').value,
              phone: document.getElementById('modalCustomerPhone').value,
              address: document.getElementById('modalCustomerAddress').value,
              status: document.getElementById('modalCustomerStatus').value,
            }),
          });
          closeModal();
          showToast('Customer updated');
          await refreshAll();
        } catch (error) {
          showToast(error.message, true);
        }
      });
      return;
    }

    if (customerDeleteId) {
      const customer = state.customers.find((item) => item.id === customerDeleteId);
      openConfirmDeleteModal({
        title: 'ลบลูกค้า',
        detail: `ต้องการลบลูกค้า ${esc(customer?.fullName || customerDeleteId)} ใช่หรือไม่?`,
        onConfirm: async () => {
          await api(`/customer/${customerDeleteId}`, { method: 'DELETE' });
          showToast('Customer deleted');
        },
      });
      return;
    }

    if (orderUpdateId) {
      const statusEl = document.querySelector(`[data-order-status="${orderUpdateId}"]`);
      const trackingEl = document.querySelector(`[data-order-tracking="${orderUpdateId}"]`);
      await api(`/orders/${orderUpdateId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: statusEl.value,
          trackingNumber: trackingEl.value || undefined,
        }),
      });
      showToast('Order updated');
      await refreshAll();
    }
  } catch (error) {
    showToast(error.message, true);
  }
}

function onModalInteractions(event) {
  if (event.target.matches('[data-modal-close]') || event.target === els.modalBackdrop) {
    closeModal();
  }

  if (event.target.matches('[data-order-item-remove]')) {
    event.target.closest('.order-item-row')?.remove();
    ensureOrderItemRows();
  }
}

function onAddOrderItem() {
  addOrderItemRow();
}

function onGlobalKeydown(event) {
  if (event.key === 'Escape' && els.modalBackdrop.classList.contains('open')) {
    closeModal();
  }
}

els.refreshAllBtn.addEventListener('click', refreshAll);
els.orderForm.addEventListener('submit', onCreateOrder);
els.addOrderItemBtn.addEventListener('click', onAddOrderItem);
els.loadHistoryBtn.addEventListener('click', loadCustomerHistory);
els.productForm.addEventListener('submit', onSaveProduct);
els.customerForm.addEventListener('submit', onSaveCustomer);
els.resetProductFormBtn.addEventListener('click', resetProductForm);
els.resetCustomerFormBtn.addEventListener('click', resetCustomerForm);
document.body.addEventListener('click', onClickActions);
document.body.addEventListener('click', onModalInteractions);
els.modalCloseBtn.addEventListener('click', closeModal);
window.addEventListener('keydown', onGlobalKeydown);

ensureOrderItemRows();

refreshAll();
