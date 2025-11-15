/* script.js (único arquivo) */

/* ===========================
   IMPORTS FIREBASE (modular)
   =========================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

/* ===========================
   CONFIG FIREBASE
   =========================== */
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

/* ===========================
   Atualiza ano no rodapé
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
  const elYear = document.getElementById('year');
  if (elYear) elYear.textContent = new Date().getFullYear();
});

/* ===========================
   Utilidades
   =========================== */
function formatPrice(n) {
  return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
}

/* ===========================
   Carrinho (localStorage)
   =========================== */
const cartKey = 'brasa_cart_v2';
let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
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

/* Renderiza carrinho na UI */
function renderCart() {
  const ul = document.getElementById('cart') || document.getElementById('cart-items');
  const emptyMsg = document.getElementById('empty');
  const totalEl = document.getElementById('total') || document.getElementById('cart-total');

  if (!ul || !totalEl) return;

  ul.innerHTML = '';

  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    totalEl.textContent = 'R$ 0,00';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';

  let total = 0;

  cart.forEach(it => {
    total += (it.price || 0) * it.qty;

    const li = document.createElement('li');
    li.className = 'cart-item';

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

  // Delegação de eventos para os botões
  ul.querySelectorAll('button').forEach(btn => {
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (!action) return;
    btn.addEventListener('click', () => {
      if (action === 'inc') changeQty(id, 1);
      if (action === 'dec') changeQty(id, -1);
      if (action === 'remove') removeFromCart(id);
    });
  });
}

/* Limpar carrinho */
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'btn-clear') {
    cart = [];
    saveCart();
  }
});

/* ===========================
   Menu & Itens
   =========================== */
const menuItems = [
  { id: '1', name: 'Carne', price: 10, description: 'Espetinho de carne', category: 'Espetinhos' },
  { id: '2', name: 'Asinha', price: 10, description: 'Asinha temperada', category: 'Espetinhos' },
  { id: '3', name: 'Frango com Bacon', price: 10, description: 'Frango com bacon', category: 'Espetinhos' },

  { id: '5', name: 'Arroz', price: 5, description: 'Arroz simples', category: 'Acompanhamentos' },
  { id: '6', name: 'Feijão Tropeiro', price: 5, description: 'Tropeiro', category: 'Acompanhamentos' },
  { id: '7', name: 'Mandioca', price: 5, description: 'Mandioca cozida', category: 'Acompanhamentos' },
  { id: '8', name: 'Vinagrete', price: 5, description: 'Vinagrete', category: 'Acompanhamentos' },

  { id: '27', name: 'Heineken 600ml', price: 6, description: 'Cerveja', category: 'Bebidas' },
  { id: '28', name: 'Skol 600ml', price: 6, description: 'Cerveja', category: 'Bebidas' },
  { id: '29', name: 'Original 600ml', price: 6, description: 'Cerveja', category: 'Bebidas' },

  { id: '23', name: 'Jantinha Simples', price: 10, description: 'Simples', category: 'Jantinhas' },
  { id: '24', name: 'Jantinha Completa', price: 18, description: 'Completa', category: 'Jantinhas' },
  { id: '25', name: 'Retirada', price: 19, description: 'Para viagem', category: 'Jantinhas' }
];

function loadMenu(items) {
  const wrap = document.getElementById('menu');
  if (!wrap) return;

  wrap.innerHTML = '';

  const categories = [...new Set(items.map(i => i.category))];

  categories.forEach(cat => {
    const h = document.createElement('h3');
    h.textContent = cat;
    wrap.appendChild(h);

    items.filter(i => i.category === cat).forEach(it => {
      const div = document.createElement('div');
      div.className = 'dish';

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

      const btn = div.querySelector('.add-btn');

      if (it.category === "Jantinhas") {
        btn.addEventListener('click', () => openSkewerModal(it));
      } else {
        btn.addEventListener('click', () => addToCart(it));
      }

      wrap.appendChild(div);
    });
  });
}

/* ===========================
   Espetos (modal) — sem preço
   =========================== */
const skewers = [
  { id: '1', name: 'Carne' },
  { id: '2', name: 'Asinha' },
  { id: '3', name: 'Frango com Bacon' }
];

let currentJantinha = null;

