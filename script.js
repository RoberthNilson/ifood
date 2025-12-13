/*********************************
 * FIREBASE
 *********************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyALDxcnIacY1imCzqGU9miBFd26KNvd_Qw",
  authDomain: "brasa-94d92.firebaseapp.com",
  databaseURL: "https://brasa-94d92-default-rtdb.firebaseio.com",
  projectId: "brasa-94d92",
  storageBucket: "brasa-94d92.firebasestorage.app",
  messagingSenderId: "840468371073",
  appId: "1:840468371073:web:2ef5dee9af8461bcc85f80"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/*********************************
 * UTILIDADES
 *********************************/
const $ = id => document.getElementById(id);

const formatPrice = v =>
  "R$ " + Number(v || 0).toFixed(2).replace(".", ",");

/*********************************
 * CARRINHO
 *********************************/
let cart = JSON.parse(localStorage.getItem("brasa_cart_v5")) || [];

function saveCart() {
  localStorage.setItem("brasa_cart_v5", JSON.stringify(cart));
  renderCart();
}

function addToCart(item) {
  const found = cart.find(i => i.id === item.id);
  found ? found.qty++ : cart.push({ ...item, qty: 1 });
  saveCart();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
}

function renderCart() {
  const list = $("cart");
  const totalEl = $("total");
  const empty = $("empty");

  list.innerHTML = "";

  if (!cart.length) {
    empty.style.display = "block";
    totalEl.textContent = "R$ 0,00";
    return;
  }

  empty.style.display = "none";

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;

    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div class="small">${formatPrice(item.price)} x ${item.qty}</div>
      </div>
      <div>
        <button class="secondary" data-inc="${item.id}">+</button>
        <button class="secondary" data-dec="${item.id}">-</button>
        <button class="secondary" data-rem="${item.id}">🗑</button>
      </div>
    `;
    list.appendChild(li);
  });

  totalEl.textContent = formatPrice(total);

  list.querySelectorAll("button").forEach(btn => {
    if (btn.dataset.inc) btn.onclick = () => updateQty(btn.dataset.inc, 1);
    if (btn.dataset.dec) btn.onclick = () => updateQty(btn.dataset.dec, -1);
    if (btn.dataset.rem)
      btn.onclick = () => {
        cart = cart.filter(i => i.id !== btn.dataset.rem);
        saveCart();
      };
  });
}

/*********************************
 * CARDÁPIO
 *********************************/
const menuItems = [
  { id: "1", name: "Jantinha Simples", price: 10, description: "Simples", category: "Jantinhas" },
  { id: "2", name: "Jantinha Completa", price: 20, description: "Completa", category: "Jantinhas" },
  { id: "3", name: "Retirada", price: 21, description: "Completa", category: "Jantinhas" },

  { id: "4", name: "Carne", price: 10, description: "Espetinho de carne", category: "Espetinhos" },
  { id: "5", name: "Asinha", price: 10, description: "Asinha temperada", category: "Espetinhos" },
  { id: "6", name: "Frango com Bacon", price: 10, description: "Frango com bacon", category: "Espetinhos" },

  { id: "7", name: "Arroz", price: 5, description: "Arroz simples", category: "Acompanhamentos" },
  { id: "8", name: "Feijão Tropeiro", price: 5, description: "Tropeiro", category: "Acompanhamentos" },
  { id: "9", name: "Mandioca", price: 5, description: "Mandioca cozida", category: "Acompanhamentos" },
  { id: "10", name: "Vinagrete", price: 5, description: "Vinagrete", category: "Acompanhamentos" },

  { id: "11", name: "Coca-Cola Lata", price: 6, description: "Refrigerante", category: "Bebidas" },
  { id: "12", name: "Guaraná Lata", price: 6, description: "Refrigerante", category: "Bebidas" },
  { id: "13", name: "Coca-Cola 1L", price: 10, description: "Refrigerante", category: "Bebidas" },
  { id: "14", name: "Guaraná 1L", price: 10, description: "Refrigerante", category: "Bebidas" },
  { id: "15", name: "Coca-Cola 2L", price: 15, description: "Refrigerante", category: "Bebidas" },
  { id: "16", name: "Guaraná 2L", price: 15, description: "Refrigerante", category: "Bebidas" },
  { id: "17", name: "Água Mineral 500ml", price: 3, description: "Água mineral", category: "Bebidas" },
  { id: "18", name: "Skol 600ml", price: 12, description: "Cerveja", category: "Bebidas" },
  { id: "19", name: "Original 600ml", price: 12, description: "Cerveja", category: "Bebidas" },
  { id: "20", name: "Heineken 600ml", price: 15, description: "Cerveja", category: "Bebidas" },

  // Sucos Copo
  { id: "21", name: "Maracujá Copo", price: 10, description: "Suco", category: "Bebidas" },
  { id: "22", name: "Cajá Copo", price: 10, description: "Suco", category: "Bebidas" },
  { id: "23", name: "Goiaba Copo", price: 10, description: "Suco", category: "Bebidas" },
  { id: "24", name: "Acerola Copo", price: 10, description: "Suco", category: "Bebidas" },

  // Sucos Jarra
  { id: "25", name: "Maracujá Jarra", price: 20, description: "Suco", category: "Bebidas" },
  { id: "26", name: "Cajá Jarra", price: 20, description: "Suco", category: "Bebidas" },
  { id: "27", name: "Goiaba Jarra", price: 20, description: "Suco", category: "Bebidas" },
  { id: "28", name: "Acerola Jarra", price: 20, description: "Suco", category: "Bebidas" }
];

const skewers = ["Carne", "Asinha", "Frango com Bacon"];
let selectedJantinha = null;

/*********************************
 * INICIALIZAÇÃO
 *********************************/
document.addEventListener("DOMContentLoaded", () => {
  $("year").textContent = new Date().getFullYear();
  renderMenu();
  renderCart();
});

/*********************************
 * RENDER MENU
 *********************************/
function renderMenu() {
  const wrap = $("menu");
  wrap.innerHTML = "";

  [...new Set(menuItems.map(i => i.category))].forEach(cat => {
    const h3 = document.createElement("h3");
    h3.textContent = cat;
    wrap.appendChild(h3);

    menuItems
      .filter(i => i.category === cat)
      .forEach(item => {
        const div = document.createElement("div");
        div.className = "dish";
        div.innerHTML = `
          <strong>${item.name}</strong>
          <span class="price">${formatPrice(item.price)}</span>
          <button class="primary">Adicionar</button>
        `;

        div.querySelector("button").onclick = () =>
          cat === "Jantinhas"
            ? openSkewerModal(item)
            : addToCart(item);

        wrap.appendChild(div);
      });
  });
}

/*********************************
 * MODAL ESPETOS
 *********************************/
function openSkewerModal(jantinha) {
  selectedJantinha = jantinha;
  const box = $("skewer-options");
  box.innerHTML = "";

  skewers.forEach((s, i) => {
    box.innerHTML += `
      <label class="skewer-option">
        <input type="radio" name="skewer" value="${s}" ${i === 0 ? "checked" : ""}>
        ${s}
      </label>
    `;
  });

  $("modal-skewer").classList.add("open");
}

$("skewer-confirm").onclick = () => {
  const sel = document.querySelector("input[name='skewer']:checked");
  if (!sel) return;

  addToCart({
    id: selectedJantinha.id + "-" + sel.value,
    name: `${selectedJantinha.name} - ${sel.value}`,
    price: selectedJantinha.price
  });

  $("modal-skewer").classList.remove("open");
};

$("skewer-cancel").onclick = () =>
  $("modal-skewer").classList.remove("open");

/*********************************
 * CHECKOUT (MESA / LEVAR)
 *********************************/
let orderType = "mesa";

document.querySelectorAll(".order-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".order-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    orderType = btn.dataset.type;
    $("order-type").value = orderType;
  };
});

$("btn-checkout").onclick = () => {
  if (!cart.length) return alert("Carrinho vazio!");
  $("modal").classList.add("open");
};

$("modal-cancel").onclick = () =>
  $("modal").classList.remove("open");

$("modal-confirm").onclick = async () => {
  const name = $("cust-name").value.trim();
  const people = $("cust-people").value;
  const table = $("cust-table").value;

  if (!name || !people || !table)
    return alert("Preencha todos os campos!");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  await push(ref(db, "orders"), {
    customer: {
      name,
      people,
      table,
      type: orderType
    },
    items: cart,
    total,
    status: "novo",
    createdAt: Date.now()
  });

  cart = [];
  saveCart();
  $("modal").classList.remove("open");
  alert("Pedido enviado com sucesso 🔥");
};

/*********************************
 * LIMPAR CARRINHO
 *********************************/
$("btn-clear").onclick = () => {
  cart = [];
  saveCart();
};
