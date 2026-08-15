import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Gamepad2,
  Globe2,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  X,
  Zap,
  PackageCheck
} from "lucide-react";
import "./styles.css";

const translations = {
  ar: {
    dir: "rtl",
    nav: ["الرئيسية", "السكربتات", "الأكثر مبيعاً", "الدعم"],
    heroEyebrow: "متجر موارد FiveM احترافي",
    heroTitleA: "ابنِ سيرفرك",
    heroTitleB: "بموارد أقوى.",
    heroText: "سكربتات مختارة بعناية، تصميمات مميزة وتجربة شراء سريعة وآمنة لسيرفرات FiveM.",
    explore: "استكشف المنتجات",
    featured: "المنتجات المميزة",
    featuredSub: "موارد احترافية جاهزة للارتقاء بتجربة اللاعبين على سيرفرك.",
    viewAll: "عرض الكل",
    cart: "السلة",
    add: "أضف للسلة",
    added: "تمت الإضافة",
    buyNow: "اشترِ الآن",
    compatibility: "التوافق",
    instant: "تسليم رقمي فوري",
    secure: "عملية شراء آمنة",
    updates: "تحديثات مجانية",
    empty: "سلة التسوق فارغة",
    emptySub: "أضف بعض المنتجات للبدء.",
    subtotal: "المجموع",
    checkout: "الانتقال للدفع",
    checkoutTitle: "إتمام الطلب",
    checkoutText: "هذه نسخة تجريبية للواجهة. سنربط الدفع الحقيقي وفتح رابط التحميل في المرحلة التالية.",
    continue: "متابعة",
    close: "إغلاق",
    trusted: "مصمم للمطورين، مبني للسيرفرات الجادة.",
    stat1: "موارد احترافية",
    stat2: "تحديثات مستمرة",
    stat3: "دعم مباشر",
    badgeNew: "جديد",
    badgeBest: "الأكثر مبيعاً",
    badgePremium: "Premium"
  },
  en: {
    dir: "ltr",
    nav: ["Home", "Scripts", "Best Sellers", "Support"],
    heroEyebrow: "Premium FiveM marketplace",
    heroTitleA: "Build your server",
    heroTitleB: "with better resources.",
    heroText: "Curated scripts, polished systems and a fast buying experience for ambitious FiveM servers.",
    explore: "Explore products",
    featured: "Featured resources",
    featuredSub: "Professional assets ready to elevate your players' experience.",
    viewAll: "View all",
    cart: "Cart",
    add: "Add to cart",
    added: "Added",
    buyNow: "Buy now",
    compatibility: "Compatibility",
    instant: "Instant digital delivery",
    secure: "Secure checkout",
    updates: "Free updates",
    empty: "Your cart is empty",
    emptySub: "Add a few products to get started.",
    subtotal: "Subtotal",
    checkout: "Proceed to checkout",
    checkoutTitle: "Checkout",
    checkoutText: "This is the storefront prototype. Real payment and protected downloads will be connected in the next phase.",
    continue: "Continue",
    close: "Close",
    trusted: "Designed for developers. Built for serious servers.",
    stat1: "Premium resources",
    stat2: "Ongoing updates",
    stat3: "Direct support",
    badgeNew: "New",
    badgeBest: "Best seller",
    badgePremium: "Premium"
  }
};

const products = [
  {
    id: 1,
    titleAr: "نظام سيارات فاخر",
    titleEn: "Luxury Vehicle System",
    descAr: "تجربة متكاملة للسيارات مع واجهة حديثة، مفاتيح ذكية وإدارة متقدمة.",
    descEn: "A refined vehicle experience with modern UI, smart keys and advanced management.",
    price: 29.99,
    oldPrice: 39.99,
    tag: "badgeBest",
    framework: "QBCore / ESX",
    icon: "🏎️"
  },
  {
    id: 2,
    titleAr: "نظام وظائف متطور",
    titleEn: "Advanced Jobs Pack",
    descAr: "وظائف تفاعلية مع مهام، ترقيات، سجل نشاط ولوحة تحكم احترافية.",
    descEn: "Interactive jobs with tasks, progression, activity logs and a polished dashboard.",
    price: 24.99,
    oldPrice: null,
    tag: "badgeNew",
    framework: "QBCore",
    icon: "🧰"
  },
  {
    id: 3,
    titleAr: "نظام شرطة Premium",
    titleEn: "Premium Police Suite",
    descAr: "حزمة متكاملة للشرطة تشمل MDT، الأدلة، البلاغات وإدارة الوحدات.",
    descEn: "Complete police suite with MDT, evidence, dispatch and unit management.",
    price: 44.99,
    oldPrice: 54.99,
    tag: "badgePremium",
    framework: "ESX / QBCore",
    icon: "🚓"
  },
  {
    id: 4,
    titleAr: "نظام جراج ذكي",
    titleEn: "Smart Garage",
    descAr: "جراج سريع وأنيق مع صور المركبات، حالة السيارة ومواقع متعددة.",
    descEn: "Fast garage with vehicle imagery, condition state and multi-location support.",
    price: 18.99,
    oldPrice: null,
    tag: "badgePremium",
    framework: "Standalone",
    icon: "🅿️"
  }
];

