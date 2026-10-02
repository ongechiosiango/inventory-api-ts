// ========== Element refs ==========
const productsEl = document.getElementById("products");
const statusEl = document.getElementById("status");
const addModal = document.getElementById("add-modal");
const addForm = document.getElementById("add-form");
const openAddBtn = document.getElementById("open-add-modal");
const closeAddBtn = document.getElementById("close-add-modal");
const cancelAddBtn = document.getElementById("cancel-add");

// ========== Helpers ==========
function setStatus(msg, kind = "") {
  statusEl.textContent = msg;
  statusEl.className = "status " + kind;
}

function formatPrice(n) {
  return "$" + Number(n).toFixed(2);
}

// ========== Load products ==========
async function loadProducts() {
  setStatus("Loading products…");
  try {
    const res = await fetch("/products");
    if (!res.ok) throw new Error("Failed to load products");
    const data = await res.json();
    renderProducts(data.products);
    setStatus(`${data.products.length} product(s) loaded`, "success");
  } catch (err) {
    console.error(err);
    setStatus("Error loading products", "error");
  }
}

// ========== Render ==========
function renderProducts(products) {
  if (!products.length) {
    productsEl.innerHTML = `
      <p style="color:#64748b">
        <i class="fa-solid fa-inbox"></i> No products yet. Click "Add Product".
      </p>`;
    return;
  }

  productsEl.innerHTML = products
    .map(
      (p) => `
      <article class="card">
        <div class="card-title">
          <i class="fa-solid fa-box"></i> ${escapeHtml(p.name)}
        </div>
        <div class="card-price">${formatPrice(p.price)}</div>
        <div class="card-stock">
          <i class="fa-solid fa-cubes"></i> Stock: ${p.stock}
        </div>
        <div class="card-actions">
          <button class="btn btn-danger" data-delete="${p.id}">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      </article>`
    )
    .join("");
}

// ========== Delete ==========
async function deleteProduct(id) {
  if (!confirm(`Delete product ${id}?`)) return;
  try {
    const res = await fetch(`/products/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) throw new Error("Delete failed");
    setStatus(`Deleted product ${id}`, "success");
    loadProducts();
  } catch (err) {
    console.error(err);
    setStatus("Error deleting product", "error");
  }
}

// ========== Add ==========
async function addProduct(payload) {
  const res = await fetch("/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add product");
  }
  return res.json();
}

// ========== Events ==========
productsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-delete]");
  if (btn) deleteProduct(btn.dataset.delete);
});

openAddBtn.addEventListener("click", () => addModal.showModal());
closeAddBtn.addEventListener("click", () => addModal.close());
cancelAddBtn.addEventListener("click", () => addModal.close());

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(addForm);
  const payload = {
    name: form.get("name").toString().trim(),
    price: Number(form.get("price")),
    stock: Number(form.get("stock")),
  };
  try {
    await addProduct(payload);
    addForm.reset();
    addModal.close();
    setStatus("Product added", "success");
    loadProducts();
  } catch (err) {
    setStatus(err.message, "error");
  }
});

// ========== Security helper ==========
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

// ========== Init ==========
loadProducts();