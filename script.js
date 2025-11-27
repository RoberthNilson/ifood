import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Config Firebase
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

// Atualiza ano no rodapé
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
});

// Utilidade
function formatPrice(n){ return "R$ "+Number(n||0).toFixed(2).replace(".",","); }

// Carrinho
let cart = JSON.parse(localStorage.getItem("brasa_cart_v2") || "[]");
function saveCart(){ localStorage.setItem("brasa_cart_v2",JSON.stringify(cart)); renderCart(); }
function addToCart(item){ const exists = cart.find(i=>i.id===item.id); if(exists) exists.qty++; else cart.push({...item,qty:1}); saveCart(); }
function removeFromCart(id){ cart = cart.filter(i=>i.id!==id); saveCart(); }
function changeQty(id,delta){ const item = cart.find(i=>i.id===id); if(!item) return; item.qty+=delta; if(item.qty<=0) removeFromCart(id); else saveCart(); }

// Renderiza carrinho
function renderCart(){
  const ul = document.getElementById("cart");
  const emptyMsg = document.getElementById("empty");
  const totalEl = document.getElementById("total");
  if(!ul||!totalEl) return;
  ul.innerHTML="";
  if(cart.length===0){ if(emptyMsg) emptyMsg.style.display="block"; totalEl.textContent="R$ 0,00"; return; }
  if(emptyMsg) emptyMsg.style.display="none";
  let total=0;
  cart.forEach(it=>{
    total+=(it.price||0)*it.qty;
    const li=document.createElement("li");
    li.className="cart-item";
    li.innerHTML=`
      <div style="flex:1;"><strong>${it.name}</strong><div class="small">${formatPrice(it.price)} x ${it.qty}</div></div>
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
  totalEl.textContent=formatPrice(total);
  ul.querySelectorAll("button").forEach(btn=>{
    const action=btn.dataset.action, id=btn.dataset.id;
    btn.addEventListener("click",()=>{ if(action==="inc") changeQty(id,1); if(action==="dec") changeQty(id,-1); if(action==="remove") removeFromCart(id); });
  });
}

// Limpar carrinho
document.addEventListener("click", e=>{ if(e.target.id==="btn-clear"){ cart=[]; saveCart(); } });

// Menu
const menuItems=[
  {id:"1", name:"Jantinha Simples", price:10, category:"Jantinhas"},
  {id:"2", name:"Jantinha Completa", price:20, category:"Jantinhas"},
  {id:"4", name:"Carne", price:10, category:"Espetinhos"},
  {id:"5", name:"Asinha", price:10, category:"Espetinhos"},
  {id:"6", name:"Frango com Bacon", price:10, category:"Espetinhos"},
  {id:"7", name:"Arroz", price:5, category:"Acompanhamentos"},
  {id:"8", name:"Feijão Tropeiro", price:5, category:"Acompanhamentos"},
  {id:"9", name:"Mandioca", price:5, category:"Acompanhamentos"},
  {id:"10", name:"Vinagrete", price:5, category:"Acompanhamentos"},
  {id:"11", name:"Coca-Cola Lata", price:6, category:"Bebidas"},
  {id:"12", name:"Guaraná Lata", price:6, category:"Bebidas"},
  {id:"13", name:"Coca-Cola 1L", price:10, category:"Bebidas"},
  {id:"14", name:"Guaraná 1L", price:10, category:"Bebidas"},
  {id:"15", name:"Coca-Cola 2L", price:15, category:"Bebidas"},
  {id:"16", name:"Guaraná 2L", price:15, category:"Bebidas"},
  {id:"17", name:"Água Mineral 500ml", price:3, category:"Bebidas"},
  {id:"18", name:"Skol 600ml", price:12, category:"Bebidas"},
  {id:"19", name:"Original 600ml", price:12, category:"Bebidas"},
  {id:"20", name:"Heineken 600ml", price:15, category:"Bebidas"}
];

function loadMenu(items){
  const wrap=document.getElementById("menu");
  if(!wrap) return;
  wrap.innerHTML="";
  const categories=[...new Set(items.map(i=>i.category))];
  categories.forEach(cat=>{
    const h=document.createElement("h3"); h.textContent=cat; wrap.appendChild(h);
    items.filter(i=>i.category===cat).forEach(it=>{
      const div=document.createElement("div"); div.className="dish";
      div.innerHTML=`<div class="meta"><h4>${it.name}</h4><div class="price">${formatPrice(it.price)}</div><button class="add-btn">Adicionar</button></div>`;
      const btn=div.querySelector(".add-btn");
      btn.addEventListener("click",()=> addToCart(it));
      wrap.appendChild(div);
    });
  });
}

// Modal Espetos
const skewers=[
  {id:"1", name:"Carne"},
  {id:"2", name:"Asinha"},
  {id:"3", name:"Frango com Bacon"}
];
let currentJantinha=null;
function openSkewerModal(jantinha){
  currentJantinha=jantinha;
  const w=document.getElementById("skewer-options"); if(!w) return;
  w.innerHTML="";
  skewers.forEach(s=>{
    w.innerHTML+=`<label class="skewer-option"><input type="radio" name="skewer" value="${s.id}" data-name="${s.name}">${s.name}</label>`;
  });
  document.getElementById("modal-skewer").classList.add("open");
}
document.addEventListener("click", e=>{
  if(e.target.id==="skewer-confirm"){
    const selected=document.querySelector('input[name="skewer"]:checked');
    if(!selected) return alert("Selecione um espeto");
    addToCart({id:currentJantinha.id+"-"+selected.value, name:currentJantinha.name+" - "+selected.dataset.name, price:currentJantinha.price});
    document.getElementById("modal-skewer").classList.remove("open");
  }
  if(e.target.id==="skewer-cancel") document.getElementById("modal-skewer").classList.remove("open");
});

// Modal Checkout
document.getElementById("btn-checkout").addEventListener("click", ()=>document.getElementById("modal").classList.add("open"));
document.getElementById("modal-cancel").addEventListener("click", ()=>document.getElementById("modal").classList.remove("open"));
document.getElementById("modal-confirm").addEventListener("click", async ()=>{
  const name=document.getElementById("cust-name")?.value.trim();
  const table=document.getElementById("cust-table")?.value.trim();
  const people=document.getElementById("cust-people")?.value.trim();
  if(!name||!table||!people) return alert("Preencha todos os campos!");
  if(cart.length===0) return alert("Carrinho vazio!");
  const total = cart.reduce((sum,i)=>sum+(i.price||0)*i.qty,0);
  const order={ customer:{name,table,people,type:"mesa"}, items:cart, total, status:"pending", createdAt:Date.now() };
  try { await push(ref(db,"orders"),order); cart=[]; saveCart(); document.getElementById("modal").classList.remove("open"); ["cust-name","cust-table","cust-people"].forEach(id=>document.getElementById(id).value=""); alert("Pedido enviado! 🔥"); }
  catch(err){ console.error(err); alert("Erro ao enviar pedido"); }
});

// Inicializa
loadMenu(menuItems);
renderCart();
