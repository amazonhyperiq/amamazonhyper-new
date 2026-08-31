const SUPABASE_URL = "https://vvexorzjkpwduykinwsw.supabase.co";
const SUPABASE_KEY = "sb_publishable_RoMHq19grLJWNu95uPSwug_XwiKt2bB";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


/* =====================================================
   الأقسام
===================================================== */

let categories = [
  {id:"meat",name:"اللحوم الطازجة",icon:"🥩"},
  {id:"chicken",name:"الدجاج فريش",icon:"🍗"},
  {id:"vegetables",name:"الفواكه والخضار",icon:"🥬"},
  {id:"canned-veg",name:"الخضراوات المعلبة (فريش)",icon:"🥫"},
  {id:"food",name:"الرز والزيت والمعجون (المواد الغذائية)",icon:"🛒"},
  {id:"deli-pickles",name:"الأجبان والألبان والمخللات (الدلي)",icon:"🧀"},
  {id:"legumes-packaging",name:"البقوليات ومواد التعبئة (الوزن)",icon:"⚖️"},
  {id:"drinks",name:"العصائر والمشروبات",icon:"🥤"},
  {id:"dairy",name:"الأجبان والألبان",icon:"🥛"},
  {id:"cleaning",name:"مواد التنظيف المنزلية",icon:"🧴"},
  {id:"laundry",name:"مساحيق غسيل الملابس",icon:"🧺"},
  {id:"cosmetic",name:"مواد العناية بالشعر والبشرة والجسم",icon:"💄"},
  {id:"tissues-paper",name:"الكلينس والورقيات",icon:"🧻"},
  {id:"cleaning-tools",name:"أدوات التنظيف المنزلية",icon:"🧽"}
];


/* =====================================================
   المنتجات الافتراضية
===================================================== */

let products = [
  {
    id:1,
    cat:"food",
    name:"رز عنبر",
    price:3000,
    unit:"قطعة",
    icon:"🍚"
  },

  {
    id:2,
    cat:"food",
    name:"زيت طبخ",
    price:4500,
    unit:"قطعة",
    icon:"🫗"
  },

  {
    id:3,
    cat:"food",
    name:"سكر",
    price:1500,
    unit:"قطعة",
    icon:"🍬"
  },

  {
    id:4,
    cat:"food",
    name:"معجون طماطم",
    price:1000,
    unit:"قطعة",
    icon:"🥫"
  },

  {
    id:5,
    cat:"cleaning",
    name:"مسحوق غسيل",
    price:7500,
    unit:"قطعة",
    icon:"🧺"
  },

  {
    id:6,
    cat:"cleaning",
    name:"سائل جلي",
    price:3000,
    unit:"قطعة",
    icon:"🧽"
  },

  {
    id:7,
    cat:"cosmetic",
    name:"شامبو",
    price:6500,
    unit:"قطعة",
    icon:"🧴"
  },

  {
    id:8,
    cat:"cosmetic",
    name:"كريم مرطب",
    price:8500,
    unit:"قطعة",
    icon:"🧴"
  },

  {
    id:9,
    cat:"meat",
    name:"لحم غنم بالعظم",
    price:22000,
    unit:"كغم",
    icon:"🥩"
  },

  {
    id:10,
    cat:"meat",
    name:"لحم غنم شرح",
    price:27000,
    unit:"كغم",
    icon:"🥩"
  },

  {
    id:11,
    cat:"chicken",
    name:"دجاج ذبح عراقي",
    price:5750,
    unit:"قطعة",
    icon:"🍗"
  },

  {
    id:12,
    cat:"vegetables",
    name:"طماطم",
    price:2000,
    unit:"كغم",
    icon:"🍅"
  }
];


/* =====================================================
   تحميل الأقسام والمنتجات والعروض ومناطق التوصيل
===================================================== */

async function loadProductsFromSupabase(){

  try{

    const { data, error } =
      await supabaseClient
        .from("products")
        .select("data")
        .eq("id",1)
        .single();


    if(error){

      console.error(
        "Supabase products error:",
        error
      );

      return;
    }


    if(!data || !data.data){

      console.error(
        "لم يتم العثور على بيانات المتجر"
      );

      return;
    }


    const saved =
      data.data;

    /* ==============================================
       تحميل محتوى الصفحة الرئيسية
    ============================================== */
    if(saved.siteContent){
      siteContent = {
        ...siteContent,
        ...saved.siteContent
      };
    }



    /* ==============================================
       تحميل العروض
    ============================================== */

    if(
      Array.isArray(saved.offers)
    ){

      offers =
        saved.offers;

    }else{

      offers = [];

    }


    /* ==============================================
       تحميل مناطق التوصيل
    ============================================== */

    if(
      Array.isArray(saved.deliveryGroups)
    ){

      deliveryGroups =
        saved.deliveryGroups;

    }else{

      deliveryGroups = [];

    }


      /* ==============================================
       تحميل الأقسام التي أنشأها المدير
    ============================================== */

    if(
      Array.isArray(saved.categories) &&
      saved.categories.length
    ){

      categories =
        saved.categories.map(c => ({

          id:
            String(c.id),

          name:
            String(
              c.name || "قسم"
            ),

          icon:
            String(
              c.icon || "🛒"
            ),

          unit:
            c.unit === "وزن (كغ)"
              ? "وزن (كغ)"
              : "قطعة",

          step:
            Number(c.step) > 0
              ? Number(c.step)
              : 1

        }));

    }


    /* ==============================================
       تحميل المنتجات
    ============================================== */

    const dbProducts = [];


    if(
      Array.isArray(saved.products)
    ){

      saved.products.forEach(
        product => {

          if(
            product.active === false
          ){

            return;

          }


          dbProducts.push({

            id:product.id,

            cat:product.cat,

            name:product.name,

            price:
              Number(product.price) || 0,

            unit:
              product.unit || "قطعة",

            step:
              Number(product.step) > 0
                ? Number(product.step)
                : 1,

            icon:
              product.icon || "🛒"

          });

        }
      );

    }


    /* ==============================================
       دعم البيانات القديمة
    ============================================== */

    else if(
      Array.isArray(saved.store)
    ){

      saved.store.forEach(
        category => {

          if(!category.products){

            return;

          }


          category.products.forEach(
            product => {

              if(
                product.active === false
              ){

                return;

              }


              const rawCat =
                category.category ||
                "food";


              const matched =
                categories.find(
                  c =>
                    c.id === rawCat ||
                    c.name === rawCat
                );


              dbProducts.push({

                id:
                  dbProducts.length + 1,

                cat:
                  matched
                    ? matched.id
                    : rawCat,

                name:
                  product.name,

                price:
                  Number(product.price) || 0,

                unit:
                  product.unit || "قطعة",

                step:
                  Number(product.step) > 0
                    ? Number(product.step)
                    : 1,

                icon:
                  product.icon || "🛒"

              });

            }
          );

        }
      );

    }


    products =
      dbProducts;


    /* ==============================================
       التأكد من وجود القسم المحدد
    ============================================== */

    if(
      !categories.some(
        c =>
          c.id === selectedCategory
      )
    ){

      selectedCategory =
        categories[0]?.id || "";

    }


    renderCategories();

    renderOffers();

    renderDeliveryGroups();

    renderProducts();

    updateCart();


    console.log(
      "تم تحميل الأقسام والمنتجات والعروض ومناطق التوصيل:",
      categories.length,
      products.length,
      offers.length,
      deliveryGroups.length
    );


  }catch(err){

    console.error(
      "Supabase connection error:",
      err
    );

  }

}