function App() {
  const [lang, setLang] = useState("ar");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const t = translations[lang];
  const isAr = lang === "ar";

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price, 0),
    [cart]
  );

  const addToCart = (product) => {
    if (!cart.find((item) => item.id === product.id)) {
      setCart([...cart, product]);
    }
    setCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const title = (p) => (isAr ? p.titleAr : p.titleEn);
  const desc = (p) => (isAr ? p.descAr : p.descEn);

  return (
    <div className="app" dir={t.dir}>
      <div className="noise" />

      <header className="header">
        <a href="#" className="brand">
          <span className="brandMark"><Gamepad2 size={21} /></span>
          <span>RESPECT <b>CFW</b></span>
        </a>

        <nav className="desktopNav">
          {t.nav.map((item, i) => <a key={i} href={i === 1 ? "#products" : "#"}>{item}</a>)}
        </nav>

        <div className="headerActions">
          <button className="langBtn" onClick={() => setLang(isAr ? "en" : "ar")}>
            <Globe2 size={17} />
            <span>{isAr ? "EN" : "AR"}</span>
          </button>
          <button className="iconBtn cartBtn" onClick={() => setCartOpen(true)}>
            <ShoppingBag size={19} />
            {cart.length > 0 && <span className="cartCount">{cart.length}</span>}
          </button>
          <button className="mobileMenu" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="mobileNav">
          {t.nav.map((item, i) => <a key={i} href={i === 1 ? "#products" : "#"} onClick={() => setMobileOpen(false)}>{item}</a>)}
        </div>
      )}

      <main>
        <section className="hero">
          <div className="orb orbOne" />
          <div className="orb orbTwo" />

          <div className="heroContent">
            <div className="eyebrow"><Sparkles size={16} /> {t.heroEyebrow}</div>
            <h1>
              <span>{t.heroTitleA}</span>
              <span className="gradientText">{t.heroTitleB}</span>
            </h1>
            <p>{t.heroText}</p>
            <div className="heroButtons">
              <a className="primaryBtn" href="#products">
                {t.explore}
                {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </a>
              <button className="ghostBtn" onClick={() => setCartOpen(true)}>
                <ShoppingBag size={18} /> {t.cart}
              </button>
            </div>

            <div className="trustRow">
              <span><ShieldCheck size={16} /> {t.secure}</span>
              <span><PackageCheck size={16} /> {t.instant}</span>
              <span><Zap size={16} /> {t.updates}</span>
            </div>
          </div>

          <div className="heroVisual">
            <div className="showcaseCard backCard">
              <div className="codeLines">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="showcaseCard mainCard">
              <div className="visualTop">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="visualImage">
                <div className="car">🏁</div>
                <div className="visualGlow" />
              </div>
              <div className="visualMeta">
                <div>
                  <small>FEATURED RESOURCE</small>
                  <strong>{isAr ? "نظام سيارات فاخر" : "Luxury Vehicle System"}</strong>
                </div>
                <span>$29.99</span>
              </div>
            </div>
          </div>
        </section>

        <section className="stats">
          <div>
            <strong>20+</strong>
            <span>{t.stat1}</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>{t.stat2}</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>{t.stat3}</span>
          </div>
        </section>

        <section className="productsSection" id="products">
          <div className="sectionHeading">
            <div>
              <span className="miniLabel">FIVEM RESOURCES</span>
              <h2>{t.featured}</h2>
              <p>{t.featuredSub}</p>
            </div>
            <button className="viewAllBtn">{t.viewAll} {isAr ? <ArrowLeft size={17}/> : <ArrowRight size={17}/>}</button>
          </div>

          <div className="productGrid">
            {products.map((product) => {
              const inCart = cart.some((x) => x.id === product.id);
              return (
                <article className="productCard" key={product.id}>
                  <div className="productImage">
                    <div className="productIcon">{product.icon}</div>
                    <div className="productGlow" />
                    <span className="badge">{t[product.tag]}</span>
                  </div>
                  <div className="productBody">
                    <div className="rating">
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <span>5.0</span>
                    </div>
                    <h3>{title(product)}</h3>
                    <p>{desc(product)}</p>
                    <div className="compatibility">
                      <Code2 size={14} />
                      <span>{t.compatibility}: {product.framework}</span>
                    </div>
                    <div className="productBottom">
                      <div className="price">
                        <strong>${product.price.toFixed(2)}</strong>
                        {product.oldPrice && <del>${product.oldPrice.toFixed(2)}</del>}
                      </div>
                      <button
                        className={`addBtn ${inCart ? "inCart" : ""}`}
                        onClick={() => addToCart(product)}
                      >
                        {inCart ? <Check size={17} /> : <ShoppingBag size={17} />}
                        {inCart ? t.added : t.add}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="cta">
          <div>
            <span className="miniLabel">RESPECT CFW</span>
            <h2>{t.trusted}</h2>
          </div>
          <a href="#products" className="primaryBtn">{t.explore} {isAr ? <ArrowLeft size={18}/> : <ArrowRight size={18}/>}</a>
        </section>
      </main>

      <footer>
        <a href="#" className="brand">
          <span className="brandMark"><Gamepad2 size={19} /></span>
          <span>RESPECT <b>CFW</b></span>
        </a>
        <span>© 2026 Respect CFW. All rights reserved.</span>
      </footer>

      {cartOpen && (
        <>
          <div className="overlay" onClick={() => setCartOpen(false)} />
          <aside className={`cartDrawer ${isAr ? "cartRTL" : ""}`}>
            <div className="drawerHeader">
              <div>
                <small>{cart.length} ITEMS</small>
                <h3>{t.cart}</h3>
              </div>
              <button className="closeBtn" onClick={() => setCartOpen(false)}><X /></button>
            </div>

            <div className="cartContent">
              {cart.length === 0 ? (
                <div className="emptyCart">
                  <ShoppingBag size={36} />
                  <h4>{t.empty}</h4>
                  <p>{t.emptySub}</p>
                </div>
              ) : cart.map((item) => (
                <div className="cartItem" key={item.id}>
                  <div className="cartThumb">{item.icon}</div>
                  <div className="cartInfo">
                    <strong>{title(item)}</strong>
                    <span>{item.framework}</span>
                    <b>${item.price.toFixed(2)}</b>
                  </div>
                  <button onClick={() => removeFromCart(item.id)}><X size={16}/></button>
                </div>
              ))}
            </div>

            <div className="drawerFooter">
              <div className="subtotal">
                <span>{t.subtotal}</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <button
                className="checkoutBtn"
                disabled={!cart.length}
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
              >
                {t.checkout}
                {isAr ? <ArrowLeft size={18}/> : <ArrowRight size={18}/>}
              </button>
            </div>
          </aside>
        </>
      )}

      {checkoutOpen && (
        <div className="modalWrap">
          <div className="overlay" onClick={() => setCheckoutOpen(false)} />
          <div className="checkoutModal">
            <div className="modalIcon"><ShieldCheck /></div>
            <h3>{t.checkoutTitle}</h3>
            <p>{t.checkoutText}</p>
            <div className="checkoutSummary">
              <span>{t.subtotal}</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <button className="checkoutBtn" onClick={() => alert(isAr ? "سيتم ربط بوابة الدفع في المرحلة التالية." : "Payment gateway will be connected in the next phase.")}>
              {t.continue}
              {isAr ? <ArrowLeft size={18}/> : <ArrowRight size={18}/>}
            </button>
            <button className="modalCloseText" onClick={() => setCheckoutOpen(false)}>{t.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);