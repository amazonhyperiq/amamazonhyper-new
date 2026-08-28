const SUPABASE_URL = "https://vvexorzjkpwduykinwsw.supabase.co";
const SUPABASE_KEY = "sb_publishable_RoMHq19grLJWNu95uPSwug_XwiKt2bB";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const categories = [
  {id:"food",name:"مواد غذائية",icon:"🛒"},
  {id:"cleaning",name:"منظفات",icon:"🧴"},
  {id:"cosmetic",name:"كوزمتك",icon:"💄"},
  {id:"meat",name:"لحوم",icon:"🥩"},
  {id:"chicken",name:"دجاج",icon:"🍗"},
  {id:"vegetables",name:"خضار وفواكه",icon:"🥬"},
  {id:"dairy",name:"ألبان وأجبان",icon:"🥛"},
  {id:"drinks",name:"مشروبات",icon:"🥤"}
];

let products = [
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

let offers = [];
let selectedCategory = "food";
const cart = new Map();

const DEFAULT_TICKER =
  "عروض خاصة • خصومات مميزة • توصيل داخل بغداد • الكمية والأسعار حسب توفر المخزون";

const money = n =>
  new Intl.NumberFormat("ar-IQ").format(Number(n) || 0) + " د.ع";


/* =====================================================
   تحميل كل بيانات الصفحة من Supabase بطلب واحد
===================================================== */

async function loadPageData(){

  try{

    const {data,error} = await supabaseClient
      .from("products")
      .select("data")
      .eq("id",1)
      .single();

    if(error) throw error;

    const saved = data?.data || {};

    if(Array.isArray(saved.products)){

      products = saved.products
        .filter(p => p && p.active !== false)
        .map(p => ({
          id:Number(p.id),
          cat:p.cat || "food",
          name:p.name || "",
          price:Number(p.price) || 0,
          unit:p.unit || "قطعة",
          icon:p.icon || "🛒"
        }))
        .filter(p => p.id && p.name);

    }

    offers =
      Array.isArray(saved.offers)
        ? saved.offers
        : [];

    const ticker =
      typeof saved.ticker === "string" &&
      saved.ticker.trim()
        ? saved.ticker.trim()
        : DEFAULT_TICKER;

    const tickerEl =
      document.getElementById("tickerText");

    if(tickerEl){
      tickerEl.textContent = ticker;
    }

    renderCategories();
    renderOffers();
    renderProducts();
    updateCart();

    console.log("تم تحميل البيانات من Supabase بنجاح.");

  }catch(error){

    console.error("Supabase error:",error);

    /* نعرض البيانات المحلية إذا تعذر الاتصال */
    renderCategories();
    renderOffers();
    renderProducts();
    updateCart();

  }

}


/* =====================================================
   الأقسام
===================================================== */

function renderCategories(){

  const el =
    document.getElementById("categories");

  if(!el) return;

  el.innerHTML =
    categories.map(c => `
      <button
        class="category ${c.id === selectedCategory ? "active" : ""}"
        data-cat="${c.id}"
      >
        <div class="category-icon">${c.icon}</div>
        <strong>${c.name}</strong>
      </button>
    `).join("");

  el.querySelectorAll(".category").forEach(btn => {

    btn.onclick = () => {

      selectedCategory = btn.dataset.cat;

      const category =
        categories.find(c => c.id === selectedCategory);

      const title =
        document.getElementById("productsTitle");

      if(title){
        title.textContent =
          category?.name || "المواد";
      }

      renderCategories();
      renderProducts();

    };

  });

}


/* =====================================================
   العروض
===================================================== */

function parseDate(value){

  if(!value) return null;

  const d =
    new Date(`${value}T00:00:00`);

  return Number.isNaN(d.getTime())
    ? null
    : d;

}

function formatDate(value){

  if(!value) return "";

  const parts =
    String(value).split("-");

  return parts.length === 3
    ? `${parts[2]}/${parts[1]}/${parts[0]}`
    : String(value);

}

function isOfferActive(offer){

  const from = parseDate(offer.from);
  const to = parseDate(offer.to);

  if(!from || !to) return true;

  const now = new Date();

  now.setHours(12,0,0,0);

  to.setHours(23,59,59,999);

  return now >= from && now <= to;

}

function renderOffers(){

  const el =
    document.getElementById("offerCards");

  if(!el) return;

  const activeOffers =
    offers.filter(isOfferActive);

  if(!activeOffers.length){

    el.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:30px;color:#6b756f">
        لا توجد عروض خاصة حالياً.
      </div>
    `;

    return;

  }

  el.innerHTML =
    activeOffers.map(o => {

      const items =
        Array.isArray(o.items)
          ? o.items
          : [];

      return `
        <article class="offer-card">

          <div class="offer-head">

            <span class="offer-badge">
              عرض خاص
            </span>

            <h3>
              ${o.title || "عرض خاص"}
            </h3>

            <div class="offer-date">
              من ${formatDate(o.from)}
              إلى ${formatDate(o.to)}
            </div>

          </div>

          <div class="offer-body">

            ${
              items.map(item => {

                let name = "";
                let price = "";

                if(Array.isArray(item)){
                  name = item[0] || "";
                  price = item[1] || "";
                }else if(item && typeof item === "object"){
                  name = item.name || "";
                  price =
                    item.offerPrice ??
                    item.price ??
                    "";
                }

                const priceText =
                  typeof price === "number"
                    ? money(price)
                    : price;

                return `
                  <div class="offer-item">
                    <span>${name}</span>
                    <span class="offer-price">${priceText}</span>
                  </div>
                `;

              }).join("")
            }

          </div>

        </article>
      `;

    }).join("");

}


/* =====================================================
   المنتجات
===================================================== */

function renderProducts(){

  const el =
    document.getElementById("productsGrid");

  if(!el) return;

  const list =
    products.filter(
      p => p.cat === selectedCategory
    );

  if(!list.length){

    el.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:30px;color:#6b756f">
        لا توجد مواد في هذا القسم حالياً.
      </div>
    `;

    return;

  }

  el.innerHTML =
    list.map(p => {

      const q =
        cart.get(p.id) || 0;

      return `
        <article class="product">

          <div class="product-top">

            <div>
              <h3>${p.name}</h3>
              <div class="product-meta">
                يباع بـ ${p.unit}
              </div>
            </div>

            <div class="product-icon">
              ${p.icon}
            </div>

          </div>

          <div class="product-price">
            ${money(p.price)}
            <small>/ ${p.unit}</small>
          </div>

          <div class="qty">

            <button
              aria-label="زيادة"
              onclick="changeQty(${p.id},1)"
            >+</button>

            <span>${q}</span>

            <button
              aria-label="نقصان"
              onclick="changeQty(${p.id},-1)"
            >−</button>

          </div>

        </article>
      `;

    }).join("");

}


/* =====================================================
   السلة
===================================================== */

function changeQty(id,delta){

  const q =
    Math.max(
      0,
      (cart.get(id) || 0) + delta
    );

  if(q){
    cart.set(id,q);
  }else{
    cart.delete(id);
  }

  renderProducts();
  updateCart();

}

window.changeQty = changeQty;


function updateCart(){

  let total = 0;
  let count = 0;

  for(const [id,q] of cart){

    const p =
      products.find(
        x => Number(x.id) === Number(id)
      );

    if(p){

      total +=
        Number(p.price) * q;

      count += q;

    }

  }

  const totalEl =
    document.getElementById("cartTotal");

  const countEl =
    document.getElementById("cartCount");

  const topCountEl =
    document.getElementById("cartCountTop");

  if(totalEl){
    totalEl.textContent = money(total);
  }

  if(countEl){
    countEl.textContent = count;
  }

  if(topCountEl){
    topCountEl.textContent = count;
  }

}


/* =====================================================
   واتساب
===================================================== */

const whatsappBtn =
  document.getElementById("whatsappBtn");

if(whatsappBtn){

  whatsappBtn.onclick = () => {

    if(cart.size === 0){

      alert(
        "السلة فارغة. أضف مادة واحدة على الأقل."
      );

      return;

    }

    const name =
      document.getElementById("customerName")
        ?.value.trim() || "";

    const phone =
      document.getElementById("customerPhone")
        ?.value.trim() || "";

    const address =
      document.getElementById("customerAddress")
        ?.value.trim() || "";

    const notes =
      document.getElementById("notes")
        ?.value.trim() || "";

    if(!name || !phone || !address){

      alert(
        "يرجى إدخال الاسم ورقم الهاتف والعنوان."
      );

      return;

    }

    const lines = [
      "طلب جديد — أمازون هايبر ماركت",
      ""
    ];

    for(const [id,q] of cart){

      const p =
        products.find(
          x => Number(x.id) === Number(id)
        );

      if(p){

        lines.push(
          `- ${p.name}: ${q} ${p.unit}`
        );

      }

    }

    lines.push(
      "",
      `الاسم: ${name}`,
      `الهاتف: ${phone}`,
      `العنوان: ${address}`,
      `الملاحظات: ${notes || "لا توجد"}`,
      "",
      "تنويه: المواد التي تباع بالوزن قد يختلف وزنها وسعرها النهائي قليلاً بعد التجهيز، وسيتم تأكيد السعر النهائي قبل التسليم."
    );

    const whatsappNumber =
      "9647700000000";

    const url =
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;

    window.open(url,"_blank");

  };

}


/* =====================================================
   بدء التشغيل
===================================================== */

renderCategories();
renderOffers();
renderProducts();
updateCart();

loadPageData();
