document.addEventListener("DOMContentLoaded", async () => {
  // --- Cargar productos desde JSON ---
  let products = {};
  try {
    const res = await fetch("products.json");
    products = await res.json();
  } catch (e) {
    console.error("Error cargando productos:", e);
    products = {}; // fallback
  }

  // --- Utils ---
  const formatPrice = (n) =>
    (typeof n === "number" ? n : parseFloat(n) || 0).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
    });

  // --- Logo clickeable ---
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.style.cursor = "pointer";
    logo.addEventListener("click", () => (window.location.href = "index.html"));
  }

  // --- Menú hamburguesa ---
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav");
  if (hamburger) {
    hamburger.addEventListener("click", () => nav.classList.toggle("active"));
  }

  // --- Carrito ---
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartButton = document.querySelector(".cart button");
  const cartDropdown = document.querySelector(".cart-dropdown");

  // Indicador de cantidad (badge)
  let cartCounter = null;
  if (cartButton && cartButton.parentNode) {
    cartCounter = document.createElement("span");
    cartCounter.className = "cart-counter";
    cartCounter.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      background: #ffffffff;
      color: #3A6B35;
      font-weight: bold;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 12px;
      display: none;
    `;
    cartButton.parentNode.appendChild(cartCounter);
  }

  if (cartButton) {
    cartButton.addEventListener("click", () => {
      cartDropdown.classList.toggle("active");
      renderCart();
    });
  }

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // --- Render dropdown del carrito ---
  function renderCart() {
    if (!cartDropdown) return;
    cartDropdown.innerHTML = "";

    if (cart.length === 0) {
      cartDropdown.innerHTML = "<p>Carrito vacío</p>";
    } else {
      cart.forEach((item, index) => {
        const div = document.createElement("div");
        div.classList.add("cart-item");

        // show variation if exists
        const variationHtml = item.variation
          ? `<p class="cart-item-variation">Opción: ${item.variation}</p>`
          : "";

        div.innerHTML = `
          <img src="${item.img}" alt="${item.name}">
          <div class="cart-item-info">
            <p class="cart-item-name">${item.name}</p>
            ${variationHtml}
            <p class="cart-item-price">${formatPrice(item.price)}</p>
            <div class="cart-item-controls">
              <button class="decrease">-</button>
              <span>${item.qty}</span>
              <button class="increase">+</button>
              <button class="remove"><i class="fa-solid fa-trash fa-xs"></i></button>
            </div>
          </div>
        `;

        // listeners
        const inc = div.querySelector(".increase");
        const dec = div.querySelector(".decrease");
        const rem = div.querySelector(".remove");

        inc.addEventListener("click", () => {
          item.qty++;
          saveCart();
          renderCart();
          renderCartPageIfPresent();
        });

        dec.addEventListener("click", () => {
          if (item.qty > 1) item.qty--;
          else cart.splice(index, 1);
          saveCart();
          renderCart();
          renderCartPageIfPresent();
        });

        rem.addEventListener("click", () => {
          cart.splice(index, 1);
          saveCart();
          renderCart();
          renderCartPageIfPresent();
        });

        cartDropdown.appendChild(div);
      });
    }

    // footer: Ver carrito
    const footer = document.createElement("div");
    footer.classList.add("cart-footer");
    footer.style.cssText = `text-align:center; margin-top:10px;`;
    footer.innerHTML = `<a href="cart.html" class="view-cart-btn">Ver carrito</a>`;
    cartDropdown.appendChild(footer);

    // actualizar badge
    if (cartCounter) {
      const totalQty = cart.reduce((acc, it) => acc + (it.qty || 0), 0);
      cartCounter.innerText = totalQty;
      cartCounter.style.display = totalQty > 0 ? "block" : "none";
    }

    saveCart();
  }

  // --- Añadir al carrito (considera variación) ---
  function addToCart(id, name, price, img, variation = null) {
    // buscar si existe mismo id + misma variation
    const existing = cart.find(
      (p) => p.id === id && ((p.variation || null) === (variation || null))
    );
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id, name, price, img, variation: variation || null, qty: 1 });
    }
    saveCart();
    renderCart();
    renderCartPageIfPresent();
  }

// --- Generar / rellenar product cards (solo los que están en el HTML con data-id) ---
document.querySelectorAll(".product-card").forEach((card) => {
  const id = card.dataset.id;
  const product = products[id];
  if (!product) {
    card.style.display = "none";
    return;
  }

  // Limpiar y construir estructura
  card.innerHTML = "";

  const img = document.createElement("img");
  img.className = "product-image";
  img.src = product.img;
  img.alt = product.name;
  card.appendChild(img);

  const infoDiv = document.createElement("div");
  infoDiv.className = "product-info";

  const priceAvail = document.createElement("div");
  priceAvail.className = "product-price-avail";

  const nameEl = document.createElement("h2");
  nameEl.className = "product-name";
  nameEl.innerText = product.name;

  const priceEl = document.createElement("p");
  priceEl.className = "product-price";
  priceEl.innerText = formatPrice(product.price);

  const availEl = document.createElement("p");
  availEl.className = `product-availability ${product.available ? "in-stock" : "out-of-stock"}`;
  availEl.innerText = product.available ? "Disponible" : "Agotado";

  const modelEl = document.createElement("p");
  modelEl.className = "product-model";
  modelEl.innerText = `Para: ${product.model || ""}`;

  infoDiv.appendChild(nameEl);
  infoDiv.appendChild(priceAvail);
  priceAvail.appendChild(priceEl);
  priceAvail.appendChild(availEl);
  infoDiv.appendChild(modelEl);

  // --- Variaciones ---
  let selectedVariation = null;
  if (product.variations && product.variations.length > 0) {
    const variationSelect = document.createElement("select");
    variationSelect.className = "product-variation";

    product.variations.forEach((v) => {
      const option = document.createElement("option");
      option.value = v.name;
      option.innerText = `${v.name} (${formatPrice(v.price)})`;
      variationSelect.appendChild(option);
    });

    // Set initial selection
    selectedVariation = product.variations[0];

    variationSelect.addEventListener("change", (e) => {
      const chosen = product.variations.find(v => v.name === e.target.value);
      if (chosen) {
        selectedVariation = chosen;
        priceEl.innerText = formatPrice(chosen.price);
        availEl.innerText = chosen.available ? "Disponible" : "Agotado";
        availEl.className = `product-availability ${chosen.available ? "in-stock" : "out-of-stock"}`;
        addBtn.disabled = !chosen.available;
      }
    });

    infoDiv.appendChild(variationSelect);
  }

  card.appendChild(infoDiv);

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "card-actions";

  const viewBtn = document.createElement("a");
  viewBtn.className = "product-btn";
  viewBtn.href = `product.html?id=${id}`;
  viewBtn.innerText = "Ver producto";

  const addBtn = document.createElement("button");
  addBtn.className = "product-btn add-to-cart";
  addBtn.type = "button";
  addBtn.innerText = "Añadir al carrito";
  if (!product.available) addBtn.disabled = true;

  addBtn.addEventListener("click", () => {
    // Si hay variación seleccionada, usamos su precio y nombre
    const variationName = selectedVariation ? selectedVariation.name : null;
    const variationPrice = selectedVariation ? selectedVariation.price : product.price;
    addToCart(id, product.name, variationPrice, product.img, variationName);
    showToast("Añadido al carrito");
  });

  actionsDiv.appendChild(viewBtn);
  actionsDiv.appendChild(addBtn);
  card.appendChild(actionsDiv);
});


  // --- Página de producto individual ---
const productPage = document.querySelector(".product-detail");
if (productPage) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = products[id];

  if (product) {
    productPage.dataset.id = id;
    productPage.querySelector("h1").innerText = product.name;

    const priceEl = productPage.querySelector(".product-price");
    priceEl.innerText = formatPrice(product.price);

    const availabilityEl = productPage.querySelector(".product-availability");
    availabilityEl.innerText = product.available ? "Disponible" : "Agotado";
    availabilityEl.className = `product-availability ${product.available ? "in-stock" : "out-of-stock"}`;

    const descEl = productPage.querySelector(".product-description");
    descEl.innerText = product.description;

    const imgEl = productPage.querySelector("img");
    imgEl.src = product.img;
    imgEl.alt = product.name;

    const modelEl = productPage.querySelector(".product-model-page");
    if (modelEl) {
      modelEl.innerText = `Para: ${product.model || ""}`;
    }

    const addBtn = productPage.querySelector(".add-to-cart");

    // --- Variaciones ---
    let selectedVariation = null;
    const variationContainer = productPage.querySelector(".product-variations");
    if (product.variations && product.variations.length > 0 && variationContainer) {
      const variationSelect = document.createElement("select");
      variationSelect.className = "product-variation";

      product.variations.forEach((v) => {
        const option = document.createElement("option");
        option.value = v.name;
        option.innerText = `${v.name} (${formatPrice(v.price)})`;
        variationSelect.appendChild(option);
      });

      selectedVariation = product.variations[0];

      variationSelect.addEventListener("change", (e) => {
        const chosen = product.variations.find(v => v.name === e.target.value);
        if (chosen) {
          selectedVariation = chosen;
          priceEl.innerText = formatPrice(chosen.price);
          availabilityEl.innerText = chosen.available ? "Disponible" : "Agotado";
          availabilityEl.className = `product-availability ${chosen.available ? "in-stock" : "out-of-stock"}`;
          if (addBtn) addBtn.disabled = !chosen.available;
        }
      });

      variationContainer.appendChild(variationSelect);
    }

    if (addBtn) {
      if (!product.available) addBtn.disabled = true;
      addBtn.addEventListener("click", () => {
        const variationName = selectedVariation ? selectedVariation.name : null;
        const variationPrice = selectedVariation ? selectedVariation.price : product.price;
        addToCart(id, product.name, variationPrice, product.img, variationName);
        showToast("Añadido al carrito");
      });
    }
  }
}

  // --- Inicializar render del dropdown ---
  renderCart();

  // --- Página del carrito (cart.html) ---
  const cartPageContainer = document.querySelector(".cart-items-container");
  function renderCartPageIfPresent() {
    if (!cartPageContainer) return;
    renderCartPage();
  }

  function renderCartPage() {
    if (!cartPageContainer) return;
    cartPageContainer.innerHTML = "";

    if (cart.length === 0) {
      cartPageContainer.innerHTML = "<p>Carrito vacío</p>";
      return;
    }

    cart.forEach((item, index) => {
      const div = document.createElement("div");
      div.classList.add("cart-item-page");
      const variationHtml = item.variation
        ? `<p class="cart-item-variation-page">Opción: ${item.variation}</p>`
        : "";
      div.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <div class="cart-item-info-page">
          <p class="cart-item-name">${item.name}</p>
          ${variationHtml}
          <p class="cart-item-price">${formatPrice(item.price)}</p>
          <div class="cart-item-controls-page">
            <button class="decrease">-</button>
            <span>${item.qty}</span>
            <button class="increase">+</button>
            <button class="remove"><i class="fa-solid fa-trash fa-xs"></i></button>
          </div>
        </div>
      `;

      const inc = div.querySelector(".increase");
      const dec = div.querySelector(".decrease");
      const rem = div.querySelector(".remove");

      inc.addEventListener("click", () => {
        item.qty++;
        saveCart();
        renderCart();
        renderCartPage();
      });

      dec.addEventListener("click", () => {
        if (item.qty > 1) item.qty--;
        else cart.splice(index, 1);
        saveCart();
        renderCart();
        renderCartPage();
      });

      rem.addEventListener("click", () => {
        cart.splice(index, 1);
        saveCart();
        renderCart();
        renderCartPage();
      });

      cartPageContainer.appendChild(div);
    });
  }

  // si estamos en la página del carrito, renderizamos
  renderCartPageIfPresent();

  // --- pageshow para actualizar cuando se vuelve con el botón "atrás" (bfcache) ---
  window.addEventListener("pageshow", () => {
    // recargar cart desde localStorage (por si cambió en otra pestaña/página)
    cart = JSON.parse(localStorage.getItem("cart")) || [];
    renderCart();
    renderCartPageIfPresent();
  });

  // --- Notificaciones tipo toast ---
const toastContainer = document.createElement("div");
toastContainer.className = "toast-container";
document.body.appendChild(toastContainer);

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;

  toastContainer.appendChild(toast);

  // Forzar el reflow para activar la animación
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Quitar después de 3s
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

});
