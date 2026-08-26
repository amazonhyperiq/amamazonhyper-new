const categories=[
{name:"لحوم ودواجن",icon:"🥩",color:"#ef5b57",unit:"kg",unitLabel:"بالكيلوغرام"},
{name:"خضروات وفواكه",icon:"🍎",color:"#67bd45",unit:"kg",unitLabel:"بالكيلوغرام"},
{name:"الألبان ومشتقاتها",icon:"🥛",color:"#4ea6d8",unit:"piece",unitLabel:"بالقطعة"},
{name:"مواد غذائية",icon:"🛒",color:"#f3a11d",unit:"piece",unitLabel:"بالقطعة"},
{name:"منظفات",icon:"🧴",color:"#a84ad2",unit:"piece",unitLabel:"بالقطعة"},
{name:"كوزمتك وعناية",icon:"💄",color:"#ef6ba9",unit:"piece",unitLabel:"بالقطعة"},
{name:"منتجات أطفال",icon:"🍼",color:"#36b6b0",unit:"piece",unitLabel:"بالقطعة"}
];
const products=[
{cat:"مواد غذائية",name:"رز بسمتي هندي 5 كغ",price:15000,icon:"🍚",unit:"piece",step:1},
{cat:"مواد غذائية",name:"زيت نباتي 1.8 لتر",price:5500,icon:"🫗",unit:"piece",step:1},
{cat:"مواد غذائية",name:"سكر أبيض 1 كغ",price:1500,icon:"🧂",unit:"piece",step:1},
{cat:"لحوم ودواجن",name:"صدر دجاج عراقي",price:8000,icon:"🍗",unit:"kg",step:.25},
{cat:"لحوم ودواجن",name:"لحم غنم",price:22000,icon:"🥩",unit:"kg",step:.25},
{cat:"منظفات",name:"برسيل جل 3 لتر",price:7500,icon:"🧴",unit:"piece",step:1},
{cat:"كوزمتك وعناية",name:"شامبو 400 مل",price:4500,icon:"🧴",unit:"piece",step:1}
];
const offers=[
{title:"عرض خاص على المواد الغذائية",from:"01/09/2026",to:"05/09/2026",items:["رز بسمتي","زيت نباتي","سكر أبيض","مكرونة","تونة"]},
{title:"خصم خاص",from:"06/09/2026",to:"10/09/2026",items:["منظفات","كوزمتك","منتجات أطفال"]}
];
let cart={};
const fmt=n=>Math.round(n).toLocaleString("ar-IQ")+" د.ع";
function renderCategories(){
document.querySelector("#categories").innerHTML=categories.map(c=>`<button class="cat" style="background:${c.color}" data-cat="${c.name}"><span>${c.icon}</span>${c.name}<small>${c.unitLabel}</small></button>`).join("");
document.querySelectorAll(".cat").forEach(b=>b.addEventListener("click",()=>renderProducts(b.dataset.cat)));
}
function renderOffers(){document.querySelector("#offerCards").innerHTML=offers.map(o=>`<article class="offer"><strong>${o.title}</strong><div class="date">من ${o.from} إلى ${o.to}</div><div class="offer-items">${o.items.map(x=>"• "+x).join("　")}</div></article>`).join("")}
function renderProducts(cat="مواد غذائية"){
document.querySelector("#productsTitle").textContent=cat;
let list=products.filter(p=>p.cat===cat); if(!list.length) list=products.filter(p=>p.cat==="مواد غذائية");
document.querySelector("#productsGrid").innerHTML=list.map(p=>{
const q=cart[p.name]?.qty||0; const unit=p.unit==="kg"?"كغ":"قطعة";
return `<article class="product"><div class="pic">${p.icon}</div><h3>${p.name}</h3><div class="price">${fmt(p.price)} <span class="unit">/ ${unit}</span></div><div class="qty"><button type="button" data-minus="${p.name}">−</button><span class="num">${p.unit==="kg"?q.toFixed(2):q}</span><button type="button" data-plus="${p.name}">+</button></div><button class="add" data-add="${p.name}">أضف إلى السلة</button></article>`}).join("");
document.querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>changeQty(b.dataset.minus,-1));
document.querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>changeQty(b.dataset.plus,1));
document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{if(!cart[b.dataset.add])changeQty(b.dataset.add,1);else updateCart()});
}
function changeQty(name,direction){
const p=products.find(x=>x.name===name); if(!p)return;
let q=cart[name]?.qty||0; q=Math.max(0,q+(p.unit==="kg"?p.step:1));
if(direction<0) q=Math.max(0,(cart[name]?.qty||0)-(p.unit==="kg"?p.step:1));
if(q===0) delete cart[name]; else cart[name]={...p,qty:q};
updateCart(); renderProducts(p.cat);
}
function updateCart(){
let total=0,count=0; Object.values(cart).forEach(x=>{total+=x.price*x.qty;count+=x.unit==="kg"?1:x.qty});
document.querySelector("#cartCount").textContent=count;
document.querySelector("#cartTotal").textContent=fmt(total);
}
document.querySelector("#whatsappBtn").addEventListener("click",()=>{
const name=document.querySelector("#customerName").value.trim(),phone=document.querySelector("#customerPhone").value.trim(),address=document.querySelector("#customerAddress").value.trim(),notes=document.querySelector("#notes").value.trim();
if(!name||!phone||!address){alert("يرجى إدخال الاسم ورقم الهاتف والعنوان قبل إرسال الطلب.");return}
const items=Object.values(cart); if(!items.length){alert("السلة فارغة.");return}
let total=0; const lines=items.map((x,i)=>{const line=x.price*x.qty;total+=line;return `${i+1}. ${x.name} — ${x.qty}${x.unit==="kg"?" كغ":" قطعة"} — ${fmt(line)}`}).join("\n");
const msg=`طلب جديد من أمازون هايبر ماركت\n\nالاسم: ${name}\nالهاتف: ${phone}\nالعنوان: ${address}\n\n${lines}\n\nالإجمالي التقديري: ${fmt(total)}\n\nتنبيه: بعض المواد تباع بالوزن، وقد يختلف الوزن الفعلي والسعر النهائي قليلاً بعد التجهيز. سيتم تأكيد الوزن والسعر النهائي مع الزبون قبل التسليم.\nالملاحظات: ${notes||"لا توجد"}`;
window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank");
});
renderCategories();renderOffers();renderProducts();updateCart();
