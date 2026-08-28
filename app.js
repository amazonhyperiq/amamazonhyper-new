const SUPABASE_URL = "https://vexorzjkpwduykinwsw.supabase.co";
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
   تحميل الأقسام والمنتجات من Supabase
===================================================== */

async function loadProductsFromSupabase(){

  try{

    const { data, error } =
      await supabaseClient
        .from("products")
        .select("data")
        .limit(1)
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
       تحميل الأقسام التي أنشأها المدير
    ============================================== */

    if(
      Array.isArray(saved.categories) &&
      saved.categories.length
    ){

      categories =
        saved.categories.map(c => ({

          id:String(c.id),

          name:String(
            c.name || "قسم"
          ),

          icon:String(
            c.icon || "🛒"
          )

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

    renderProducts();

    updateCart();


    console.log(
      "تم تحميل الأقسام والمنتجات من Supabase:",
      categories.length,
      products.length
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
   تحميل العروض ومناطق التوصيل
===================================================== */

function loadStoreSettings(saved){

  /* =========================
     العروض
  ========================= */

  if(
    Array.isArray(saved.offers)
  ){

    offers = saved.offers;

  }else{

    offers = [];

  }


  /* =========================
     مناطق التوصيل
  ========================= */

  if(
    Array.isArray(saved.deliveryGroups)
  ){

    deliveryGroups =
      saved.deliveryGroups;

  }else{

    deliveryGroups = [];

  }


  renderOffers();

  renderDeliveryGroups();

}
/* =====================================================
   السلة والقسم المحدد
===================================================== */

let selectedCategory = "food";

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


          renderCategories();

          renderProducts();


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


  el.innerHTML =
    offers
      .map(o => `

        <article class="offer-card">

          <div class="offer-head">

            <span class="offer-badge">
              عرض خاص
            </span>

            <h3>
              ${o.title}
            </h3>

            <div class="offer-date">

              من ${o.from}
              إلى ${o.to}

            </div>

          </div>


          <div class="offer-body">

            ${
              o.items
                .map(
                  i => `

                    <div class="offer-item">

                      <span>
                        ${i[0]}
                      </span>

                      <span class="offer-price">
                        ${i[1]}
                      </span>

                    </div>

                  `
                )
                .join("")
            }

          </div>

        </article>

      `)
      .join("");

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


  const list =
    products.filter(
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

        لا توجد مواد في هذا القسم حالياً.

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

  const q =
    Math.max(
      0,
      (cart.get(id) || 0) +
      delta
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

function updateCart(){

  let total = 0;

  let count = 0;


  for(
    const [id,q]
    of cart
  ){

    const p =
      products.find(
        x =>
          x.id === id
      );


    if(p){

      total +=
        p.price * q;

      count +=
        q;

    }

  }


  const cartTotal =
    document.getElementById(
      "cartTotal"
    );


  if(cartTotal){

    cartTotal.textContent =
      money(total);

  }


  const cartCount =
    document.getElementById(
      "cartCount"
    );


  if(cartCount){

    cartCount.textContent =
      count;

  }


  const cartCountTop =
    document.getElementById(
      "cartCountTop"
    );


  if(cartCountTop){

    cartCountTop.textContent =
      count;

  }

}


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
    () => {


      if(
        cart.size === 0
      ){

        alert(
          "السلة فارغة. أضف مادة واحدة على الأقل."
        );

        return;

      }


      const name =
        document
          .getElementById(
            "customerName"
          )
          .value
          .trim();


      const phone =
        document
          .getElementById(
            "customerPhone"
          )
          .value
          .trim();


      const address =
        document
          .getElementById(
            "customerAddress"
          )
          .value
          .trim();


      const notes =
        document
          .getElementById(
            "notes"
          )
          .value
          .trim();


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


      let lines = [

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
              x.id === id
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

        `الملاحظات: ${
          notes || "لا توجد"
        }`,

        "",

        "تنويه: المواد التي تباع بالوزن قد يختلف وزنها وسعرها النهائي قليلاً بعد التجهيز، وسيتم تأكيد السعر النهائي قبل التسليم."

      );


      const whatsappNumber =
        "9647700000000";


      window.open(

        `https://wa.me/${whatsappNumber}?text=${
          encodeURIComponent(
            lines.join("\n")
          )
        }`,

        "_blank"

      );

    }
  );

}


/* =====================================================
   الشريط المتحرك
===================================================== */

const tickerText =
  document.getElementById(
    "tickerText"
  );


if(tickerText){

  tickerText.textContent =
    "عروض خاصة • خصومات مميزة • توصيل داخل بغداد • الكمية والأسعار حسب توفر المخزون";

}


/* =====================================================
   تشغيل الموقع
===================================================== */

renderCategories();

renderOffers();

renderProducts();

updateCart();

loadProductsFromSupabase();
