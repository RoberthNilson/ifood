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
 * UTIL
 *********************************/
const $ = id => document.getElementById(id);

const formatPrice = v =>
  "R$ " + Number(v || 0).toFixed(2).replace(".", ",");

/*********************************
 * STATUS LOJA AUTOMÁTICO
 *********************************/
function lojaAbertaAgora() {
  const agora = new Date();
  const dia = agora.getDay(); // Domingo = 0
  const minutos = agora.getHours() * 60 + agora.getMinutes();

  // Fecha o dia todo no domingo
  if (dia === 0) return false;

  // Horário de funcionamento: 17:00 - 22:00
  return minutos >= 17 * 60 && minutos < 22 * 60;
}

function atualizarStatusLoja() {
  const tag = document.querySelector(".tag");
  if (!tag) return;

  const agora = new Date();
  const dia = agora.getDay();

  if (dia === 0) {
    tag.textContent = "Fechado";
    tag.classList.remove("open");
    tag.classList.add("closed");
    return; // Domingo fechado o dia todo
  }

  if (lojaAbertaAgora()) {
    tag.textContent = "Aberto";
    tag.classList.remove("closed");
    tag.classList.add("open");
  } else {
    tag.textContent = "Fechado";
    tag.classList.remove("open");
    tag.classList.add("closed");
  }
}

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
 * MENU ITEMS
 *********************************/
const menuItems = [
  // Jantinhas
  { id: "1", name: "Espetinho Simples", price: 10, category: "Jantinhas" },
  { id: "2", name: "Jantinha Completa", price: 20, category: "Jantinhas" },
  { id: "3", name: "Retirada", price: 21, category: "Jantinhas" },

  // Acompanhamentos
  { id: "7", name: "Arroz", price: 5, category: "Acompanhamentos" },
  { id: "8", name: "Feijão Tropeiro", price: 5, category: "Acompanhamentos" },
  { id: "9", name: "Mandioca", price: 5, category: "Acompanhamentos" },
  { id: "10", name: "Vinagrete", price: 5, category: "Acompanhamentos" },

  // Bebidas
  { id: "11", name: "Coca-Cola Lata", price: 6, category: "Bebidas" },
  { id: "12", name: "Guaraná Lata", price: 6, category: "Bebidas" },
  { id: "13", name: "Coca-Cola 1L", price: 10, category: "Bebidas" },
  { id: "14", name: "Guaraná 1L", price: 10, category: "Bebidas" },
  { id: "15", name: "Coca-Cola 2L", price: 15, category: "Bebidas" },
  { id: "16", name: "Guaraná 2L", price: 15, category: "Bebidas" },
  { id: "17", name: "Água Mineral 500ml", price: 3, category: "Bebidas" },
  { id: "18", name: "Skol 600ml", price: 12, category: "Bebidas" },
  { id: "19", name: "Original 600ml", price: 12, category: "Bebidas" },
  { id: "20", name: "Heineken 600ml", price: 15, category: "Bebidas" },

  // Sucos Copo
  { id: "21", name: "Maracujá Copo", price: 10, category: "Sucos Copo" },
  { id: "22", name: "Cajá Copo", price: 10, category: "Sucos Copo" },
  { id: "23", name: "Goiaba Copo", price: 10, category: "Sucos Copo" },
  { id: "24", name: "Acerola Copo", price: 10, category: "Sucos Copo" },

  // Sucos Jarra
  { id: "25", name: "Maracujá Jarra", price: 20, category: "Sucos Jarra" },
  { id: "26", name: "Cajá Jarra", price: 20, category: "Sucos Jarra" },
  { id: "27", name: "Goiaba Jarra", price: 20, category: "Sucos Jarra" },
  { id: "28", name: "Acerola Jarra", price: 20, category: "Sucos Jarra" }
];

const skewers = ["Carne", "Asinha", "Frango com Bacon"];
let selectedJantinha = null;

/*********************************
 * MENU RENDER
 *********************************/
function renderMenu() {
  const wrap = $("menu");
  wrap.innerHTML = "";

  [...new Set(menuItems.map(i => i.category))].forEach(cat => {
    const h3 = document.createElement("h3");
    h3.textContent = cat;
    wrap.appendChild(h3);

    menuItems.filter(i => i.category === cat).forEach(item => {
      const div = document.createElement("div");
      div.className = "dish";

      // Adiciona espaçamento extra para Jantinhas
      if(item.category === "Jantinhas") div.classList.add("jantinha-card");

      div.innerHTML = `
        <strong>${item.name}</strong>
        <span class="price">${formatPrice(item.price)}</span>
        <button>Adicionar</button>
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
function openSkewerModal(j) {
  selectedJantinha = j;
  const box = $("skewer-options");
  box.innerHTML = skewers.map((s, i) => `
    <label class="skewer-option">
      <input type="radio" name="skewer" value="${s}" ${i === 0 ? "checked" : ""}>
      ${s}
    </label>`).join("");

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
 * CHECKOUT
 *********************************/
let orderType = "mesa";

document.querySelectorAll(".order-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".order-btn")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    orderType = btn.dataset.type;
  };
});

$("btn-checkout").onclick = () => {
  if (!cart.length) return alert("Carrinho vazio!");
  if (!lojaAbertaAgora()) return alert("Estamos fechados.");
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
    customer: { name, people, table, type: orderType },
    items: cart,
    total,
    status: "novo",
    createdAt: Date.now()
  });

  cart = [];
  saveCart();
  $("modal").classList.remove("open");
  alert("Pedido enviado 🔥");
};

$("btn-clear").onclick = () => {
  cart = [];
  saveCart();
};

/*********************************
 * INIT
 *********************************/
document.addEventListener("DOMContentLoaded", () => {
  $("year").textContent = new Date().getFullYear();
  renderMenu();
  renderCart();
  atualizarStatusLoja();
  setInterval(atualizarStatusLoja, 60000); // Atualiza a cada 1 minuto
});
