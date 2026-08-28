/* =====================================================
   AMAZON HYPERMARKET - APP.JS
===================================================== */

const SUPABASE_URL =
  "https://vvexorzjkpwduykinwsw.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_RoMHq19grLJWNu95uPSwug_XwiKt2bB";

const supabaseClient =
  supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


/* =====================================================
   الأقسام
===================================================== */

const categories = [
  { id:"food",        name:"مواد غذائية",  icon:"🛒" },
  { id:"cleaning",    name:"منظفات",       icon:"🧴" },
  { id:"cosmetic",    name:"كوزمتك",       icon:"💄" },
  { id:"meat",        name:"لحوم",         icon:"🥩" },
  { id:"chicken",     name:"دجاج",         icon:"🍗" },
  { id:"vegetables",  name:"خضار وفواكه",  icon:"🥬" },
  { id:"dairy",       name:"ألبان وأجبان", icon:"🥛" },
  { id:"drinks",      name:"مشروبات",      icon:"🥤" }
];


/* =====================================================
   المتغيرات
===================================================== */

let products = [];
let offers = [];
let deliveryGroups = [];

let selectedCategory = "food";

let selectedDeliveryGroup = "";
let selectedDeliveryArea = "";
let deliveryFee = 0;

const cart = new Map();


/* =====================================================
   أدوات
===================================================== */

function money(value) {
  return (
    new Intl.NumberFormat("ar-IQ").format(
      Number(value) || 0
    ) + " د.ع"
  );
}


/* =====================================================
   أدوات مناطق التوصيل
===================================================== */

function getDeliveryGroupName(group) {

  if (typeof group === "string") {
    return group.trim();
  }

  return String(
    group?.name ??
    group?.title ??
    group?.groupName ??
    ""
  ).trim();
}


function getDeliveryAreas(group) {

  if (!group) {
    return [];
  }

  if (Array.isArray(group.areas)) {
    return group.areas;
  }

  if (Array.isArray(group.regions)) {
    return group.regions;
  }

  if (Array.isArray(group.items)) {
    return group.items;
  }

  return [];
}


