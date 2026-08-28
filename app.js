const SUPABASE_URL = "https://vvexorzjkpwduykinwsw.supabase.co";
const SUPABASE_KEY = "sb_publishable_RoMHq19grLJWNu95uPSwug_XwiKt2bB";

const supabaseClient =
  supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


/* =====================================================
   الأقسام
===================================================== */

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


/* =====================================================
   المنتجات الافتراضية
===================================================== */

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

let deliveryGroups = [];

let selectedCategory = "food";

const cart = new Map();

let selectedDeliveryGroup = "";
let selectedDeliveryArea = "";
let deliveryFee = 0;

const DEFAULT_TICKER =
  "عروض خاصة • خصومات مميزة • توصيل داخل بغداد • الكمية والأسعار حسب توفر المخزون";


/* =====================================================
   العملة
===================================================== */

const money = n =>
  new Intl.NumberFormat("ar-IQ")
    .format(Number(n) || 0) + " د.ع";


/* =====================================================
   تحميل البيانات من Supabase
===================================================== */

async function loadPageData(){

  try{

    const {data,error} =
      await supabaseClient
        .from("products")
        .select("data")
        .eq("id",1)
        .single();

    if(error) throw error;

    const saved =
      data?.data || {};


    /* المنتجات */

    if(Array.isArray(saved.products)){

      products =
        saved.products
          .filter(
            p =>
              p &&
              p.active !== false
          )
          .map(p => ({

            id:Number(p.id),

            cat:p.cat || "food",

            name:p.name || "",

            price:Number(p.price) || 0,

            unit:p.unit || "قطعة",

            icon:p.icon || "🛒"

          }))
          .filter(
            p =>
              p.id &&
              p.name
          );

    }


    /* العروض */

    offers =
      Array.isArray(saved.offers)
        ? saved.offers
        : [];


    /* مناطق التوصيل */

    deliveryGroups =
      Array.isArray(saved.deliveryGroups)
        ? saved.deliveryGroups
        : [];


    /* الشريط */

    const ticker =
      typeof saved.ticker === "string" &&
      saved.ticker.trim()
        ? saved.ticker.trim()
        : DEFAULT_TICKER;


    const tickerEl =
      document.getElementById(
        "tickerText"
      );

    if(tickerEl){

      tickerEl.textContent =
        ticker;

    }


    setupDeliveryUI();

    renderDeliveryGroups();

    renderCategories();

    renderOffers();

    renderProducts();

    updateCart();


    console.log(
      "تم تحميل البيانات من Supabase بنجاح"
    );


  }catch(error){

    console.error(
      "Supabase error:",
      error
    );

    setupDeliveryUI();

    renderDeliveryGroups();

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
    document.getElementById(
      "categories"
    );

  if(!el) return;


  el.innerHTML =
    categories.map(c => `

      <button
        class="category ${
          c.id === selectedCategory
            ? "active"
            : ""
        }"
        data-cat="${c.id}"
      >

        <div class="category-icon">
          ${c.icon}
        </div>

        <strong>
          ${c.name}
        </strong>

      </button>

    `).join("");


  el.querySelectorAll(
    ".category"
  ).forEach(btn => {

    btn.onclick = () => {

      selectedCategory =
        btn.dataset.cat;


      const category =
        categories.find(
          c =>
            c.id ===
            selectedCategory
        );


      const title =
        document.getElementById(
          "productsTitle"
        );


      if(title){

        title.textContent =
          category?.name ||
          "المواد";

      }


      renderCategories();

      renderProducts();

    };

  });

}


/* =====================================================
   التاريخ
===================================================== */

function parseDate(value){

  if(!value) return null;

  const d =
    new Date(
      `${value}T00:00:00`
    );

  return Number.isNaN(
    d.getTime()
  )
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

  const from =
    parseDate(offer.from);

  const to =
    parseDate(offer.to);


  if(!from || !to){

    return true;

  }


  const now =
    new Date();


  now.setHours(
    12,
    0,
    0,
    0
  );


  to.setHours(
    23,
    59,
    59,
    999
  );


  return (
    now >= from &&
    now <= to
  );

}


/* =====================================================
   العروض
===================================================== */

function renderOffers(){

  const el =
    document.getElementById(
      "offerCards"
    );

  if(!el) return;


  const activeOffers =
    offers.filter(
      isOfferActive
    );


  if(!activeOffers.length){

    el.innerHTML = `

      <div
        style="
          grid-column:1/-1;
          text-align:center;
          padding:30px;
          color:#6b756f
        "
      >
        لا توجد عروض خاصة حالياً.
      </div>

    `;

    return;

  }


  el.innerHTML =
    activeOffers.map(
      offer => {

        const items =
          Array.isArray(
            offer.items
          )
            ? offer.items
            : [];


        return `

          <article
            class="offer-card"
          >

            <div
              class="offer-head"
            >

              <span
                class="offer-badge"
              >
                عرض خاص
              </span>


              <h3>
                ${
                  offer.title ||
                  "عرض خاص"
                }
              </h3>


              <div
                class="offer-date"
              >
                من
                ${
                  formatDate(
                    offer.from
                  )
                }
                إلى
                ${
                  formatDate(
                    offer.to
                  )
                }
              </div>

            </div>


            <div
              class="offer-body"
            >

              ${
                items.map(
                  item => {

                    let name = "";
                    let price = "";


                    if(
                      Array.isArray(
                        item
                      )
                    ){

                      name =
                        item[0] || "";

                      price =
                        item[1] || "";

                    }else if(
                      item &&
                      typeof item ===
                        "object"
                    ){

                      name =
                        item.name ||
                        "";

                      price =
                        item.offerPrice ??
                        item.price ??
                        "";

                    }


                    const priceText =
                      typeof price ===
                      "number"

                        ? money(price)

                        : price;


                    return `

                      <div
                        class="offer-item"
                      >

                        <span>
                          ${name}
                        </span>

                        <span
                          class="offer-price"
                        >
                          ${priceText}
                        </span>

                      </div>

                    `;

                  }
                ).join("")
              }

            </div>

          </article>

        `;

      }
    ).join("");

}


/* =====================================================
   المنتجات
===================================================== */

function renderProducts(){

  const el =
    document.getElementById(
      "productsGrid"
    );

  if(!el) return;


  const list =
    products.filter(
      p =>
        p.cat ===
        selectedCategory
    );


  if(!list.length){

    el.innerHTML = `

      <div
        style="
          grid-column:1/-1;
          text-align:center;
          padding:30px;
          color:#6b756f
        "
      >
        لا توجد مواد في هذا القسم حالياً.
      </div>

    `;

    return;

  }


  el.innerHTML =
    list.map(
      p => {

        const q =
          cart.get(p.id) || 0;


        return `

          <article
            class="product"
          >

            <div
              class="product-top"
            >

              <div>

                <h3>
                  ${p.name}
                </h3>

                <div
                  class="product-meta"
                >
                  يباع بـ
                  ${p.unit}
                </div>

              </div>


              <div
                class="product-icon"
              >
                ${p.icon}
              </div>

            </div>


            <div
              class="product-price"
            >

              ${money(p.price)}

              <small>
                / ${p.unit}
              </small>

            </div>


            <div
              class="qty"
            >

              <button
                aria-label="زيادة"
                onclick="
                  changeQty(
                    ${p.id},
                    1
                  )
                "
              >
                +
              </button>


              <span>
                ${q}
              </span>


              <button
                aria-label="نقصان"
                onclick="
                  changeQty(
                    ${p.id},
                    -1
                  )
                "
              >
                −
              </button>

            </div>

          </article>

        `;

      }
    ).join("");

}


/* =====================================================
   السلة
===================================================== */

function changeQty(
  id,
  delta
){

  const q =
    Math.max(
      0,
      (cart.get(id) || 0)
      + delta
    );


  if(q){

    cart.set(
      id,
      q
    );

  }else{

    cart.delete(id);

  }


  renderProducts();

  updateCart();

}


window.changeQty =
  changeQty;


/* =====================================================
   مجموع المواد
===================================================== */

function getProductsTotal(){

  let total = 0;


  for(
    const [id,q]
    of cart
  ){

    const p =
      products.find(
        x =>
          Number(x.id) ===
          Number(id)
      );


    if(p){

      total +=
        Number(p.price) *
        q;

    }

  }


  return total;

}


/* =====================================================
   تحديث السلة
===================================================== */

function updateCart(){

  const productsTotal =
    getProductsTotal();


  const finalTotal =
    productsTotal +
    Number(deliveryFee || 0);


  let count = 0;


  for(
    const [,q]
    of cart
  ){

    count += q;

  }


  const totalEl =
    document.getElementById(
      "cartTotal"
    );

  const countEl =
    document.getElementById(
      "cartCount"
    );

  const topCountEl =
    document.getElementById(
      "cartCountTop"
    );

  const deliveryEl =
    document.getElementById(
      "deliveryFee"
    );

  const grandTotalEl =
    document.getElementById(
      "grandTotal"
    );


  if(totalEl){

    totalEl.textContent =
      money(finalTotal);

  }


  if(countEl){

    countEl.textContent =
      count;

  }


  if(topCountEl){

    topCountEl.textContent =
      count;

  }


  if(deliveryEl){

    deliveryEl.textContent =
      money(deliveryFee);

  }


  if(grandTotalEl){

    grandTotalEl.textContent =
      money(finalTotal);

  }

}


/* =====================================================
   مناطق التوصيل
===================================================== */

function getDeliveryGroupName(
  group
){

  if(
    typeof group ===
    "string"
  ){

    return group.trim();

  }


  return String(
    group?.name ??
    group?.title ??
    group?.groupName ??
    ""
  ).trim();

}


function getDeliveryAreas(
  group
){

  if(
    Array.isArray(
      group?.areas
    )
  ){

    return group.areas;

  }


  if(
    Array.isArray(
      group?.regions
    )
  ){

    return group.regions;

  }


  if(
    Array.isArray(
      group?.items
    )
  ){

    return group.items;

  }


  return [];

}


function getDeliveryAreaName(
  area
){

  if(
    typeof area ===
    "string"
  ){

    return area.trim();

  }


  return String(
    area?.name ??
    area?.title ??
    area?.area ??
    area?.region ??
    ""
  ).trim();

}


function getDeliveryAreaFee(
  area
){

  if(
    typeof area ===
    "number"
  ){

    return Number(area) || 0;

  }


  return Number(
    area?.fee ??
    area?.price ??
    area?.deliveryFee ??
    area?.deliveryPrice ??
    0
  ) || 0;

}


/* =====================================================
   إنشاء قائمة المناطق عند الزبون
===================================================== */

function setupDeliveryUI(){

  const address =
    document.getElementById(
      "customerAddress"
    );


  if(
    !address ||
    document.getElementById(
      "deliverySelectorBox"
    )
  ){

    return;

  }


  const box =
    document.createElement(
      "div"
    );


  box.id =
    "deliverySelectorBox";


  box.className =
    "delivery-selector-box";


  box.innerHTML = `

    <label>

      منطقة التوصيل

      <select
        id="deliveryGroup"
      >

        <option value="">
          اختر المنطقة الرئيسية
        </option>

      </select>

    </label>


    <label>

      المنطقة

      <select
        id="deliveryArea"
        disabled
      >

        <option value="">
          اختر المنطقة
        </option>

      </select>

    </label>


    <div
      class="delivery-fee-row"
    >

      <span>
        أجور التوصيل
      </span>

      <strong
        id="deliveryFee"
      >
        0 د.ع
      </strong>

    </div>

  `;


  address.parentNode.insertBefore(
    box,
    address
  );


  const groupSelect =
    document.getElementById(
      "deliveryGroup"
    );

  const areaSelect =
    document.getElementById(
      "deliveryArea"
    );


  groupSelect.onchange =
    function(){

      selectedDeliveryGroup =
        this.value;


      selectedDeliveryArea =
        "";

      deliveryFee =
        0;


      renderDeliveryAreas();

      updateCart();

    };


 areaSelect.onchange =
  function(){

    const group =
      deliveryGroups.find(
        g =>
          getDeliveryGroupName(g) ===
          selectedDeliveryGroup
      );

    const areas =
      getDeliveryAreas(group);

    const index =
      Number(this.value);

    if(
      !group ||
      !Array.isArray(areas) ||
      !areas[index]
    ){

      selectedDeliveryArea = "";
      deliveryFee = 0;

      updateCart();

      return;
    }

    const area =
      areas[index];

    selectedDeliveryArea =
      getDeliveryAreaName(area);

    deliveryFee =
      getDeliveryAreaFee(area);

    updateCart();

  };

}


/* =====================================================
   عرض المناطق الرئيسية
===================================================== */

function renderDeliveryGroups(){

  const select =
    document.getElementById(
      "deliveryGroup"
    );


  if(!select) return;


  select.innerHTML = `

    <option value="">
      اختر المنطقة الرئيسية
    </option>

  `;


  deliveryGroups.forEach(
    group => {

      const name =
        getDeliveryGroupName(
          group
        );


      if(!name) return;


      const option =
        document.createElement(
          "option"
        );


      option.value =
        name;


      option.textContent =
        name;


      select.appendChild(
        option
      );

    }
  );


  selectedDeliveryGroup =
    "";

  selectedDeliveryArea =
    "";

  deliveryFee =
    0;


  renderDeliveryAreas();

  updateCart();

}


/* =====================================================
   عرض المناطق الفرعية
===================================================== */

function renderDeliveryAreas(){

  const select =
    document.getElementById(
      "deliveryArea"
    );


  if(!select) return;


  select.innerHTML = `

    <option value="">
      اختر المنطقة
    </option>

  `;


  const group =
    deliveryGroups.find(
      g =>
        getDeliveryGroupName(g)
        ===
        selectedDeliveryGroup
    );


  const areas =
    getDeliveryAreas(
      group
    );


  select.disabled =
    !selectedDeliveryGroup ||
    !areas.length;


  areas.forEach(
    area => {

      const name =
        getDeliveryAreaName(
          area
        );


      if(!name) return;


      const fee =
        getDeliveryAreaFee(
          area
        );


      const option =
        document.createElement(
          "option"
        );


      option.value =
        name;


      option.textContent =
        `${name} — ${money(fee)}`;


      select.appendChild(
        option
      );

    }
  );

}


/* =====================================================
   واتساب
===================================================== */

const whatsappBtn =
  document.getElementById(
    "whatsappBtn"
  );


if(whatsappBtn){

  whatsappBtn.onclick =
    function(){

      if(cart.size === 0){

        alert(
          "السلة فارغة. أضف مادة واحدة على الأقل."
        );

        return;

      }


      const name =
        document.getElementById(
          "customerName"
        )?.value.trim() || "";


      const phone =
        document.getElementById(
          "customerPhone"
        )?.value.trim() || "";


      const address =
        document.getElementById(
          "customerAddress"
        )?.value.trim() || "";


      const notes =
        document.getElementById(
          "notes"
        )?.value.trim() || "";


      if(
        !name ||
        !phone ||
        !address
      ){

        alert(
          "يرجى إدخال الاسم ورقم الهاتف والعنوان."
        );

        return;

      }


      if(
        deliveryGroups.length &&
        (
          !selectedDeliveryGroup ||
          !selectedDeliveryArea
        )
      ){

        alert(
          "يرجى اختيار منطقة التوصيل."
        );

        return;

      }


      const productsTotal =
        getProductsTotal();


      const finalTotal =
        productsTotal +
        Number(
          deliveryFee || 0
        );


      const lines = [

        "طلب جديد — أمازون هايبر ماركت",

        ""

      ];


      for(
        const [id,q]
        of cart
      ){

        const p =
          products.find(
            x =>
              Number(x.id) ===
              Number(id)
          );


        if(p){

          lines.push(
            `- ${p.name}: ${q} ${p.unit}`
          );

        }

      }


      lines.push(

        "",

        `قيمة المواد: ${money(productsTotal)}`,

        `المنطقة الرئيسية: ${
          selectedDeliveryGroup ||
          "غير محددة"
        }`,

        `منطقة التوصيل: ${
          selectedDeliveryArea ||
          "غير محددة"
        }`,

        `أجور التوصيل: ${
          money(deliveryFee)
        }`,

        `المجموع النهائي: ${
          money(finalTotal)
        }`,

        "",

        `الاسم: ${name}`,

        `الهاتف: ${phone}`,

        `العنوان: ${address}`,

        `الملاحظات: ${
          notes || "لا توجد"
        }`,

        "",

        "تنويه: المواد التي تباع بالوزن قد يختلف وزنها وسعرها النهائي قليلاً بعد التجهيز، وسيتم تأكيد الوزن والسعر النهائي قبل التسليم."

      );


      const whatsappNumber =
        "9647842000516";


      const url =
        `https://wa.me/${whatsappNumber}?text=${
          encodeURIComponent(
            lines.join("\n")
          )
        }`;


      window.open(
        url,
        "_blank"
      );

    };

}


/* =====================================================
   تنسيق مناطق التوصيل
===================================================== */

(function(){

  if(
    document.getElementById(
      "deliveryInlineStyles"
    )
  ){

    return;

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "deliveryInlineStyles";


  style.textContent = `

    .delivery-selector-box{

      display:grid;

      grid-template-columns:
        1fr 1fr;

      gap:12px;

      margin-bottom:12px;

      padding:13px;

      background:#f3f8f4;

      border:1px solid #dbe8df;

      border-radius:14px;

      box-sizing:border-box;

    }


    .delivery-selector-box label{

      display:block;

      font-weight:800;

      font-size:13px;

    }


    .delivery-selector-box select{

      width:100%;

      margin-top:6px;

      padding:11px;

      border:1px solid #d4dfd7;

      border-radius:10px;

      background:#fff;

      font:inherit;

      box-sizing:border-box;

    }


    .delivery-fee-row{

      grid-column:1/-1;

      display:flex;

      justify-content:space-between;

      align-items:center;

      padding:10px 12px;

      background:#fff;

      border-radius:10px;

      color:#087438;

    }


    .delivery-fee-row strong{

      font-size:17px;

    }


    @media(max-width:620px){

      .delivery-selector-box{

        grid-template-columns:1fr;

      }

      .delivery-fee-row{

        grid-column:auto;

      }

    }

  `;


  document.head.appendChild(
    style
  );

})();


/* =====================================================
   بدء التشغيل
===================================================== */

setupDeliveryUI();

renderCategories();

renderOffers();

renderProducts();

updateCart();

loadPageData();
