function showToast(message, type = "dark") {
    const toastEl = document.getElementById("appToast");
    const toastMsg = document.getElementById("toastMessage");
  
    toastMsg.innerText = message;
  
    // تغيير اللون حسب النوع
    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  
    const toast = new bootstrap.Toast(toastEl, {
      delay: 2500
    });
  
    toast.show();
  }
// ================= DATA FROM data.js =================
// menuItems لازم تكون في data.js

// ================= GLOBAL =================
let visibleItems = 6;
let tempQty = {};

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  renderMenu();
  updateCartCount();
});

// ================= RENDER MENU =================
function renderMenu() {
  const container = document.getElementById("menu-container");
  if (!container) return;

  container.innerHTML = "";

  menuItems.forEach((item, index) => {

    container.innerHTML += `
      <div class="col-md-4 menu-item ${index >= visibleItems ? "d-none" : ""}">
        <div class="card shadow-sm">

          <img src="${item.img}" class="card-img-top">

          <div class="card-body">
            <h5>${item.name}</h5>
            <p>${item.price} EGP</p>

            <!-- QUANTITY -->
            <div class="d-flex justify-content-center align-items-center mb-2">

              <button class="btn btn-sm btn-outline-secondary"
                onclick="changeQty('${item.name}', -1)">-</button>

              <span class="mx-2" id="qty-${item.name}">1</span>

              <button class="btn btn-sm btn-outline-secondary"
                onclick="changeQty('${item.name}', 1)">+</button>

            </div>

            <button class="btn btn-warning w-100"
              onclick="addToCart('${item.name}', ${item.price}, '${item.img}')">
              Order
            </button>

          </div>
        </div>
      </div>
    `;
  });
}

// ================= CHANGE QTY =================
function changeQty(name, val) {
  if (!tempQty[name]) tempQty[name] = 1;

  tempQty[name] += val;

  if (tempQty[name] < 1) tempQty[name] = 1;

  const el = document.getElementById(`qty-${name}`);
  if (el) el.innerText = tempQty[name];
}

// ================= ADD TO CART =================
function addToCart(name, price, img) {
  let qty = tempQty[name] || 1;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let existing = cart.find(i => i.name === name);

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      name,
      price,
      img,
      quantity: qty
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  tempQty[name] = 1;

  updateCartCount();
  renderMenu();

  showToast("Item added to cart 🛒", "success");
}

// ================= CART COUNT =================
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let count = cart.reduce((sum, item) => sum + item.quantity, 0);

  let el = document.getElementById("cart-count");
  if (el) el.innerText = count;
}

// ================= SHOW MORE =================
function showMore() {
  document.querySelectorAll(".menu-item.d-none")
    .forEach(el => el.classList.remove("d-none"));

  let btn = document.getElementById("showMoreBtn");
  if (btn) btn.style.display = "none";
}

// ================= DISPLAY CART =================
function displayCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let container = document.getElementById("cart-table-container");

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = "<p class='text-center'>Your cart is empty</p>";
    return;
  }

  let total = 0;

  let html = `
  <table class="table align-middle">
    <thead class="table-dark">
      <tr>
        <th>Image</th>
        <th>Item</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
  `;

  cart.forEach((item, index) => {

    let itemTotal = item.price * item.quantity;
    total += itemTotal;

    html += `
      <tr>
        <td>
          <img src="${item.img}" 
            style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
        </td>

        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price} EGP</td>
        <td>${itemTotal} EGP</td>

        <td>
          <button class="btn btn-danger btn-sm"
            onclick="deleteItem(${index})">
            Delete
          </button>
        </td>
      </tr>
    `;
  });

  html += `
    </tbody>
  </table>

  <h4 class="text-end fw-bold">Grand Total: ${total} EGP</h4>
  `;

  container.innerHTML = html;
}

// ================= DELETE ITEM =================
function deleteItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(cart));

  displayCart();
  updateCartCount();
}

// ================= CONFIRM ORDER (WHATSAPP) =================
function confirmOrder() {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let name = document.getElementById("name").value;
  let phone = document.getElementById("phone").value;
  let address = document.getElementById("address").value;
  let notes = document.getElementById("notes").value;

  if (!name || !phone || !address) {
    showToast("Please fill all required fields ⚠️", "warning");
        return;
  }

  let message = `🛒 *New Order*%0A%0A`;

  message += `👤 Name: ${name}%0A`;
  message += `📞 Phone: ${phone}%0A`;
  message += `📍 Address: ${address}%0A`;

  if (notes) {
    message += `📝 Notes: ${notes}%0A`;
  }

  message += `%0A🍽 Items:%0A`;

  let total = 0;

  cart.forEach(item => {

    let itemTotal = item.price * item.quantity;
    total += itemTotal;

    message += `%0A📸 ${item.name}`;
    message += `%0AQty: ${item.quantity}`;
    message += `%0APrice: ${item.price} EGP`;
    message += `%0ATotal: ${itemTotal} EGP%0A`;
  });

  message += `%0A💰 *Grand Total: ${total} EGP*`;

  // ================= RESET AFTER SEND =================
  localStorage.removeItem("cart");
  updateCartCount();
  displayCart();

  window.open(`https://wa.me/201234567890?text=${message}`, "_blank");
}

function sendContactWhatsApp() {

    let name = document.getElementById("c_name").value;
    let phone = document.getElementById("c_phone").value;
    let email = document.getElementById("c_email").value;
    let msg = document.getElementById("c_msg").value;
  
    if (!name || !phone || !msg) {
        showToast("Please fill required fields ⚠️", "warning");
              return;
    }
  
    let message = `📩 *New Contact Message*%0A%0A`;
    message += `👤 Name: ${name}%0A`;
    message += `📞 Phone: ${phone}%0A`;
  
    if (email) {
      message += `📧 Email: ${email}%0A`;
    }
  
    message += `%0A💬 Message:%0A${msg}`;
  
    window.open(`https://wa.me/201234567890?text=${message}`, "_blank");
  
    // ================= CLEAR FORM =================
    document.getElementById("c_name").value = "";
    document.getElementById("c_phone").value = "";
    document.getElementById("c_email").value = "";
    document.getElementById("c_msg").value = "";
  }

  document.addEventListener("DOMContentLoaded", function () {

    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
    const navbarCollapse = document.getElementById("nav");
  
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        
        // لو الموبايل menu مفتوح
        if (navbarCollapse.classList.contains("show")) {
          new bootstrap.Collapse(navbarCollapse).hide();
        }
  
      });
    });
  
  });