function getDeliveryAreaName(area) {

  if (typeof area === "string") {
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


function getDeliveryAreaFee(area) {

  if (typeof area === "number") {
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
   تحميل البيانات من Supabase
===================================================== */

async function loadPageData() {

  try {

    const result =
      await supabaseClient
        .from("products")
        .select("data")
        .eq("id", 1)
        .single();

    if (result.error) {
      throw result.error;
    }

    const saved =
      result.data?.data || {};


    /* المنتجات */

    products =
      Array.isArray(saved.products)
        ? saved.products
            .filter(
              p =>
                p &&
                p.active !== false
            )
            .map(
              p => ({
                id: Number(p.id),
                cat: p.cat || "food",
                name: p.name || "",
                price: Number(p.price) || 0,
                unit: p.unit || "قطعة",
                icon: p.icon || "🛒"
              })
            )
            .filter(
              p =>
                p.id &&
                p.name
            )
        : [];


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
      typeof saved.ticker === "string"
        ? saved.ticker.trim()
        : "";

    const tickerEl =
      document.getElementById("tickerText");

    if (tickerEl) {

      tickerEl.textContent =
        ticker ||
        "عروض خاصة • خصومات مميزة • توصيل داخل بغداد";

    }


    renderCategories();
    renderProducts();
    renderOffers();
    renderDeliveryGroups();
    updateCart();

  }

  catch (error) {

    console.error(
      "خطأ تحميل البيانات:",
      error
    );

    renderCategories();
    renderProducts();
    renderOffers();
    renderDeliveryGroups();
    updateCart();

  }
}


/* =====================================================
   الأقسام
===================================================== */

function renderCategories() {

  const box =
    document.getElementById("categories");

  if (!box) {
    return;
  }

  box.innerHTML =
    categories
      .map(
        category => `

          <button
            type="button"
            class="category ${
              selectedCategory === category.id
                ? "active"
                : ""
            }"
            data-cat="${category.id}"
          >

            <div class="category-icon">
              ${category.icon}
            </div>

            <strong>
              ${category.name}
            </strong>

          </button>

        `
      )
      .join("");


  box
    .querySelectorAll(".category")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          function () {

            selectedCategory =
              this.dataset.cat;

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

            if (title) {

              title.textContent =
                category?.name ||
                "المواد";

            }

            renderCategories();
            renderProducts();

          }
        );

      }
    );
}


/* =====================================================
   المنتجات
===================================================== */

function renderProducts() {

  const box =
    document.getElementById(
      "productsGrid"
    );

  if (!box) {
    return;
  }

  const list =
    products.filter(
      product =>
        product.cat ===
        selectedCategory
    );


  if (!list.length) {

    box.innerHTML = `
      <div
        style="
          grid-column:1/-1;
          text-align:center;
          padding:30px;
        "
      >
        لا توجد مواد في هذا القسم حالياً.
      </div>
    `;

    return;
  }


  box.innerHTML =
    list
      .map(
        product => {

          const quantity =
            cart.get(product.id) || 0;

          return `

            <article class="product">

              <div class="product-top">

                <div>

                  <h3>
                    ${product.name}
                  </h3>

                  <div class="product-meta">
                    يباع بـ ${product.unit}
                  </div>

                </div>

                <div class="product-icon">
                  ${product.icon}
                </div>

              </div>


              <div class="product-price">
                ${money(product.price)}

                <small>
                  / ${product.unit}
                </small>
              </div>


              <div class="qty">

                <button
                  type="button"
                  onclick="changeQty(${product.id},1)"
                >
                  +
                </button>

                <span>
                  ${quantity}
                </span>

                <button
                  type="button"
                  onclick="changeQty(${product.id},-1)"
                >
                  −
                </button>

              </div>

            </article>

          `;

        }
      )
      .join("");
}


/* =====================================================
   السلة
===================================================== */

function changeQty(id, change) {

  const oldQuantity =
    Number(
      cart.get(id) || 0
    );

  const newQuantity =
    Math.max(
      0,
      oldQuantity + change
    );


  if (newQuantity > 0) {

    cart.set(
      id,
      newQuantity
    );

  } else {

    cart.delete(id);

  }


  renderProducts();
  updateCart();
}


window.changeQty = changeQty;


function getProductsTotal() {

  let total = 0;

  for (
    const [id, quantity]
    of cart
  ) {

    const product =
      products.find(
        p =>
          Number(p.id) ===
          Number(id)
      );

    if (product) {

      total +=
        Number(product.price) *
        Number(quantity);

    }
  }

  return total;
}


function updateCart() {

  const productsTotal =
    getProductsTotal();

  const finalTotal =
    productsTotal +
    Number(deliveryFee || 0);


  let count = 0;

  for (
    const [, quantity]
    of cart
  ) {

    count +=
      Number(quantity);

  }


  const total =
    document.getElementById(
      "cartTotal"
    );

  const countEl =
    document.getElementById(
      "cartCount"
    );

  const topCount =
    document.getElementById(
      "cartCountTop"
    );

  const delivery =
    document.getElementById(
      "deliveryFee"
    );

  const grand =
    document.getElementById(
      "grandTotal"
    );

  const deliveryText =
    document.getElementById(
      "deliveryAreaText"
    );

  const deliverySummary =
    document.getElementById(
      "deliverySummary"
    );


  if (total) {
    total.textContent =
      money(finalTotal);
  }

  if (countEl) {
    countEl.textContent =
      count;
  }

  if (topCount) {
    topCount.textContent =
      count;
  }

  if (delivery) {
    delivery.textContent =
      money(deliveryFee);
  }

  if (grand) {
    grand.textContent =
      money(finalTotal);
  }

  if (deliveryText) {

    deliveryText.textContent =
      selectedDeliveryArea
        ? `${selectedDeliveryGroup} / ${selectedDeliveryArea}`
        : "";

  }

  if (deliverySummary) {

    deliverySummary.style.display =
      selectedDeliveryArea
        ? "flex"
        : "none";

  }
}


/* =====================================================
   مناطق التوصيل
===================================================== */

function setupDelivery() {

  const groupSelect =
    document.getElementById(
      "deliveryGroup"
    );

  const areaSelect =
    document.getElementById(
      "deliveryArea"
    );


  if (
    !groupSelect ||
    !areaSelect
  ) {
    return;
  }


  groupSelect.onchange =
    function () {

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
    function () {

      selectedDeliveryArea =
        this.value;

      const group =
        deliveryGroups.find(
          g =>
            getDeliveryGroupName(g) ===
            selectedDeliveryGroup
        );

      const areas =
        getDeliveryAreas(group);

      const area =
        areas.find(
          item =>
            getDeliveryAreaName(item) ===
            selectedDeliveryArea
        );

      if (!area) {

        deliveryFee = 0;

        updateCart();

        return;
      }

      deliveryFee =
        getDeliveryAreaFee(area);

      updateCart();

    };
}


function renderDeliveryGroups() {

  const select =
    document.getElementById(
      "deliveryGroup"
    );

  if (!select) {
    return;
  }


  select.innerHTML = `
    <option value="">
      اختر المنطقة الرئيسية
    </option>
  `;


  deliveryGroups.forEach(
    group => {

      const name =
        getDeliveryGroupName(group);

      if (!name) {
        return;
      }

      const option =
        document.createElement(
          "option"
        );

      option.value = name;
      option.textContent = name;

      select.appendChild(option);

    }
  );


  selectedDeliveryGroup = "";
  selectedDeliveryArea = "";
  deliveryFee = 0;

  renderDeliveryAreas();
  setupDelivery();
  updateCart();
}


function renderDeliveryAreas() {

  const select =
    document.getElementById(
      "deliveryArea"
    );

  if (!select) {
    return;
  }


  select.innerHTML = `
    <option value="">
      اختر المنطقة
    </option>
  `;


  const group =
    deliveryGroups.find(
      g =>
        getDeliveryGroupName(g) ===
        selectedDeliveryGroup
    );


  const areas =
    getDeliveryAreas(group);


  select.disabled =
    !selectedDeliveryGroup ||
    !areas.length;


  areas.forEach(
    area => {

      const name =
        getDeliveryAreaName(area);

      if (!name) {
        return;
      }

      const fee =
        getDeliveryAreaFee(area);

      const option =
        document.createElement(
          "option"
        );

      option.value = name;

      option.textContent =
        `${name} — ${money(fee)}`;

      select.appendChild(option);

    }
  );
}


/* =====================================================
   العروض
===================================================== */

function renderOffers() {

  const box =
    document.getElementById(
      "offerCards"
    );

  if (!box) {
    return;
  }


  if (!Array.isArray(offers)) {

    box.innerHTML = "";
    return;

  }


  box.innerHTML =
    offers
      .map(
        offer => {

          const items =
            Array.isArray(offer.items)
              ? offer.items
              : [];


          return `

            <article class="offer-card">

              <div class="offer-head">

                <span class="offer-badge">
                  عرض خاص
                </span>

                <h3>
                  ${offer.title || "عرض خاص"}
                </h3>

                <div class="offer-date">

                  ${
                    offer.from
                      ? "من " + offer.from
                      : ""
                  }

                  ${
                    offer.to
                      ? " إلى " + offer.to
                      : ""
                  }

                </div>

              </div>


              <div class="offer-body">

                ${
                  items
                    .map(
                      item => {

                        const name =
                          item?.name ||
                          item?.title ||
                          "";

                        const oldPrice =
                          item?.price ??
                          item?.originalPrice ??
                          item?.oldPrice ??
                          "";

                        const newPrice =
                          item?.offerPrice ??
                          item?.salePrice ??
                          item?.discountPrice ??
                          "";


                        return `

                          <div class="offer-item">

                            <span>
                              ${name}
                            </span>

                            <span class="offer-price">

                              ${
                                oldPrice !== "" &&
                                newPrice !== "" &&
                                Number(oldPrice) !== Number(newPrice)

                                  ? `
                                    <del>
                                      ${money(oldPrice)}
                                    </del>

                                    <strong>
                                      ${money(newPrice)}
                                    </strong>
                                  `

                                  : money(
                                      newPrice !== ""
                                        ? newPrice
                                        : oldPrice
                                    )
                              }

                            </span>

                          </div>

                        `;

                      }
                    )
                    .join("")
                }

              </div>

            </article>

          `;

        }
      )
      .join("");
}


/* =====================================================
   واتساب
===================================================== */

function setupWhatsApp() {

  const button =
    document.getElementById(
      "whatsappBtn"
    );

  if (!button) {
    return;
  }


  button.onclick =
    function () {

      if (!cart.size) {

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


      if (
        !name ||
        !phone ||
        !address
      ) {

        alert(
          "يرجى إدخال الاسم ورقم الهاتف والعنوان."
        );

        return;
      }


      if (
        deliveryGroups.length &&
        (
          !selectedDeliveryGroup ||
          !selectedDeliveryArea
        )
      ) {

        alert(
          "يرجى اختيار منطقة التوصيل."
        );

        return;
      }


      const productsTotal =
        getProductsTotal();

      const finalTotal =
        productsTotal +
        Number(deliveryFee || 0);


      const lines = [];


      lines.push(
        "طلب جديد — أمازون هايبر ماركت",
        ""
      );


      for (
        const [id, quantity]
        of cart
      ) {

        const product =
          products.find(
            p =>
              Number(p.id) ===
              Number(id)
          );

        if (product) {

          lines.push(
            `- ${product.name}: ${quantity} ${product.unit}`
          );

        }
      }


      lines.push(
        "",
        `قيمة المواد: ${money(productsTotal)}`,
        `منطقة التوصيل الرئيسية: ${selectedDeliveryGroup || "غير محددة"}`,
        `منطقة التوصيل: ${selectedDeliveryArea || "غير محددة"}`,
        `أجور التوصيل: ${money(deliveryFee)}`,
        `المجموع النهائي: ${money(finalTotal)}`,
        "",
        `الاسم: ${name}`,
        `الهاتف: ${phone}`,
        `العنوان: ${address}`,
        `الملاحظات: ${notes || "لا توجد"}`,
        "",
        "بعض المواد تباع بالوزن، وقد يختلف الوزن الفعلي والسعر النهائي قليلاً بعد التجهيز."
      );


      const whatsappNumber =
        "9647842000516";


      const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(
          lines.join("\n")
        );


      window.location.href =
        url;

    };
}


/* =====================================================
   التشغيل
===================================================== */

renderCategories();
renderProducts();
renderOffers();
setupDelivery();
setupWhatsApp();
updateCart();
loadPageData();