/* =====================================================
   العروض
===================================================== */

let offers = [];


/* =====================================================
   مناطق التوصيل
===================================================== */

let deliveryGroups = [];


/* =====================================================
   السلة والقسم المحدد
===================================================== */

let selectedCategory = "food";

/* البحث عن المواد للزبون */
let productSearchQuery = "";

const cart = new Map();


/* =====================================================
   تنسيق العملة
===================================================== */

const money = n =>
  new Intl.NumberFormat("ar-IQ")
    .format(n) +
  " د.ع";


/* =====================================================
   عرض الأقسام
===================================================== */

function renderCategories(){

  const el =
    document.getElementById(
      "categories"
    );


  if(!el){

    return;

  }


  el.innerHTML =
    categories
      .map(c => `

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

      `)
      .join("");


  el
    .querySelectorAll(
      ".category"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          selectedCategory =
            btn.dataset.cat;

          productSearchQuery = "";

          renderCategories();

          renderProducts();

          updateProductSearchUI();


          const title =
            document.getElementById(
              "productsTitle"
            );


          if(title){

            title.textContent =
              categories.find(
                c =>
                  c.id ===
                  selectedCategory
              )?.name ||
              "المواد";

          }

        }
      );

    });

}


/* =====================================================
   عرض العروض
===================================================== */

