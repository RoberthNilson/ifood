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

const $ = id => document.getElementById(id);
const formatPrice = v => "R$ " + Number(v || 0).toFixed(2).replace(".", ",");

function lojaAbertaAgora() {
  const agora = new Date();
  const dia = agora.getDay();
  const minutos = agora.getHours()*60 + agora.getMinutes();
  if(dia===0) return false;
  return minutos>=17*60 && minutos<22*60;
}

function atualizarStatusLoja() {
  const tag = document.querySelector(".tag");
  if(!tag) return;
  if(!lojaAbertaAgora()){ tag.textContent="Fechado"; return; }
  tag.textContent="Aberto";
}

// CART
let cart = JSON.parse(localStorage.getItem("brasa_cart_v5")) || [];

function saveCart(){ localStorage.setItem("brasa_cart_v5", JSON.stringify(cart)); renderCart(); }

function addToCart(item){
  const found = cart.find(i=>i.id===item.id);
  found?found.qty++:cart.push({...item, qty:1});
  saveCart();
}

function updateQty(id, delta){
  const item = cart.find(i=>i.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0) cart = cart.filter(i=>i.id!==id);
  saveCart();
}

function renderCart(){
  const list=$("cart"), totalEl=$("total"), empty=$("empty");
  list.innerHTML="";
  if(!cart.length){ empty.style.display="block"; totalEl.textContent="R$ 0,00"; return; }
  empty.style.display="none";
  let total=0;
  cart.forEach(item=>{
    total+=item.price*item.qty;
    const li=document.createElement("li");
    li.className="cart-item";
    li.innerHTML=`
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
  totalEl.textContent=formatPrice(total);
  list.querySelectorAll("button").forEach(btn=>{
    if(btn.dataset.inc) btn.onclick=()=>updateQty(btn.dataset.inc,1);
    if(btn.dataset.dec) btn.onclick=()=>updateQty(btn.dataset.dec,-1);
    if(btn.dataset.rem) btn.onclick=()=>{ cart=cart.filter(i=>i.id!==btn.dataset.rem); saveCart(); }
  });
}

// MENU
const menuItems=[
  { id:"1", name:"Espetinho Simples", price:10, category:"Jantinhas" },
  { id:"2", name:"Jantinha Completa", price:20, category:"Jantinhas" },
  { id:"3", name:"Retirada", price:21, category:"Jantinhas" },
  { id:"7", name:"Arroz", price:5, category:"Acompanhamentos" },
  { id:"8", name:"Feijão Tropeiro", price:5, category:"Acompanhamentos" },
  { id:"9", name:"Mandioca", price:5, category:"Acompanhamentos" },
  { id:"10", name:"Vinagrete", price:5, category:"Acompanhamentos" },
  { id:"11", name:"Coca-Cola Lata", price:6, category:"Bebidas" },
  { id:"12", name:"Guaraná Lata", price:6, category:"Bebidas" },
  { id:"13", name:"Coca-Cola 1L", price:10, category:"Bebidas" },
  { id:"14", name:"Guaraná 1L", price:10, category:"Bebidas" },
  { id:"15", name:"Coca-Cola 2L", price:15, category:"Bebidas" },
  { id:"16", name:"Guaraná 2L", price:15, category:"Bebidas" },
  { id:"17", name:"Água Mineral 500ml", price:3, category:"Bebidas" },
  { id:"18", name:"Skol 600ml", price:12, category:"Bebidas" },
  { id:"19", name:"Original 600ml", price:12, category:"Bebidas" },
  { id:"20", name:"Heineken 600ml", price:15, category:"Bebidas" },
  { id:"21", name:"Maracujá Copo", price:10, category:"Sucos Copo" },
  { id:"22", name:"Cajá Copo", price:10, category:"Sucos Copo" },
  { id:"23", name:"Goiaba Copo", price:10, category:"Sucos Copo" },
  { id:"24", name:"Acerola Copo", price:10, category:"Sucos Copo" },
  { id:"25", name:"Maracujá Jarra", price:20, category:"Sucos Jarra" },
  { id:"26", name:"Cajá Jarra", price:20, category:"Sucos Jarra" },
  { id:"27", name:"Goiaba Jarra", price:20, category:"Sucos Jarra" },
  { id:"28", name:"Acerola Jarra", price:20, category:"Sucos Jarra" }
];

const skewers=["Carne","Asinha","Frango com Bacon"];
let selectedJantinha=null;

function renderMenu(){
  const wrap=$("menu");
  wrap.innerHTML="";
  [...new Set(menuItems.map(i=>i.category))].forEach(cat=>{
    const h3=document.createElement("h3");
    h3.textContent=cat;
    wrap.appendChild(h3);
    menuItems.filter(i=>i.category===cat).forEach(item=>{
      const div=document.createElement("div");
      div.className="dish";
      if(item.category==="Jantinhas") div.classList.add("jantinha-card");
      div.innerHTML=`
        <strong>${item.name}</strong>
        <span class="price">${formatPrice(item.price)}</span>
      `;
      div.onclick=()=>{
        if(item.category==="Jantinhas"){
          selectedJantinha=item;
          $("modal-skewer").classList.add("open");
          renderSkewers();
        } else addToCart(item);
      };
      wrap.appendChild(div);
    });
  });
}

function renderSkewers(){
  const wrap=$("skewer-options");
  wrap.innerHTML="";
  skewers.forEach((s,i)=>{
    const div=document.createElement("div");
    div.className="skewer-option";
    div.innerHTML=`<input type="radio" name="skewer" id="skewer-${i}" value="${s}"> <label for="skewer-${i}">${s}</label>`;
    wrap.appendChild(div);
  });
}

// EVENTOS MODAL SKEWER
$("skewer-cancel").onclick=()=>{ $("modal-skewer").classList.remove("open"); }
$("skewer-confirm").onclick=()=>{
  const sel = document.querySelector('input[name="skewer"]:checked');
  if(!sel){ alert("Selecione um espeto!"); return; }
  addToCart({...selectedJantinha, skewer: sel.value});
  $("modal-skewer").classList.remove("open");
  selectedJantinha=null;
};

// CHECKOUT
let orderType="mesa";

document.querySelectorAll(".order-btn").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".order-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    orderType=btn.dataset.type;
    $("box-mesa").style.display=orderType==="mesa"?"block":"none";
    $("box-levar").style.display=orderType==="levar"?"block":"none";
  };
});

$("modal-cancel").onclick=()=>$("modal").classList.remove("open");
$("btn-checkout").onclick=()=>cart.length? $("modal").classList.add("open") : alert("Carrinho vazio");
$("btn-clear").onclick=()=>{ cart=[]; saveCart(); };

// ENVIAR PEDIDO
$("modal-confirm").onclick=async()=>{
  let customer;
  if(orderType==="mesa"){
    const name=$("cust-name").value.trim();
    const people=$("cust-people").value;
    const table=$("cust-table").value;
    if(!name || !people || !table){ alert("Preencha todos os campos!"); return; }
    customer={name, people, table, type:orderType};
  } else {
    const name=$("cust-name-levar").value.trim();
    const rua=$("cust-rua").value.trim();
    const numero=$("cust-numero").value.trim();
    const bairro=$("cust-bairro").value.trim();
    if(!name||!rua||!numero||!bairro){ alert("Preencha todos os campos!"); return; }
    customer={name, rua, numero, bairro, type:orderType};
  }
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  await push(ref(db,"orders"), { customer, items: cart, total, status:"novo", createdAt:Date.now() });
  cart=[]; saveCart();
  $("modal").classList.remove("open");
  alert("Pedido enviado com sucesso 🔥");
};

// INICIALIZAÇÃO
renderMenu();
renderCart();
atualizarStatusLoja();
$("year").textContent=new Date().getFullYear();
