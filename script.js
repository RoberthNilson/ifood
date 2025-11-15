/* ---------- Atualiza Ano ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Carrinho ---------- */
const cartKey = 'brasa_cart_v2';
let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  renderCart();
}

function addToCart(item) {
  const found = cart.find(i => i.id === item.id);
  if (found) found.qty += 1;
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

function formatPrice(n) {
  return 'R$ ' + Number(n).toFixed(2).replace('.', ',');
}

function renderCart() {
  const ul = document.getElementById('cart');
  ul.innerHTML = '';

  if (cart.length === 0) {
    document.getElementById('empty').style.display = 'block';
    document.getElementById('total').textContent = 'R$ 0,00';
    return;
  }

  document.getElementById('empty').style.display = 'none';
  let total = 0;

  cart.forEach(it => {
    total += it.price * it.qty;

    const li = document.createElement('li');
    li.className = 'cart-item';

    li.innerHTML = `
      <div style="flex:1">
        <strong>${it.name}</strong>
        <div class="small">${formatPrice(it.price)} x ${it.qty}</div>
      </div>

      <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-end;">
        <div>
          <button class="secondary" onclick="changeQty('${it.id}',1)">+</button>
          <button class="secondary" onclick="changeQty('${it.id}',-1)">-</button>
        </div>
        <button class="secondary" onclick="removeFromCart('${it.id}')">Remover</button>
      </div>
    `;

    ul.appendChild(li);
  });

  document.getElementById('total').textContent = formatPrice(total);
}

window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;

document.getElementById('btn-clear').addEventListener('click', () => {
  cart = [];
  saveCart();
});

/* ---------- Menu ---------- */
const menuItems = [
  { id: '1', name: 'Carne', price: 10.00, description: 'Espetinho de carne suculenta', category: 'Espetinhos' },
  { id: '2', name: 'Asinha', price: 10.00, description: 'Asinha temperada', category: 'Espetinhos' },
  { id: '3', name: 'Frango com Bacon', price: 10.00, description: 'Frango enrolado em bacon', category: 'Espetinhos' },

  { id: '5', name: 'Arroz', price: 5.00, description: 'Arroz simples', category: 'Acompanhamentos' },
  { id: '6', name: 'Feijão tropeiro', price: 5.00, description: 'Feijão tropeiro', category: 'Acompanhamentos' },
  { id: '7', name: 'Mandioca cozida', price: 5.00, description: 'Mandioca cozida', category: 'Acompanhamentos' },
  { id: '8', name: 'Vinagrete', price: 5.00, description: 'Vinagrete temperado', category: 'Acompanhamentos' },

  { id: '27', name: 'Heineken', price: 6.00, description: 'Heineken 600ml', category: 'Bebidas' },
  { id: '28', name: 'Skoll', price: 6.00, description: 'Skoll 600ml', category: 'Bebidas' },
  { id: '29', name: 'Original', price: 6.00, description: 'Original 600ml', category: 'Bebidas' },

  { id: '30', name: 'Coca-Cola Lata', price: 6.00, description: '350ml', category: 'Bebidas' },
  { id: '31', name: 'Guaraná Lata', price: 6.00, description: '350ml', category: 'Bebidas' },

  { id: '40', name: 'Suco Maracujá Copo', price: 10.00, description: 'Natural', category: 'Bebidas' },
  { id: '41', name: 'Suco Cajá Copo', price: 10.00, description: 'Natural', category: 'Bebidas' },

  { id: '23', name: 'Simples', price: 10.00, description: 'Jantinha simples', category: 'Jantinhas' },
  { id: '24', name: 'Completa', price: 18.00, description: 'Jantinha completa', category: 'Jantinhas' },
  { id: '25', name: 'Retirada', price: 19.00, description: 'Para retirada', category: 'Jantinhas' },
];

/* ---------- Espetos (sem preço) ---------- */
const skewers = [
  { id: '1', name: 'Carne' },
  { id: '2', name: 'Asinha' },
  { id: '3', name: 'Frango com Bacon' }
];

let currentJantinha = null;

/* ---------- Abrir Modal de Espetos ---------- */
function openSkewerModal(jantinha) {
  currentJantinha = jantinha;

  const wrap = document.getElementById('skewer-options');
  wrap.innerHTML = '';

  skewers.forEach(s => {
    const div = document.createElement('div');
    div.innerHTML = `
      <label class="skewer-option">
        <input 
          type="radio" 
          name="skewer" 
          value="${s.id}" 
          data-name="${s.name}"
          data-price="0"
        >
        ${s.name}
      </label>
    `;
    wrap.appendChild(div);
  });

  const modal = document.getElementById('modal-skewer');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

/* ---------- Confirmar Espeto ---------- */
document.getElementById('skewer-confirm').addEventListener('click', () => {
  const selected = document.querySelector('input[name="skewer"]:checked');
  if (!selected) return alert('Escolha um espeto.');

  const espeto = {
    id: selected.value,
    name: selected.dataset.name,
    price: 0
  };

  addToCart({
    id: `${currentJantinha.id}-${espeto.id}`,
    name: `${currentJantinha.name} + ${espeto.name}`,
    price: currentJantinha.price
  });

  const modal = document.getElementById('modal-skewer');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
});

/* ---------- Cancelar ---------- */
document.getElementById('skewer-cancel').addEventListener('click', () => {
  const modal = document.getElementById('modal-skewer');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
});

/* ---------- Carregar Menu ---------- */
function loadMenu(items) {
  const wrap = document.getElementById('menu');
  wrap.innerHTML = '';

  const categories = [...new Set(items.map(i => i.category))];

  categories.forEach(cat => {
    const h = document.createElement('h3');
    h.textContent = cat;
    wrap.appendChild(h);

    items
      .filter(i => i.category === cat)
      .forEach(it => {
        const card = document.createElement('div');
        card.className = 'dish';

        card.innerHTML = `
          <div class="meta">
            <h4>${it.name}</h4>
            <p class="small">${it.description}</p>

            <div style="display:flex; gap:8px; align-items:center; margin-top:6px;">
              <div class="price">${formatPrice(it.price)}</div>
              <button class="add-btn">Adicionar</button>
            </div>
          </div>
        `;

        const btn = card.querySelector('.add-btn');

        if (it.category === 'Jantinhas') {
          btn.addEventListener('click', () =>
            openSkewerModal({ id: it.id, name: it.name, price: it.price })
          );
        } else {
          btn.addEventListener('click', () =>
            addToCart({ id: it.id, name: it.name, price: it.price })
          );
        }

        wrap.appendChild(card);
      });
  });
}

loadMenu(menuItems);
renderCart();

/* ---------- Checkout ---------- */
const modal = document.getElementById('modal');
const orderTypeEls = document.getElementsByName('orderType');
const tableGroup = document.getElementById('table-group');
const addressGroup = document.getElementById('address-group');
const custTable = document.getElementById('cust-table');
const custPeople = document.getElementById('cust-people');
const custAddress = document.getElementById('cust-address');
const custName = document.getElementById('cust-name');
const custPhone = document.getElementById('cust-phone');
const phoneGroup = custPhone.closest('div');

document.getElementById('btn-checkout').addEventListener('click', () => {
  if (cart.length === 0) return alert('Adicione itens ao carrinho primeiro.');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
});

document.getElementById('modal-cancel').addEventListener('click', () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
});

function getSelectedOrderType() {
  for (const r of orderTypeEls) if (r.checked) return r.value;
  return 'mesa';
}

function updateOrderTypeUI() {
  const type = getSelectedOrderType();

  if (type === 'mesa') {
    tableGroup.style.display = '';
    addressGroup.style.display = 'none';
    phoneGroup.style.display = 'none';
    custAddress.required = false;
    custTable.required = true;
    custPeople.required = true;
    custPhone.required = false;
  } else {
    tableGroup.style.display = 'none';
    addressGroup.style.display = '';
    phoneGroup.style.display = '';
    custAddress.required = true;
    custTable.required = false;
    custPeople.required = false;
    custPhone.required = true;
  }
}

for (const r of orderTypeEls) r.addEventListener('change', updateOrderTypeUI);
updateOrderTypeUI();

document.getElementById('modal-confirm').addEventListener('click', async () => {
  const name = custName.value.trim();
  const phone = custPhone.value.trim();
  const type = getSelectedOrderType();
  const table = custTable.value.trim();
  const people = custPeople.value.trim();
  const address = custAddress.value.trim();

  if (!name) return alert('Preencha o nome.');
  if (type === 'endereco' && (!address || !phone)) return alert('Preencha endereço e telefone.');
  if (type === 'mesa' && (!table || !people)) return alert('Informe mesa e pessoas.');

  const deliveryFee = type === 'endereco' ? 4 : 0;
  const totalAmount = cart.reduce((s, i) => s + i.price * i.qty, 0) + deliveryFee;

  const order = {
    customer: {
      name,
      phone: type === 'endereco' ? phone : null,
      address: type === 'endereco' ? address : null,
      table: type === 'mesa' ? table : null,
      people: type === 'mesa' ? people : null,
      type
    },
    items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    total: totalAmount,
    deliveryFee,
    status: 'pending',
    createdAt: serverTimestamp()
  };

  try {
    await push(ref(db, 'orders'), order);
    cart = [];
    saveCart();

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');

    custName.value = "";
    custPhone.value = "";
    custAddress.value = "";
    custTable.value = "";
    custPeople.value = "";

    document.querySelector("input[name='orderType'][value='mesa']").checked = true;
    updateOrderTypeUI();

    alert("Pedido enviado com sucesso! 🔥");
  } catch (err) {
    console.error('Erro ao salvar pedido no Firebase:', err);
    alert('Erro ao salvar pedido.');
  }
});