function openSkewerModal(jantinha) {
  currentJantinha = jantinha;
  const w = document.getElementById('skewer-options');
  if (!w) return alert('Modal de espetos não encontrado.');

  w.innerHTML = '';

  skewers.forEach(s => {
    w.innerHTML += `
      <label class="skewer-option">
        <input type="radio" name="skewer" value="${s.id}" data-name="${s.name}">
        ${s.name}
      </label>
    `;
  });

  const modal = document.getElementById('modal-skewer');
  if (modal) modal.classList.add('open');
}

/* confirmação/cancelar do modal de espetos */
document.addEventListener('click', (e) => {
  if (!e.target) return;

  if (e.target.id === 'skewer-confirm') {
    const selected = document.querySelector("input[name='skewer']:checked");
    if (!selected) return alert("Escolha um espeto.");
    const espetoName = selected.dataset.name;

    addToCart({
      id: currentJantinha.id + "-" + selected.value,
      name: `${currentJantinha.name} + ${espetoName}`,
      price: currentJantinha.price
    });

    const modal = document.getElementById('modal-skewer');
    if (modal) modal.classList.remove('open');
  }

  if (e.target.id === 'skewer-cancel') {
    const modal = document.getElementById('modal-skewer');
    if (modal) modal.classList.remove('open');
  }
});

/* ===========================
   Checkout modal & envio
   =========================== */
function getOrderType() {
  const sel = document.querySelector("input[name='orderType']:checked");
  return sel ? sel.value : 'endereco';
}

function updateOrderUI() {
  const type = getOrderType();
  const tableGroup = document.getElementById('table-group');
  const addressGroup = document.getElementById('address-group');
  const phoneGroup = document.getElementById('phone-group');

  if (tableGroup) tableGroup.style.display = type === "mesa" ? "" : "none";
  if (addressGroup) addressGroup.style.display = type === "endereco" ? "" : "none";
  if (phoneGroup) phoneGroup.style.display = type === "endereco" ? "" : "none";
}

document.addEventListener('change', (e) => {
  if (e.target && e.target.name === 'orderType') updateOrderUI();
});

document.addEventListener('click', (e) => {
  if (!e.target) return;

  if (e.target.id === 'btn-checkout') {
    if (cart.length === 0) return alert("Carrinho vazio.");
    const modal = document.getElementById('modal');
    if (modal) modal.classList.add('open');
  }

  if (e.target.id === 'modal-cancel') {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('open');
  }
});

/* Enviar pedido para Firebase */
document.addEventListener('click', async (e) => {
  if (!e.target) return;
  if (e.target.id !== 'modal-confirm') return;

  try {
    const name = document.getElementById('cust-name')?.value.trim() || '';
    const phone = document.getElementById('cust-phone')?.value.trim() || '';
    const address = document.getElementById('cust-address')?.value.trim() || '';
    const table = document.getElementById('cust-table')?.value.trim() || '';
    const people = document.getElementById('cust-people')?.value.trim() || '';
    const type = getOrderType();

    if (!name) return alert("Preencha seu nome.");
    if (type === "endereco" && (!address || !phone)) return alert("Preencha endereço e telefone.");
    if (type === "mesa" && (!table || !people)) return alert("Preencha mesa e pessoas.");

    const deliveryFee = type === "endereco" ? 4 : 0;
    const total = cart.reduce((s, i) => s + (i.price || 0) * i.qty, 0) + deliveryFee;

    const order = {
      customer: {
        name,
        phone: type === "endereco" ? phone : null,
        address: type === "endereco" ? address : null,
        table: type === "mesa" ? table : null,
        people: type === "mesa" ? people : null,
        type
      },
      items: cart,
      total,
      deliveryFee,
      status: "pending",
      createdAt: Date.now()
    };

    await push(ref(db, 'orders'), order);

    cart = [];
    saveCart();

    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('open');

    alert("Pedido enviado com sucesso! 🔥");

    // limpar campos
    ['cust-name','cust-phone','cust-address','cust-table','cust-people']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

  } catch (err) {
    console.error(err);
    alert("Erro ao enviar pedido. Veja o console para detalhes.");
  }
});

/* ===========================
   Inicialização UI
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
  loadMenu(menuItems);
  renderCart();
  updateOrderUI();
});
