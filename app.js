const categories = [
  {id:"food", name:"مواد غذائية", icon:"🛒"},
  {id:"cleaning", name:"منظفات", icon:"🧴"},
  {id:"cosmetic", name:"كوزمتك", icon:"💄"},
  {id:"meat", name:"لحوم", icon:"🥩"},
  {id:"chicken", name:"دجاج", icon:"🍗"},
  {id:"vegetables", name:"خضار وفواكه", icon:"🥬"},
  {id:"dairy", name:"ألبان وأجبان", icon:"🥛"},
  {id:"drinks", name:"مشروبات", icon:"🥤"}
];

const products = [
  {id:1,cat:"food",name:"رز عنبر",price:3000,unit:"قطعة",icon:"🍚"},
  {id:2,cat:"food",name:"زيت طبخ",price:4500,unit:"قطعة",icon:"🫗"},
  {id:3,cat:"food",name:"سكر",price:1500,unit:"قطعة",icon:"🍬"},
  {id:4,cat:"food",name:"معجون طماطم",price:1000,unit:"قطعة",icon:"🥫"},
  {id:5,cat:"cleaning",name:"مسحوق غسيل",price:7500,unit:"قطعة",icon:"🧺"},
  {id:6,cat:"cleaning",name:"سائل جلي",price:3000,unit:"قطعة",icon:"🧽"},
  {id:7,cat:"cosmetic",name:"شامبو",price:6500,unit:"قطعة",icon:"🧴"},
  {id:8,cat:"cosmetic",name:"كريم مرطب",price:8500,unit:"قطعة",icon:"🧴"},
  {id:9,cat:"meat",name:"لحم غنم بالعظم",price:22000,unit:"كغم",icon:"🥩"},
  {id:10,cat:"meat",name:"لحم غنم شرح",price:27000,unit:"كغم",icon:"🥩"},
  {id:11,cat:"chicken",name:"دجاج ذبح عراقي",price:5750,unit:"قطعة",icon:"🍗"},
  {id:12,cat:"vegetables",name:"طماطم",price:2000,unit:"كغم",icon:"🍅"}
];

const offers = [
  {title:"عرض الأسبوع",from:"01/09",to:"05/09",items:[
    ["رز عنبر","2,500 د.ع"],["زيت طبخ","4,000 د.ع"],["سكر","1,250 د.ع"],["معجون طماطم","800 د.ع"]
  ]},
  {title:"عرض المنظفات",from:"01/09",to:"05/09",items:[
    ["مسحوق غسيل","6,900 د.ع"],["سائل جلي","2,500 د.ع"],["مناديل","1,500 د.ع"]
  ]}
];

let selectedCategory = "food";
const cart = new Map();

const money = n => new Intl.NumberFormat("ar-IQ").format(n) + " د.ع";

function renderCategories(){
  const el=document.getElementById("categories");
  el.innerHTML=categories.map(c=>`
    <button class="category ${c.id===selectedCategory?"active":""}" data-cat="${c.id}">
      <div class="category-icon">${c.icon}</div>
      <strong>${c.name}</strong>
    </button>`).join("");
  el.querySelectorAll(".category").forEach(btn=>{
    btn.addEventListener("click",()=>{
      selectedCategory=btn.dataset.cat;
      renderCategories();
      renderProducts();
      document.getElementById("productsTitle").textContent=categories.find(c=>c.id===selectedCategory)?.name || "المواد";
    });
  });
}

function renderOffers(){
  const el=document.getElementById("offerCards");
  el.innerHTML=offers.map(o=>`
    <article class="offer-card">
      <div class="offer-head">
        <span class="offer-badge">عرض خاص</span>
        <h3>${o.title}</h3>
        <div class="offer-date">من ${o.from} إلى ${o.to}</div>
      </div>
      <div class="offer-body">
        ${o.items.map(i=>`<div class="offer-item"><span>${i[0]}</span><span class="offer-price">${i[1]}</span></div>`).join("")}
      </div>
    </article>`).join("");
}

function renderProducts(){
  const el=document.getElementById("productsGrid");
  const list=products.filter(p=>p.cat===selectedCategory);
  el.innerHTML=list.map(p=>{
    const q=cart.get(p.id)||0;
    return `<article class="product">
      <div class="product-top">
        <div><h3>${p.name}</h3><div class="product-meta">يباع بـ ${p.unit}</div></div>
        <div class="product-icon">${p.icon}</div>
      </div>
      <div class="product-price">${money(p.price)} <small>/ ${p.unit}</small></div>
      <div class="qty">
        <button aria-label="زيادة" onclick="changeQty(${p.id},1)">+</button>
        <span>${q}</span>
        <button aria-label="نقصان" onclick="changeQty(${p.id},-1)">−</button>
      </div>
    </article>`;
  }).join("") || `<div style="grid-column:1/-1;text-align:center;padding:30px;color:#6b756f">لا توجد مواد في هذا القسم حالياً.</div>`;
}

function changeQty(id,delta){
  const q=Math.max(0,(cart.get(id)||0)+delta);
  if(q) cart.set(id,q); else cart.delete(id);
  renderProducts(); updateCart();
}

function updateCart(){
  let total=0,count=0;
  for(const [id,q] of cart){
    const p=products.find(x=>x.id===id);
    if(p){total+=p.price*q;count+=q;}
  }
  document.getElementById("cartTotal").textContent=money(total);
  document.getElementById("cartCount").textContent=count;
  document.getElementById("cartCountTop").textContent=count;
}

document.getElementById("whatsappBtn").addEventListener("click",()=>{
  if(cart.size===0){alert("السلة فارغة. أضف مادة واحدة على الأقل.");return;}
  const name=document.getElementById("customerName").value.trim();
  const phone=document.getElementById("customerPhone").value.trim();
  const address=document.getElementById("customerAddress").value.trim();
  const notes=document.getElementById("notes").value.trim();
  if(!name||!phone||!address){alert("يرجى إدخال الاسم ورقم الهاتف والعنوان.");return;}
  let lines=["طلب جديد — أمازون هايبر ماركت",""];
  for(const [id,q] of cart){const p=products.find(x=>x.id===id);lines.push(`- ${p.name}: ${q} ${p.unit}`);}
  lines.push("",`الاسم: ${name}`,`الهاتف: ${phone}`,`العنوان: ${address}`,`الملاحظات: ${notes||"لا توجد"}`,"","تنويه: المواد التي تباع بالوزن قد يختلف وزنها وسعرها النهائي قليلاً بعد التجهيز، وسيتم تأكيد السعر النهائي قبل التسليم.");
  const whatsappNumber="9647700000000";
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`,"_blank");
});

document.getElementById("tickerText").textContent="عروض خاصة • خصومات مميزة • توصيل داخل بغداد • الكمية والأسعار حسب توفر المخزون";
renderCategories(); renderOffers(); renderProducts(); updateCart();
