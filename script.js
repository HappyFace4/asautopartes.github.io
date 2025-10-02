document.addEventListener("DOMContentLoaded", () => {


   const MODELS = {
    PEUGEOT2019: "Peugeot 2019",
    TOYOTA_COROLLA2020: "Toyota Corolla 2020",
    NISSAN_VERSA2018: "Nissan Versa 2018",
    CHEVROLET_ONIX2021: "Chevrolet Onix 2021"
    // Agregas todos los que quieras...
  };

  // --- Productos ---
  const products = {
    "filtro-aceite": {
      name: "Filtro de aceite",
      price: 19990,
      available: true,
      description: "Descripción detallada del filtro de aceite",
      img: "Imagen1.png",
      model: MODELS.PEUGEOT2019
    },
    "otro-producto": {
      name: "Otro producto",
      price: 25990,
      available: true,
      description: "Descripción detallada de otro producto",
      img: "Imagen1.png",
      model: MODELS.TOYOTA_COROLLA2020
    },
    "neumatico": {
      name: "Neumático",
      price: 30000,
      available: false,
      description: "Descripción detallada de un neumático",
      img: "Imagen1.png",
      model: MODELS.NISSAN_VERSA2018
    },
    "amortiguador": {
      name: "Amortiguador",
      price: 10000,
      available: true,
      description: "Descripción detallada del amortiguador",
      img: "Imagen1.png",
      model: MODELS.CHEVROLET_ONIX2021
    },
    "bujia": {
      name: "Bujía",
      price: 3990,
      available: true,
      description: "Descripción detallada de la bujía",
      img: "Imagen1.png",
      model: MODELS.PEUGEOT2019
    },
  };


  // --- Hacer click al logo
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.style.cursor = "pointer";
    logo.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  // --- Menú hamburguesa ---
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector(".nav");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      nav.classList.toggle("active");
    });
  }

  // --- Carrito ---
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const cartButton = document.querySelector(".cart button");
  const cartDropdown = document.querySelector(".cart-dropdown");

  // Indicador de cantidad
  const cartCounter = document.createElement("span");
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
  `;
  cartButton.parentNode.appendChild(cartCounter);

  if (cartButton) {
    cartButton.addEventListener("click", () => {
      cartDropdown.classList.toggle("active");
      renderCart();
    });
  }

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function renderCart() {
    cartDropdown.innerHTML = "";
    if (cart.length === 0) {
      cartDropdown.innerHTML = "<p>Carrito vacío</p>";
    } else {
      cart.forEach((item, index) => {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
          <img src="${item.img}" alt="${item.name}">
          <div class="cart-item-info">
            <p class="cart-item-name">${item.name}</p>
            <p class="cart-item-price">${item.price.toLocaleString("es-CL", { style: "currency", currency: "CLP" })}</p>
            <div class="cart-item-controls">
              <button class="decrease">-</button>
              <span>${item.qty}</span>
              <button class="increase">+</button>
              <button class="remove"><i class="fa-solid fa-trash fa-xs"></i></button>
            </div>
          </div>
        `;

        div.querySelector(".increase").addEventListener("click", () => {
          item.qty++;
          saveCart();
          renderCart();
        });

        div.querySelector(".decrease").addEventListener("click", () => {
          if (item.qty > 1) item.qty--;
          else cart.splice(index, 1);
          saveCart();
          renderCart();
        });

        div.querySelector(".remove").addEventListener("click", () => {
          cart.splice(index, 1);
          saveCart();
          renderCart();
        });

        cartDropdown.appendChild(div);
      });
    }

    // --- Botón "Ver carrito" ---
    const footer = document.createElement("div");
    footer.classList.add("cart-footer");
    footer.style.cssText = `
      text-align: center;
      margin-top: 10px;
    `;
    footer.innerHTML = `<a href="cart.html" class="view-cart-btn">Ver carrito</a>`;
    cartDropdown.appendChild(footer);

    // Actualizar contador de carrito
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    cartCounter.innerText = totalQty;
    cartCounter.style.display = totalQty > 0 ? "block" : "none";

    saveCart();
  }

  function addToCart(id, name, price, img) {
    const existing = cart.find((p) => p.id === id);
    if (existing) existing.qty++;
    else cart.push({ id, name, price, img, qty: 1 });
    saveCart();
    renderCart();
  }

  // --- Rellenar o crear product cards ---
  document.querySelectorAll(".product-card").forEach((card) => {
    const id = card.dataset.id;
    const product = products[id];
    if (!product) {
      card.style.display = "none";
      return;
    }

    card.innerHTML = "";

    const img = document.createElement("img");
    img.className = "product-image";
    img.src = product.img;
    img.alt = product.name;
    card.appendChild(img);

    const infoDiv = document.createElement("div");
    infoDiv.className = "product-info";

    const priceAvail = document.createElement("div");
    priceAvail.className = "product-price-avail"

    const nameEl = document.createElement("h2");
    nameEl.className = "product-name";
    nameEl.innerText = product.name;

    const priceEl = document.createElement("p");
    priceEl.className = "product-price";
    priceEl.innerText = product.price.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

    const availEl = document.createElement("p");
    availEl.className = `product-availability ${product.available ? "in-stock" : "out-of-stock"}`;
    availEl.innerText = product.available ? "Disponible" : "Agotado";

    const modelEl = document.createElement("p");
    modelEl.className = "product-model";
    modelEl.innerText = `Para: ${product.model}`;

    infoDiv.appendChild(nameEl);
    infoDiv.appendChild(priceAvail)
    priceAvail.appendChild(priceEl);
    priceAvail.appendChild(availEl);
    infoDiv.appendChild(modelEl);
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
      addToCart(id, product.name, product.price, product.img);
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
      productPage.querySelector(".product-price").innerText = product.price.toLocaleString("es-CL", { style: "currency", currency: "CLP" });

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
        modelEl.innerText = `Para: ${product.model}`;
      }

      const addBtn = productPage.querySelector(".add-to-cart");
      if (addBtn) {
        if (!product.available) addBtn.disabled = true;
        addBtn.addEventListener("click", () => {
          addToCart(id, product.name, product.price, product.img);
        });
      }
    }
  }

  // --- Inicializar carrito ---
  renderCart();

  const cartPageContainer = document.querySelector(".cart-items-container");
if (cartPageContainer) {
  function renderCartPage() {
    cartPageContainer.innerHTML = "";

    if (cart.length === 0) {
      cartPageContainer.innerHTML = "<p>Carrito vacío</p>";
      return;
    }

    cart.forEach((item, index) => {
      const div = document.createElement("div");
      div.classList.add("cart-item-page");
      div.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <div class="cart-item-info-page">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">${item.price.toLocaleString("es-CL", { style: "currency", currency: "CLP" })}</p>
          <div class="cart-item-controls-page">
            <button class="decrease">-</button>
            <span>${item.qty}</span>
            <button class="increase">+</button>
            <button class="remove"><i class="fa-solid fa-trash fa-xs"></i></button>
          </div>
        </div>
      `;

      div.querySelector(".increase").addEventListener("click", () => {
        item.qty++;
        saveCart();
        renderCart();
        renderCartPage();
      });

      div.querySelector(".decrease").addEventListener("click", () => {
        if (item.qty > 1) item.qty--;
        else cart.splice(index, 1);
        saveCart();
        renderCart();
        renderCartPage();
      });

      div.querySelector(".remove").addEventListener("click", () => {
        cart.splice(index, 1);
        saveCart();
        renderCart();
        renderCartPage();
      });

      cartPageContainer.appendChild(div);
    });
  }

  renderCartPage();
}
});