function renderOffers(){

  const el =
    document.getElementById(
      "offerCards"
    );

  if(!el){
    return;
  }

  if(!Array.isArray(offers)){
    offers = [];
  }

  if(offers.length === 0){

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
    offers
      .map(o => `

        <article class="offer-card">

          <div class="offer-head">

            <span class="offer-badge">
              عرض خاص
            </span>

            <h3>
              ${o.title || "عرض خاص"}
            </h3>

            <div class="offer-date">

              ${
                o.from
                  ? `من ${formatOfferDate(o.from)}`
                  : ""
              }

              ${
                o.to
                  ? ` إلى ${formatOfferDate(o.to)}`
                  : ""
              }

            </div>

          </div>

          <div class="offer-body">

            ${
              Array.isArray(o.items)

                ?

                o.items
                  .map(i => {

                    let itemName = "";
                    let oldPrice = 0;
                    let newPrice = 0;

                    /* =====================================
                       صيغة الكائن الجديدة
                    ===================================== */

                    if(
                      i &&
                      typeof i === "object" &&
                      !Array.isArray(i)
                    ){

                      itemName =
                        i.name ||
                        i.itemName ||
                        "";

                      oldPrice =
                        Number(
                          i.originalPrice ??
                          i.oldPrice ??
                          i.price ??
                          0
                        ) || 0;

                      newPrice =
                        Number(
                          i.offerPrice ??
                          i.newPrice ??
                          i.discountPrice ??
                          0
                        ) || 0;

                    }

                    /* =====================================
                       دعم الصيغة القديمة
                    ===================================== */

                    else if(
                      Array.isArray(i)
                    ){

                      itemName =
                        i[0] || "";

                      oldPrice =
                        Number(
                          i[1]
                        ) || 0;

                      newPrice =
                        Number(
                          i[2]
                        ) || 0;

                    }


                    return `

                      <div class="offer-item">

                        <span>
                          ${itemName}
                        </span>

                        <span class="offer-price">

                          ${
                            oldPrice > 0 &&
                            oldPrice !== newPrice
                              ? `
                                <del>
                                  ${money(oldPrice)}
                                </del>
                              `
                              : ""
                          }

                          ${
                            newPrice > 0
                              ? `
                                <strong>
                                  ${money(newPrice)}
                                </strong>
                              `
                              : ""
                          }

                        </span>

                      </div>

                    `;

                  })
                  .join("")

                : ""

            }

          </div>

        </article>

      `)
      .join("");

}
/* =====================================================
   تنسيق تاريخ العرض
===================================================== */

function formatOfferDate(
  date
){

  if(!date){

    return "";

  }


  const parts =
    String(date).split("-");


  if(parts.length === 3){

    return `${parts[2]}/${parts[1]}`;

  }


  return date;

}


/* =====================================================
   عرض مناطق التوصيل
===================================================== */

function renderDeliveryGroups(){

  const groupSelect =
    document.getElementById(
      "deliveryGroup"
    );


  const areaSelect =
    document.getElementById(
      "deliveryArea"
    );


  if(
    !groupSelect ||
    !areaSelect
  ){

    return;

  }


  groupSelect.innerHTML =
    `
      <option value="">
        اختر المنطقة الرئيسية
      </option>
    `;


  areaSelect.innerHTML =
    `
      <option value="">
        اختر المنطقة
      </option>
    `;


  areaSelect.disabled =
    true;


  if(
    !Array.isArray(
      deliveryGroups
    )
  ){

    deliveryGroups = [];

  }


  deliveryGroups.forEach(
    (
      group,
      index
    ) => {

      if(
        !group ||
        !group.name
      ){

        return;

      }


      const option =
        document.createElement(
          "option"
        );


      option.value =
        String(index);


      option.textContent =
        group.name;


      groupSelect.appendChild(
        option
      );

    }
  );


  groupSelect.onchange =
  function(){

    const index =
      Number(
        this.value
      );


    areaSelect.innerHTML =
      `
        <option value="">
          اختر المنطقة
        </option>
      `;


    areaSelect.disabled =
      true;


    hideDeliverySummary();


    if(
      Number.isNaN(index) ||
      !deliveryGroups[index]
    ){

      updateCart();
      return;

    }


    const group =
      deliveryGroups[index];


    if(
      !Array.isArray(
        group.areas
      ) ||
      group.areas.length === 0
    ){

      return;

    }


    group.areas.forEach(
      (
        area,
        areaIndex
      ) => {

        if(
          !area ||
          !area.name
        ){

          return;

        }


        const option =
          document.createElement(
            "option"
          );


        option.value =
          String(areaIndex);


        option.textContent =
          `${area.name} — ${money(
            Number(area.fee) || 0
          )}`;


        areaSelect.appendChild(
          option
        );

      }
    );


    areaSelect.disabled =
      false;

    updateCart();

  };


  areaSelect.onchange =
  function(){

    const groupIndex =
      Number(
        groupSelect.value
      );


    const areaIndex =
      Number(
        this.value
      );


    if(
      Number.isNaN(
        groupIndex
      ) ||
      Number.isNaN(
        areaIndex
      ) ||
      !deliveryGroups[
        groupIndex
      ] ||
      !deliveryGroups[
        groupIndex
      ].areas ||
      !deliveryGroups[
        groupIndex
      ].areas[
        areaIndex
      ]
    ){

      hideDeliverySummary();

      return;

    }


    const group =
      deliveryGroups[
        groupIndex
      ];


    const area =
      group.areas[
        areaIndex
      ];


    const fee =
      Number(
        area.fee
      ) || 0;


    showDeliverySummary(
      group.name,
      area.name,
      fee
    );

    // تحديث إجمالي السلة فور تغيير منطقة التوصيل.
    updateCart();

  };

}


/* =====================================================
   إظهار أجور التوصيل
===================================================== */

function showDeliverySummary(
  groupName,
  areaName,
  fee
){

  const summary =
    document.getElementById(
      "deliverySummary"
    );


  const feeElement =
    document.getElementById(
      "deliveryFee"
    );


  const areaText =
    document.getElementById(
      "deliveryAreaText"
    );


  if(!summary){

    return;

  }


  if(feeElement){

    feeElement.textContent =
      money(fee);

  }


  if(areaText){

    areaText.textContent =
      `${groupName} — ${areaName}`;

  }


  summary.style.display =
    "flex";

}


/* =====================================================
   إخفاء أجور التوصيل
===================================================== */

function hideDeliverySummary(){

  const summary =
    document.getElementById(
      "deliverySummary"
    );


  if(summary){

    summary.style.display =
      "none";

  }

}


/* =====================================================
   عرض المنتجات
===================================================== */

function renderProducts(){

  const el =
    document.getElementById(
      "productsGrid"
    );


  if(!el){

    return;

  }


  const query =
    String(productSearchQuery || "")
      .trim()
      .toLowerCase();

  const list =
    query
      ? products.filter(p =>
          String(p.name || "")
            .toLowerCase()
            .includes(query)
        )
      : products.filter(
          p =>
            p.cat ===
            selectedCategory
        );


  el.innerHTML =
    list
      .map(p => {

        const q =
          cart.get(p.id) || 0;


        return `

          <article class="product">

            <div class="product-top">

              <div>

                <h3>
                  ${p.name}
                </h3>

                <div class="product-meta">

                  يباع بـ
                  ${p.unit}

                </div>

              </div>


              <div class="product-icon">

                ${p.icon}

              </div>

            </div>


            <div class="product-price">

              ${money(p.price)}

              <small>
                / ${p.unit}
              </small>

            </div>


            <div class="qty">

              <button
                aria-label="زيادة"
                onclick="changeQty(${p.id},1)"
              >
                +
              </button>


              <span>
                ${q}
              </span>


              <button
                aria-label="نقصان"
                onclick="changeQty(${p.id},-1)"
              >
                −
              </button>

            </div>

          </article>

        `;

      })
      .join("")


    ||

    `

      <div
        style="
          grid-column:1/-1;
          text-align:center;
          padding:30px;
          color:#6b756f
        "
      >

        ${
          productSearchQuery
            ? "لا توجد مواد مطابقة للبحث حالياً."
            : "لا توجد مواد في هذا القسم حالياً."
        }

      </div>

    `;

}


/* =====================================================
   تغيير الكمية
===================================================== */

function changeQty(
  id,
  delta
){

  const product =
    products.find(
      p => p.id === id
    );

  if(!product){
    return;
  }


 const unit =
  String(
    product.unit || ""
  )
    .trim()
    .toLowerCase();


const isWeight =
  unit.includes("كغم") ||
  unit.includes("كغ") ||
  unit.includes("كيلو") ||
  unit.includes("kg");


const category =
  categories.find(
    c => c.id === product.cat
  );


const step =
  isWeight
    ? (
        Number(product.step) > 0
          ? Number(product.step)
          : (
              Number(category?.step) > 0
                ? Number(category.step)
                : 1
            )
      )
    : 1;


const q =
  Math.max(
    0,
    Number(
      (
        (cart.get(id) || 0) +
        (delta * step)
      ).toFixed(2)
    )
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
/* =====================================================
   تحديث السلة
===================================================== */

function getCurrentDeliveryInfo(){

  let deliveryGroupName = "";
  let deliveryAreaName = "";
  let deliveryFee = 0;

  const groupSelect =
    document.getElementById("deliveryGroup");

  const areaSelect =
    document.getElementById("deliveryArea");

  if(
    groupSelect &&
    groupSelect.value !== ""
  ){
    const groupIndex = Number(groupSelect.value);
    const group = deliveryGroups[groupIndex];

    if(group){
      deliveryGroupName = group.name || "";

      if(
        areaSelect &&
        areaSelect.value !== ""
      ){
        const areaIndex = Number(areaSelect.value);
        const area = group.areas?.[areaIndex];

        if(area){
          deliveryAreaName = area.name || "";
          deliveryFee = Number(area.fee) || 0;
        }
      }
    }
  }

  // بيانات المنطقة المحفوظة للزبون هي المرجع الاحتياطي.
  if(
    currentCustomer &&
    (!deliveryGroupName || !deliveryAreaName || deliveryFee <= 0)
  ){
    const savedGroup = String(
      currentCustomer.city ||
      currentCustomer.delivery_group ||
      ""
    ).trim();

    const savedArea = String(
      currentCustomer.region ||
      currentCustomer.delivery_area ||
      ""
    ).trim();

    const group = deliveryGroups.find(
      item => String(item?.name || "").trim() === savedGroup
    );

    const area = group && Array.isArray(group.areas)
      ? group.areas.find(
          item => String(item?.name || "").trim() === savedArea
        )
      : null;

    if(group && area){
      deliveryGroupName = group.name || "";
      deliveryAreaName = area.name || "";
      deliveryFee = Number(area.fee) || 0;
    }
  }

  return {
    deliveryGroupName,
    deliveryAreaName,
    deliveryFee
  };
}

function updateCart(){

  let productsTotal = 0;
  let count = 0;

  for(const [id,q] of cart){
    const p = products.find(x => x.id === id);

    if(p){
      productsTotal +=
        Number(p.price || 0) * Number(q || 0);
      count += Number(q || 0);
    }
  }

  let {
    deliveryFee
  } = getCurrentDeliveryInfo();

  const total = productsTotal + deliveryFee;

  const cartTotal =
    document.getElementById("cartTotal");

  if(cartTotal){
    cartTotal.textContent = money(total);
  }

  const cartDeliveryFee =
    document.getElementById("cartDeliveryFee");

  if(cartDeliveryFee){
    cartDeliveryFee.textContent = money(deliveryFee);
  }

  const cartCount =
    document.getElementById("cartCount");

  if(cartCount){
    cartCount.textContent = count;
  }

  const cartCountTop =
    document.getElementById("cartCountTop");

  if(cartCountTop){
    cartCountTop.textContent = count;
  }

}



/* =====================================================
   حساب الزبون
===================================================== */

let currentCustomer = null;
const CUSTOMER_STORAGE_KEY = "amazon_hyper_customer_id";


function normalizePhone(value){
  let phone = String(value || "").trim();
  phone = phone.replace(/[\s\-()]/g, "");

  if(phone.startsWith("+964")){
    phone = "0" + phone.slice(4);
  }else if(phone.startsWith("964")){
    phone = "0" + phone.slice(3);
  }

  return phone;
}

function isValidCustomerName(name){
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return words.length >= 2 && words.length <= 3;
}

function fillCustomerOrderFields(customer){
  if(!customer) return;

  const name = document.getElementById("customerName");
  const phone = document.getElementById("customerPhone");
  const address = document.getElementById("customerAddress");

  if(name) name.value = customer.name || "";
  if(phone) phone.value = customer.phone || "";
  if(address) address.value = customer.address || "";

  const groupSelect = document.getElementById("deliveryGroup");
  const areaSelect = document.getElementById("deliveryArea");

  if(!groupSelect || !areaSelect) return;

  const savedGroup = String(
    customer.city || customer.delivery_group || ""
  ).trim();

  const savedArea = String(
    customer.region || customer.area || customer.delivery_area || ""
  ).trim();

  const groupIndex = deliveryGroups.findIndex(
    group => String(group?.name || "").trim() === savedGroup
  );

  if(groupIndex < 0){
    updateCart();
    return;
  }

  // اختيار المنطقة الرئيسية تلقائياً من بيانات حساب الزبون.
  groupSelect.value = String(groupIndex);
  groupSelect.dispatchEvent(new Event("change"));

  if(savedArea){
    const group = deliveryGroups[groupIndex];
    const areaIndex = Array.isArray(group?.areas)
      ? group.areas.findIndex(
          area => String(area?.name || "").trim() === savedArea
        )
      : -1;

    if(areaIndex >= 0){
      // اختيار المنطقة الفرعية تلقائياً.
      areaSelect.value = String(areaIndex);
      areaSelect.dispatchEvent(new Event("change"));
    }
  }

  // تحديث السلة بعد اختيار المنطقة حتى تدخل أجرة التوصيل بالإجمالي.
  updateCart();
}

function updateCustomerAccountUI(){
  const btn = document.getElementById("customerAccountBtn");
  const display = document.getElementById("customerNameDisplay");
  const logout = document.getElementById("customerLogoutBtn");

  if(!btn) return;

  if(currentCustomer){
    btn.textContent = "👤 حسابي";

    if(display){
      display.textContent = currentCustomer.name || "الزبون";
      display.style.display = "inline";
    }

    if(logout){
      logout.style.display = "block";
    }
  }else{
    btn.textContent = "👤 تسجيل / دخول";

    if(display){
      display.textContent = "";
      display.style.display = "none";
    }

    if(logout){
      logout.style.display = "none";
    }
  }
}

function setCustomerStatus(message, isError = false){
  const status = document.getElementById("customerStatus");
  if(!status) return;

  status.textContent = message || "";
  status.style.display = message ? "block" : "none";
  status.style.background = isError ? "#fff1f1" : "#f1f5f3";
  status.style.color = isError ? "#b42318" : "#333";
}

function openCustomerModal(){
  const modal = document.getElementById("customerModal");
  if(!modal) return;

  const name = document.getElementById("registerName");
  const phone = document.getElementById("registerPhone");
  const city = document.getElementById("registerCity");
  const region = document.getElementById("registerRegion");
  const address = document.getElementById("registerAddress");

  if(currentCustomer){
    if(name) name.value = currentCustomer.name || "";
    if(phone) phone.value = currentCustomer.phone || "";
    if(city) city.value = currentCustomer.city || "بغداد";
    if(region) region.value = currentCustomer.region || "";
    if(address) address.value = currentCustomer.address || "";

    setCustomerStatus("بيانات حسابك محفوظة. يمكنك تعديلها ثم الضغط على حفظ بياناتي.");
  }else{
    setCustomerStatus("");
  }

  modal.classList.add("show");
}

function closeCustomerModal(){
  const modal = document.getElementById("customerModal");
  if(modal) modal.classList.remove("show");
}
async function saveCustomer(){

  const saveBtn =
    document.getElementById(
      "customerSaveBtn"
    );

  const name =
    document
      .getElementById("registerName")
      ?.value
      .trim();

  const phone =
    normalizePhone(
      document.getElementById(
        "registerPhone"
      )?.value
    );

  const city =
    document
      .getElementById("registerCity")
      ?.value
      .trim() || "بغداد";

  const area =
    document
      .getElementById("registerRegion")
      ?.value
      .trim();

  const address =
    document
      .getElementById("registerAddress")
      ?.value
      .trim();


  if(!isValidCustomerName(name)){

    setCustomerStatus(
      "اكتب الاسم الثنائي أو الثلاثي فقط.",
      true
    );

    return;
  }


  if(!/^07\d{9}$/.test(phone)){

    setCustomerStatus(
      "رقم الهاتف يجب أن يكون 11 رقمًا ويبدأ بـ 07.",
      true
    );

    return;
  }


  if(!city || !area || !address){

    setCustomerStatus(
      "يرجى إكمال المدينة والمنطقة والعنوان.",
      true
    );

    return;
  }


  if(saveBtn){

    saveBtn.disabled = true;

    saveBtn.textContent =
      "جاري الحفظ...";

  }


  try{

    const {
      data: existing,
      error: findError
    } =
      await supabaseClient
        .from("customers")
        .select(
          "id,name,phone,delivery_group,delivery_area,address,created_at"
        )
        .eq(
          "phone",
          phone
        )
        .maybeSingle();


    if(findError){

      console.error(
        "Customer lookup error:",
        findError
      );

      setCustomerStatus(
        "تعذر الاتصال بقاعدة بيانات الزبائن. حاول مرة أخرى.",
        true
      );

      return;
    }


    let savedCustomer = null;


    if(existing){

      const {
        data: updated,
        error: updateError
      } =
        await supabaseClient
          .from("customers")
          .update({

            name:
              name,

            phone:
              phone,

            delivery_group:
              city,

            delivery_area:
              area,

            address:
              address

          })
          .eq(
            "id",
            existing.id
          )
          .select(
            "id,name,phone,delivery_group,delivery_area,address,created_at"
          )
          .single();


      if(updateError){

        console.error(
          "Customer update error:",
          updateError
        );

        setCustomerStatus(
          "تعذر تحديث بيانات الحساب.",
          true
        );

        return;
      }


      savedCustomer =
        updated;

    }else{

      const {
        data: created,
        error: insertError
      } =
        await supabaseClient
          .from("customers")
          .insert({

            name:
              name,

            phone:
              phone,

            delivery_group:
              city,

            delivery_area:
              area,

            address:
              address

          })
          .select(
            "id,name,phone,delivery_group,delivery_area,address,created_at"
          )
          .single();


      if(insertError){

        console.error(
          "Customer insert error:",
          insertError
        );

        setCustomerStatus(
          "تعذر إنشاء حساب الزبون. حاول مرة أخرى.",
          true
        );

        return;
      }


      savedCustomer =
        created;

    }


    currentCustomer = {

      id:
        savedCustomer.id,

      name:
        savedCustomer.name || "",

      phone:
        savedCustomer.phone || "",

      city:
        savedCustomer.delivery_group || city,

      region:
        savedCustomer.delivery_area || area,

      address:
        savedCustomer.address || address,

      created_at:
        savedCustomer.created_at

    };


    localStorage.setItem(
      CUSTOMER_STORAGE_KEY,
      currentCustomer.id
    );


    fillCustomerOrderFields(
      currentCustomer
    );


    updateCustomerAccountUI();


    setCustomerStatus(
      "تم حفظ بياناتك بنجاح. يمكنك الآن إرسال الطلب."
    );


    setTimeout(
      () => {
        closeCustomerModal();
      },
      700
    );


  }catch(error){

    console.error(
      "Customer save error:",
      error
    );

    setCustomerStatus(
      "حدث خطأ غير متوقع. حاول مرة أخرى.",
      true
    );

  }finally{

    if(saveBtn){

      saveBtn.disabled =
        false;

      saveBtn.textContent =
        "حفظ بياناتي";

    }

  }

}
async function loadSavedCustomer(){

  const customerId =
    localStorage.getItem(
      CUSTOMER_STORAGE_KEY
    );

  if(!customerId){
    return;
  }

  try{

    const {
      data,
      error
    } =
      await supabaseClient
        .from("customers")
        .select(
          "id,name,phone,delivery_group,delivery_area,address,created_at"
        )
        .eq(
          "id",
          customerId
        )
        .maybeSingle();

    if(error){

      console.error(
        "Saved customer error:",
        error
      );

      return;
    }

    if(!data){

      localStorage.removeItem(
        CUSTOMER_STORAGE_KEY
      );

      currentCustomer = null;

      updateCustomerAccountUI();

      return;
    }

    currentCustomer = {

      id:
        data.id,

      name:
        data.name || "",

      phone:
        data.phone || "",

      city:
        data.delivery_group || "بغداد",

      region:
        data.delivery_area || "",

      address:
        data.address || "",

      created_at:
        data.created_at

    };

    updateCustomerAccountUI();

    fillCustomerOrderFields(
      currentCustomer
    );

  }catch(error){

    console.error(
      "Load saved customer error:",
      error
    );

  }

}

function logoutCustomer(){

  localStorage.removeItem(
    CUSTOMER_STORAGE_KEY
  );

  currentCustomer = null;

  updateCustomerAccountUI();

  closeCustomerModal();

  alert(
    "تم تسجيل الخروج من حساب الزبون."
  );

}
function setupCustomerAccount(){

  const accountBtn =
    document.getElementById("customerAccountBtn");

  const closeBtn =
    document.getElementById("customerCloseBtn");

  const saveBtn =
    document.getElementById("customerSaveBtn");

  const logoutBtn =
    document.getElementById("customerLogoutBtn");

  const modal =
    document.getElementById("customerModal");

  if(accountBtn){
    accountBtn.addEventListener(
      "click",
      openCustomerModal
    );
  }

  if(closeBtn){
    closeBtn.addEventListener(
      "click",
      closeCustomerModal
    );
  }

  if(saveBtn){
    saveBtn.addEventListener(
      "click",
      saveCustomer
    );
  }

  if(logoutBtn){
    logoutBtn.addEventListener(
      "click",
      logoutCustomer
    );
  }

  if(modal){
    modal.addEventListener(
      "click",
      event => {

        if(event.target === modal){
          closeCustomerModal();
        }

      }
    );
  }

  updateCustomerAccountUI();
}
setupCustomerAccount();
loadSavedCustomer();


/* =====================================================
   إرسال الطلب إلى واتساب
===================================================== */

const whatsappBtn =
  document.getElementById(
    "whatsappBtn"
  );


if(whatsappBtn){

  whatsappBtn.addEventListener(
    "click",
    async () => {

      /* الزائر لا يستطيع إرسال الطلب */
      if(!currentCustomer){

        alert(
          "لإرسال الطلب، يرجى تسجيل بياناتك أولاً من زر 👤 تسجيل / دخول."
        );

        openCustomerModal();
        return;

      }


      if(cart.size === 0){

        alert(
          "السلة فارغة. أضف مادة واحدة على الأقل."
        );

        return;

      }


      const name =
        document
          .getElementById("customerName")
          ?.value
          .trim() || currentCustomer.name;


      const phone =
        normalizePhone(
          document
            .getElementById("customerPhone")
            ?.value || currentCustomer.phone
        );


      const address =
        document
          .getElementById("customerAddress")
          ?.value
          .trim() || currentCustomer.address;


      const notes =
        document
          .getElementById("notes")
          ?.value
          .trim() || "";


      if(!name || !phone || !address){

        alert(
          "بيانات حسابك غير مكتملة. افتح حسابي وأكمل البيانات."
        );

        openCustomerModal();
        return;

      }


      let deliveryGroupName = "";
      let deliveryAreaName = "";
      let deliveryFee = 0;


      const groupSelect =
        document.getElementById("deliveryGroup");


      const areaSelect =
        document.getElementById("deliveryArea");


      const deliveryInfo =
        getCurrentDeliveryInfo();

      if(
        !deliveryInfo.deliveryGroupName ||
        !deliveryInfo.deliveryAreaName ||
        deliveryInfo.deliveryFee <= 0
      ){
        alert(
          "يرجى تحديد منطقة وعنوان التوصيل أولاً حتى تتم إضافة أجور التوصيل إلى الطلب."
        );
        return;
      }

      deliveryGroupName =
        deliveryInfo.deliveryGroupName;

      deliveryAreaName =
        deliveryInfo.deliveryAreaName;

      deliveryFee =
        deliveryInfo.deliveryFee;

      // حماية إضافية: إذا لم تُملأ القوائم لسبب ما،
      // نستخرج المنطقة المحفوظة من حساب الزبون مباشرة.
      if(
        currentCustomer &&
        (!deliveryAreaName || deliveryFee === 0)
      ){
        const savedGroupName =
          String(
            currentCustomer.city ||
            currentCustomer.delivery_group ||
            ""
          ).trim();

        const savedAreaName =
          String(
            currentCustomer.region ||
            currentCustomer.area ||
            currentCustomer.delivery_area ||
            ""
          ).trim();

        const savedGroup =
          deliveryGroups.find(
            group =>
              String(group?.name || "").trim() ===
              savedGroupName
          );

        if(savedGroup){
          deliveryGroupName =
            savedGroup.name || deliveryGroupName;

          const savedArea =
            Array.isArray(savedGroup.areas)
              ? savedGroup.areas.find(
                  area =>
                    String(area?.name || "").trim() ===
                    savedAreaName
                )
              : null;

          if(savedArea){
            deliveryAreaName =
              savedArea.name || deliveryAreaName;

            deliveryFee =
              Number(savedArea.fee) || 0;
          }
        }
      }


      /* ==============================================
         حساب إجمالي المواد
      ============================================== */

      let productsTotal = 0;
      let lines = [
        "🛒 طلب جديد — أمازون هايبر ماركت",
        ""
      ];


      const orderItems = [];


      for(const [id,q] of cart){

        const p =
          products.find(x => x.id === id);

        if(!p) continue;

        const itemTotal =
          Number(p.price) * Number(q);

        productsTotal += itemTotal;

        orderItems.push({
          id: p.id,
          name: p.name,
          quantity: q,
          unit: p.unit,
          price: Number(p.price) || 0,
          total: itemTotal
        });

        lines.push(
          `- ${p.name}: ${q} ${p.unit} — ${money(itemTotal)}`
        );

      }


      const total =
        productsTotal + deliveryFee;


      lines.push(
        "",
        `الاسم: ${name}`,
        `الهاتف: ${phone}`,
        `المدينة: ${currentCustomer.city || "بغداد"}`,
        `منطقة التوصيل الرئيسية: ${deliveryGroupName || currentCustomer.city || "لم يتم الاختيار"}`,
        `منطقة التوصيل: ${deliveryAreaName || currentCustomer.region || "لم يتم الاختيار"}`,
        `أجور التوصيل: ${money(deliveryFee)}`,
        `العنوان: ${address}`,
        `الملاحظات: ${notes || "لا توجد"}`,
        `المجموع التقريبي للمواد: ${money(productsTotal)}`,
        `الإجمالي التقريبي: ${money(total)}`,
        "",
        "تنويه: المواد التي تباع بالوزن قد يختلف وزنها وسعرها النهائي قليلاً بعد التجهيز، وسيتم تأكيد السعر النهائي قبل التسليم."
      );


      /* ==============================================
         حفظ الطلب في قاعدة البيانات
      ============================================== */

      try{

        const { error: orderError } =
          await supabaseClient
            .from("orders")
            .insert({
              customer_id: currentCustomer.id,
              customer_name: name,
              customer_phone: phone,
              delivery_group: deliveryGroupName || currentCustomer.city || null,
              delivery_area: deliveryAreaName || currentCustomer.region || null,
              address,
              items: orderItems,
              products_total: productsTotal,
              delivery_fee: deliveryFee,
              total,
              notes: notes || null,
              status: "new"
            });

        if(orderError){
          console.error("Order save error:", orderError);
          alert(
            "تعذر حفظ الطلب في قاعدة البيانات، لذلك لم يتم فتح واتساب. حاول مرة أخرى."
          );
          return;
        }

      }catch(error){

        console.error("Order save exception:", error);

        alert(
          "حدث خطأ أثناء حفظ الطلب. لم يتم إرسال الطلب إلى واتساب."
        );

        return;

      }


      const whatsappNumber =
        "9647842000516";


      const whatsappUrl =
        `https://wa.me/${whatsappNumber}?text=${
          encodeURIComponent(
            lines.join("\n")
          )
        }`;

      // الانتقال المباشر أكثر موثوقية على iPhone/Safari
      // من window.open بعد انتظار حفظ الطلب في Supabase.
      window.location.href = whatsappUrl;

    }
  );

}



/* =====================================================
   الشريط المتحرك
===================================================== */


/* =====================================================
   محتوى الصفحة الرئيسية
===================================================== */

let siteContent = {
  enabled:true,

  welcomeTitle:
    "👋 أهلاً وسهلاً بكم في أمازون هايبر ماركت 🛒",

  welcomeText:
    "نرحب بكم في متجرنا الإلكتروني، ونسعد بخدمتكم وتوفير احتياجاتكم بسهولة، مع توصيل طلباتكم إلى العنوان المحدد.",

  howToUse:
    "1. اختر القسم الذي تريد.\n" +
    "2. اختر المادة وحدد الكمية أو الوزن.\n" +
    "3. أضف المواد إلى السلة من علامة +.\n" +
    "4. سجّل بالموقع بالبيانات الصحيحة.\n" +
    "5. تأكد من منطقة وعنوان التوصيل.\n" +
    "6. أضف الاحتياجات التي لم تجدها أو الملاحظات قبل إرسال الطلب.\n" +
    "7. قبل الإرسال عبر WhatsApp، تأكد من اختيار المنطقة والعنوان لبيان مبلغ التوصيل.\n" +
    "8. اضغط إرسال الطلب عبر WhatsApp بعد التأكد من جميع التفاصيل.",

  notesInfo:
    "أضف الاحتياجات التي لم تجدها أو أي ملاحظات خاصة بالطلب في خانة الملاحظات قبل الإرسال.",

  deliveryPhone:
    "07842000516",

  storeAddress:
    "بغداد / المنصور / شارع أبو جعفر المنصور",

  deliveryNote:
    "قبل الإرسال عبر WhatsApp تأكد من اختيار المنطقة والعنوان بشكل صحيح ليتم احتساب مبلغ التوصيل."
};


function renderSiteContent(){

  const mount =
    document.getElementById(
      "siteWelcomeMount"
    );

  if(!mount)
    return;

  const c = {
    ...siteContent
  };

  if(c.enabled === false){
    mount.innerHTML = "";
    return;
  }

  mount.innerHTML = "";

  const section =
    document.createElement("section");

  section.className = "section";
  section.style.cssText =
    "background:linear-gradient(135deg,#f7fff8,#eef8f1);" +
    "border:1px solid #d7e9dc;" +
    "margin-bottom:12px;";

  const heading =
    document.createElement("div");

  heading.className = "section-heading";

  const h2 =
    document.createElement("h2");

  h2.textContent =
    c.welcomeTitle ||
    "أهلاً وسهلاً بكم";

  heading.appendChild(h2);

  const p =
    document.createElement("p");

  p.textContent =
    c.welcomeText || "";

  heading.appendChild(p);

  section.appendChild(heading);

  const grid =
    document.createElement("div");

  grid.style.cssText =
    "display:grid;" +
    "grid-template-columns:repeat(2,minmax(0,1fr));" +
    "gap:12px;";

  const howBox =
    document.createElement("div");

  howBox.style.cssText =
    "background:#fff;" +
    "border:1px solid #e0ebe3;" +
    "border-radius:14px;" +
    "padding:14px;";

  const howTitle =
    document.createElement("strong");

  howTitle.textContent =
    "📌 طريقة استخدام الموقع";

  howBox.appendChild(howTitle);

  const how =
    document.createElement("div");

  how.style.cssText =
    "margin-top:10px;" +
    "white-space:pre-line;" +
    "line-height:1.9;" +
    "color:#37413b;";

  how.textContent =
    c.howToUse || "";

  howBox.appendChild(how);

  grid.appendChild(howBox);

  const infoBox =
    document.createElement("div");

  infoBox.style.cssText =
    "background:#fff;" +
    "border:1px solid #e0ebe3;" +
    "border-radius:14px;" +
    "padding:14px;";

  const infoTitle =
    document.createElement("strong");

  infoTitle.textContent =
    "🚚 معلومات مهمة";

  infoBox.appendChild(infoTitle);

  const phone =
    document.createElement("p");

  phone.style.margin =
    "10px 0 6px";

  phone.textContent =
    "📞 هاتف التوصيل: " +
    (c.deliveryPhone || "");

  infoBox.appendChild(phone);

  const address =
    document.createElement("p");

  address.style.margin =
    "6px 0";

  address.textContent =
    "📍 العنوان: " +
    (c.storeAddress || "");

  infoBox.appendChild(address);

  const notes =
    document.createElement("p");

  notes.style.margin =
    "6px 0";

  notes.textContent =
    "📝 الملاحظات: " +
    (c.notesInfo || "");

  infoBox.appendChild(notes);

  const delivery =
    document.createElement("p");

  delivery.style.margin =
    "6px 0";

  delivery.style.fontWeight =
    "800";

  delivery.textContent =
    "⚠️ " +
    (c.deliveryNote || "");

  infoBox.appendChild(delivery);

  grid.appendChild(infoBox);

  section.appendChild(grid);

  mount.appendChild(section);

}


const tickerText =
  document.getElementById(
    "tickerText"
  );


if(tickerText){

  tickerText.textContent =
    "عروض خاصة • خصومات مميزة • توصيل داخل بغداد • الكمية والأسعار حسب توفر المخزون";

}


/* =====================================================
   تحميل الشريط من Supabase
===================================================== */

async function loadTicker(){

  try{

    const {
      data,
      error
    } =
      await supabaseClient

        .from("products")

        .select("data")

        .eq("id",1)

        .single();


    if(error){

      console.error(
        "Ticker error:",
        error
      );

      return;

    }


    const saved =
      data?.data || {};


    if(
      saved.ticker &&
      tickerText
    ){

      tickerText.textContent =
        saved.ticker;

    }


  }catch(error){

    console.error(
      "Ticker loading error:",
      error
    );

  }

}



/* =====================================================
   البحث عن المواد للزبون
   يبحث في جميع المواد المتاحة ولا يغيّر السلة أو الوزن.
===================================================== */

function updateProductSearchUI(){

  const clearBtn =
    document.getElementById("clearProductSearch");

  const hint =
    document.getElementById("productSearchHint");

  if(clearBtn){
    clearBtn.classList.toggle(
      "show",
      Boolean(String(productSearchQuery || "").trim())
    );
  }

  if(hint){

    const query =
      String(productSearchQuery || "")
        .trim()
        .toLowerCase();

    if(query){

      const count =
        products.filter(p =>
          String(p.name || "")
            .toLowerCase()
            .includes(query)
        ).length;

      hint.textContent =
        `نتائج البحث: ${count} مادة`;

    }else{

      hint.textContent =
        "ابحث في جميع المواد المتاحة في المتجر";

    }
  }
}

function initProductSearch(){

  const input =
    document.getElementById("productSearchInput");

  const clearBtn =
    document.getElementById("clearProductSearch");

  if(!input)
    return;

  input.addEventListener(
    "input",
    function(){

      productSearchQuery =
        String(input.value || "").trim();

      const title =
        document.getElementById("productsTitle");

      if(title){

        title.textContent =
          productSearchQuery
            ? "نتائج البحث"
            : (
                categories.find(
                  c => c.id === selectedCategory
                )?.name || "المواد"
              );
      }

      updateProductSearchUI();
      renderProducts();
    }
  );

  if(clearBtn){

    clearBtn.addEventListener(
      "click",
      function(){

        productSearchQuery = "";
        input.value = "";

        const title =
          document.getElementById("productsTitle");

        if(title){
          title.textContent =
            categories.find(
              c => c.id === selectedCategory
            )?.name || "المواد";
        }

        updateProductSearchUI();
        renderProducts();
        input.focus();
      }
    );
  }

  updateProductSearchUI();
}


/* =====================================================
   تشغيل الموقع
===================================================== */

initProductSearch();

renderSiteContent();

renderSiteContent();

renderCategories();

renderOffers();

renderDeliveryGroups();

renderProducts();

updateCart();

loadTicker();

Promise.all([
  loadProductsFromSupabase(),
  loadSavedCustomer()
]).then(() => {
  if(currentCustomer){
    fillCustomerOrderFields(currentCustomer);
  }

  updateCart();
});
