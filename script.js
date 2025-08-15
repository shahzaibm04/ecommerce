let products = [];
let cart = [];
let discount = 0;

fetch("products.json")
  .then((res) => res.json())
  .then((data) => {
    products = data;
    categoryFilter();
    renderProducts(products);
  });

function categoryFilter() {
  const categories = [...new Set(products.map((p) => p.category))];
  const select = document.getElementById("categoryFilter");
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
}

function renderProducts(list) {
  const container = document.getElementById("productList");
  container.innerHTML = "";
  list.forEach((product) => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-4";
    col.innerHTML = `
      <div class="card h-100">
        <img src="${product.image}" class="card-img-top" alt="${product.alt}">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p>$${product.price.toFixed(2)}</p>
          <p>${renderStars(product.rating)}</p>
          <button class="btn btn-dark w-100" onclick="addToCart(${
            product.id
          })">Add to cart</button>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

function renderStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += `<span class="star">${
      i <= Math.floor(rating) ? "★" : i - rating < 1 ? "☆" : "☆"
    }</span>`;
  }
  return stars;
}

function addToCart(id) {
  const product = products.find((p) => p.id === id);
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
}

function renderCart() {
  const list = document.getElementById("cartItems");
  list.innerHTML = "";
  let subtotal = 0;
  cart.forEach((item) => {
    subtotal += item.price * item.qty;
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      ${item.name} 
      <div>
        <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${
          item.id
        }, -1)"><i class="fa-solid fa-minus"></i></button>
        ${item.qty}
        <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${
          item.id
        }, 1)"><i class="fa-solid fa-plus"></i></button>
        × $${item.price.toFixed(2)}
        <button class="btn btn-sm btn-danger" onclick="removeFromCart(${
          item.id
        })"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    list.appendChild(li);
  });

  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("total").textContent = (
    subtotal -
    subtotal * discount
  ).toFixed(2);
}

function changeQty(id, change) {
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.qty += change;
    if (item.qty <= 0) {
      cart = cart.filter((i) => i.id !== id);
    }
  }
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  renderCart();
}

document.getElementById("applyPromo").addEventListener("click", () => {
  const code = document.getElementById("promoCode").value.trim();
  if (code === "WELCOME10") {
    discount = 0.1;
  } else {
    discount = 0;
  }
  renderCart();
});

function applyFiltersAndSort() {
  const category = document.getElementById("categoryFilter").value;
  const priceValue = document.getElementById("priceRangeSelect").value;
  const sortBy = document.getElementById("sortBy").value;

  let filtered = products.filter((p) => {
    let priceMatch = true;
    if (priceValue) {
      if (priceValue.includes("-")) {
        let [min, max] = priceValue.split("-").map(Number);
        priceMatch = p.price >= min && p.price <= max;
      } else if (priceValue.includes("+")) {
        let min = parseFloat(priceValue);
        priceMatch = p.price >= min;
      }
    }
    return (category === "" || p.category === category) && priceMatch;
  });

  if (sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (sortBy === "popularity-desc")
    filtered.sort((a, b) => b.popularity - a.popularity);

  renderProducts(filtered);
}

// ✅ Correct event bindings
document
  .getElementById("categoryFilter")
  .addEventListener("change", applyFiltersAndSort);
document
  .getElementById("priceRangeSelect")
  .addEventListener("change", applyFiltersAndSort);
document
  .getElementById("sortBy")
  .addEventListener("change", applyFiltersAndSort);
