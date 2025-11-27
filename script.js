import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ===========================
// CONFIG FIREBASE
// ===========================
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

// ===========================
// UTILIDADES
// ===========================
function formatPrice(n) {
  return "R$ " + Number(n || 0).toFixed(2).replace(".", ",");
}

// ===========================
// CARRINHO
// ===========================
let cart = JSON.parse(localStorage.getItem("brasa_cart_v2") || "[]");

function saveCart() {
  localStorage.setItem("brasa_cart_v2", JSON.stringify(cart));
  renderCart();
}

function addToCart(item) {
  const exists = cart.find(i => i.id === item.id);
  if (exists) exists.qty++;
  else cart.push({ ...item, qty: 1 });
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else saveCart();
}

function renderCart() {
  const ul = document.getElementById("cart");
  const emptyMsg = document.getElementById("empty");
  const totalEl = document.getElementById("total");
  if (!ul || !totalEl) return;

  ul.innerHTML = "";
  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.style.display = "block";
    totalEl.textContent = "R$ 0,00";
    return;
  }
  if (emptyMsg) emptyMsg.style.display = "none";

  let total = 0;
  cart.forEach(it => {
    total += (it.price || 0) * it.qty;
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <div style="flex:1;">
        <strong>${it.name}</strong>
        <div class="small">${formatPrice(it.price || 0)} x ${it.qty}</div>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <div>
          <button class="secondary" data-action="inc" data-id="${it.id}">+</button>
          <button class="secondary" data-action="dec" data-id="${it.id}">-</button>
        </div>
        <button class="secondary" data-action="remove" data-id="${it.id}">Remover</button>
      </div>
    `;
    ul.appendChild(li);
  });

  totalEl.textContent = formatPrice(total);

  ul.querySelectorAll("button").forEach(btn => {
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    btn.addEventListener("click", () => {
      if (action === "inc") changeQty(id, 1);
      if (action === "dec") changeQty(id, -1);
      if (action === "remove") removeFromCart(id);
    });
  });
}

// ===========================
// MENU
// ===========================
const menuItems = [
  { id: "1", name: "Espetinho Simples", price: 10, description: "Simples", category: "Jantinhas" },
  { id: "2", name: "Jantinha Completa", price: 20, description: "Completa", category: "Jantinhas" },
  { id: "3", name: "Carne", price: 10, description: "Espetinho de carne", category: "Espetinhos" },
  { id: "4", name: "Asinha", price: 10, description: "Asinha temperada", category: "Espetinhos" },
  { id: "5", name: "Frango com Bacon", price: 10, description: "Frango com bacon", category: "Espetinhos" },
  { id: "6", name: "Arroz", price: 5, description: "Arroz simples", category: "Acompanhamentos" },
  { id: "7", name: "Feijão Tropeiro", price: 5, description: "Feijão tropeiro", category: "Acompanhamentos" },
  { id: "8", name: "Mandioca", price: 5, description: "Mandioca cozida", category: "Acompanhamentos" },
  { id: "9", name: "Vinagrete", price: 5, description: "Vinagrete", category: "Acompanhamentos" },
  { id: "10", name: "Coca-Cola Lata", price: 6, description: "Refrigerante", category: "Bebidas" },
  { id: "11", name: "Guaraná Lata", price: 6, description: "Refrigerante", category: "Bebidas" },
  { id: "12", name: "Coca-Cola 1L", price: 10, description: "Refrigerante", category: "Bebidas" },
  { id: "13", name: "Guaraná 1L", price: 10, description: "Refrigerante", category: "Bebidas" }
];

const skewers = [
  { id: "1", name: "Carne" },
  { id: "2", name: "Asinha" },
  { id: "3", name: "Frango com Bacon" }
];

let currentJantinha = null;

// ===========================
// INICIALIZAÇÃO
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  // Atualiza ano
  document.getElementById("year").textContent = new Date().getFullYear();

  // Carrega menu
  const wrap = document.getElementById("menu");
  const categories = [...new Set(menuItems.map(i => i.category))];
  categories.forEach(cat => {
    const h = document.createElement("h3");
    h.textContent = cat;
    wrap.appendChild(h);

    menuItems.filter(i => i.category === cat).forEach(it => {
      const div = document.createElement("div");
      div.className = "dish";
      div.innerHTML = `
        <div class="meta">
          <h4>${it.name}</h4>
          <p class="small">${it.description}</p>
          <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
            <div class="price">${formatPrice(it.price)}</div>
            <button class="add-btn">Adicionar</button>
          </div>
        </div>
      `;
      const btn = div.querySelector(".add-btn");
      if (it.category === "Jantinhas") btn.addEventListener("click", () => openSkewerModal(it));
      else btn.addEventListener("click", () => addToCart(it));
      wrap.appendChild(div);
    });
  });

  renderCart();
});

// ===========================
// MODAL ESPETOS
// ===========================
function openSkewerModal(jantinha) {
  currentJantinha = jantinha;
  const container = document.getElementById("skewer-options");
  container.innerHTML = "";

  skewers.forEach(s => {
    const label = document.createElement("label");
    label.className = "skewer-option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "skewer";
    input.value = s.id;
    input.dataset.name = s.name;
    label.appendChild(input);
    label.appendChild(document.createTextNode(s.name));
    container.appendChild(label);
  });

  document.getElementById("modal-skewer").classList.add("open");
}

document.getElementById("skewer-confirm").addEventListener("click", () => {
  const selected = document.querySelector("input[name='skewer']:checked");
  if (!selected) return alert("Escolha um espeto.");
  addToCart({
    id: currentJantinha.id + "-" + selected.value,
    name: `${currentJantinha.name} - ${selected.dataset.name}`,
    price: currentJantinha.price
  });
  document.getElementById("modal-skewer").classList.remove("open");
});

document.getElementById("skewer-cancel").addEventListener("click", () => {
  document.getElementById("modal-skewer").classList.remove("open");
});

// ===========================
// MODAL CHECKOUT
// ===========================
document.getElementById("btn-checkout")?.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Carrinho vazio! Adicione itens antes de finalizar.");
    return;
  }
  document.getElementById("modal").classList.add("open");
});

document.getElementById("modal-cancel")?.addEventListener("click", () => document.getElementById("modal").classList.remove("open"));

document.getElementById("modal-confirm")?.addEventListener("click", async () => {
  const name = document.getElementById("cust-name")?.value.trim();
  const table = document.getElementById("cust-table")?.value.trim();
  const people = document.getElementById("cust-people")?.value.trim();
  if (!name || !table || !people) return alert("Preencha todos os campos!");
  if (cart.length === 0) return alert("Carrinho vazio!");

  const total = cart.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0);
  const order = { customer: { name, table, people, type: "mesa" }, items: cart, total, status: "pending", createdAt: Date.now() };

  try {
    await push(ref(db, "orders"), order);
    cart = [];
    saveCart();
    ["cust-name","cust-table","cust-people"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("modal").classList.remove("open");
    alert("Pedido enviado! 🔥");
  } catch (err) {
    console.error(err);
    alert("Erro ao enviar pedido");
  }
});

// ===========================
// LIMPAR CARRINHO
// ===========================
document.getElementById("btn-clear")?.addEventListener("click", () => {
  cart = [];
  saveCart();
});

