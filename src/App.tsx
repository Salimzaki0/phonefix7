import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Smartphone, Battery, Droplets, Volume2, Zap, HelpCircle,
  ArrowRight, ArrowLeft, Check, Wrench, Phone, Bell, Instagram,
  Ghost, MapPin, Clock, MessageCircle,
} from "lucide-react";

const BRANDS = [
  { id: "iphone", label: "ئایفۆن" },
  { id: "samsung", label: "سامسۆنگ" },
  { id: "huawei", label: "هواوێ" },
  { id: "xiaomi", label: "شیائۆمی" },
  { id: "oppo", label: "ئۆپۆ / ڤیڤۆ" },
  { id: "other", label: "مارکەکا دی" },
];

const ISSUES = [
  { id: "screen", label: "شاشا شکیایە", icon: Smartphone, base: 25 },
  { id: "battery", label: "باتری نەمایە", icon: Battery, base: 15 },
  { id: "charge", label: "شارژ نابیت", icon: Zap, base: 12 },
  { id: "water", label: "ئاوی کەفتییە پێ", icon: Droplets, base: 30 },
  { id: "sound", label: "دەنگ / کامێرا خرابە", icon: Volume2, base: 18 },
  { id: "other", label: "کێماسیەکا دی", icon: HelpCircle, base: 20 },
];

const IPHONE_MODELS = [
  "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16", "iPhone 16e",
  "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15",
  "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14",
  "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13 Mini", "iPhone 13",
  "iPhone SE (2022)", "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12 Mini", "iPhone 12",
  "iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11",
  "iPhone XS Max", "iPhone XS", "iPhone XR", "iPhone X",
  "iPhone 8 Plus", "iPhone 8", "iPhone 7 Plus", "iPhone 7",
  "iPhone SE (2016)", "iPhone 6s Plus", "iPhone 6s", "iPhone 6 Plus", "iPhone 6",
];

const ZAKHO_AREAS = ["مهندیک", "بیدار", "سیمالکا", "ئاشێ جەمی", "تلکێبر", "شقا", "فرقێ", "خرابابک", "تاخێ شەهیدان", "مجمعا", "سەبعە نیسان", "رکاڤا", "عەباسیک", "12 ملان"];

const BRAND_MULT = { iphone: 1.6, samsung: 1.3, huawei: 1.1, xiaomi: 1.0, oppo: 1.0, other: 1.0 };

// نرخ دیفه‌رێت لدویڤ مۆدێلێ ئایفۆنی -- ژ نویترین بۆ کۆنترین. هژمار جوان کرن دشێت.
const IPHONE_MODEL_MULT = {
  "iPhone 16 Pro Max": 2.2,
  "iPhone 16 Pro": 2.0,
  "iPhone 16 Plus": 1.75,
  "iPhone 16": 1.6,
  "iPhone 16e": 1.4,
  "iPhone 15 Pro Max": 1.9,
  "iPhone 15 Pro": 1.75,
  "iPhone 15 Plus": 1.5,
  "iPhone 15": 1.4,
  "iPhone 14 Pro Max": 1.7,
  "iPhone 14 Pro": 1.55,
  "iPhone 14 Plus": 1.35,
  "iPhone 14": 1.25,
  "iPhone 13 Pro Max": 1.5,
  "iPhone 13 Pro": 1.4,
  "iPhone 13 Mini": 1.15,
  "iPhone 13": 1.2,
  "iPhone SE (2022)": 0.9,
  "iPhone 12 Pro Max": 1.35,
  "iPhone 12 Pro": 1.25,
  "iPhone 12 Mini": 1.05,
  "iPhone 12": 1.1,
  "iPhone 11 Pro Max": 1.2,
  "iPhone 11 Pro": 1.1,
  "iPhone 11": 1.0,
  "iPhone XS Max": 1.1,
  "iPhone XS": 1.0,
  "iPhone XR": 0.95,
  "iPhone X": 0.95,
  "iPhone 8 Plus": 0.85,
  "iPhone 8": 0.8,
  "iPhone 7 Plus": 0.75,
  "iPhone 7": 0.7,
  "iPhone SE (2016)": 0.65,
  "iPhone 6s Plus": 0.7,
  "iPhone 6s": 0.65,
  "iPhone 6 Plus": 0.65,
  "iPhone 6": 0.6,
};
const SHOP_WHATSAPP = "9647517822801";
const SHOP_PHONE = "+9647517822801";
const INSTAGRAM_HANDLE = "sa1im_zaki";
const INSTAGRAM_URL = "https://www.instagram.com/sa1im_zaki?igsh=MW5weG1oaW4yMmJxMg%3D%3D&utm_source=qr";
const INSTAGRAM_APP_URL = `instagram://user?username=${INSTAGRAM_HANDLE}`;
const SNAPCHAT_HANDLE = "sa1im_zaki";
const SNAPCHAT_URL = "https://snapchat.com/t/mgkQbu76";
const SNAPCHAT_APP_URL = `snapchat://add/${SNAPCHAT_HANDLE}`;

function openApp(appUrl, webUrl) {
  const now = Date.now();
  const fallback = setTimeout(() => {
    if (Date.now() - now < 2000) {
      window.open(webUrl, "_blank");
    }
  }, 800);
  window.location.href = appUrl;
  window.addEventListener("blur", () => clearTimeout(fallback), { once: true });
}
const REQUESTS_KEY = "repair-requests-list";
const ACTIVE_SESSIONS_KEY = "site-active-sessions";
const TOTAL_VISITS_KEY = "site-total-visits";
const ACTIVE_WINDOW_MS = 40000;
const HEARTBEAT_MS = 15000;

function estimatePrice(brandId, issueId, model) {
  const issue = ISSUES.find((i) => i.id === issueId);
  const brandMult = BRAND_MULT[brandId] || 1;
  const modelMult = brandId === "iphone" ? IPHONE_MODEL_MULT[model] || 1 : 1;
  const mult = brandMult * modelMult;
  const low = Math.round(issue.base * mult);
  const high = Math.round(issue.base * mult * 1.6);
  return { low, high };
}

function buildWhatsAppMessage({ ticketNo, brandLabel, model, issueLabel, price, name, phone, city, locationLink }) {
  const lines = [
    `داواکارییەکا نوی ژ ماڵپەڕی - تیکێت #${ticketNo}`,
    `ناڤ: ${name}`,
    `تەلەفۆن: ${phone}`,
    city ? `شار: ${city}` : null,
    `مارکا مووبایلی: ${brandLabel}`,
    model ? `مۆدێل: ${model}` : null,
    `کێماسی: ${issueLabel}`,
    price ? `نرخێ تخمینی: ${price.low} – ${price.high} $` : null,
    locationLink ? `شوینا نوکه: ${locationLink}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

function getLocationLink() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    const timeout = setTimeout(() => resolve(null), 8000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        const { latitude, longitude } = pos.coords;
        resolve(`https://maps.google.com/?q=${latitude},${longitude}`);
      },
      () => {
        clearTimeout(timeout);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
}

function TicketLine({ label, value, filled }) {
  return (
    <div className="flex items-baseline justify-between border-b border-dashed border-[#3a3f38] py-2">
      <span className="text-[11px] tracking-widest uppercase text-white" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        {label}
      </span>
      <span
        className={`text-sm ${filled ? "text-white" : "text-[#4a4f47]"}`}
        style={{ fontFamily: filled ? "'Vazirmatn', sans-serif" : "'IBM Plex Mono', monospace" }}
      >
        {value || "— — —"}
      </span>
    </div>
  );
}

const TABS = [
  { id: "service", label: "جۆرێ سەخبیرکرن", icon: Wrench },
  { id: "contact", label: "پەیوەندیا بلەز", icon: Phone },
  { id: "inbox", label: "ئاگەهدارکرن", icon: Bell },
  { id: "social", label: "سۆشیال", icon: Instagram },
];

export default function RepairShop() {
  const [tab, setTab] = useState("service");

  // ---- service flow state ----
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState(null);
  const [model, setModel] = useState("");
  const [issue, setIssue] = useState(null);
  const [priceTier, setPriceTier] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [showCustomCity, setShowCustomCity] = useState(false);
  const [cityMode, setCityMode] = useState(null); // null | "zakho" | "other"
  const [showCustomZakhoArea, setShowCustomZakhoArea] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myTicket, setMyTicket] = useState(null);
  const [ticketNo] = useState(() => Math.floor(1000 + Math.random() * 9000));

  // ---- first-visit welcome ----
  const [showWelcome, setShowWelcome] = useState(false);
  useEffect(() => {
    try {
      const seen = localStorage.getItem("repairsite-welcomed");
      if (!seen) setShowWelcome(true);
    } catch (e) {
      // localStorage unavailable, skip the welcome screen silently
    }
  }, []);
  function dismissWelcome() {
    setShowWelcome(false);
    try {
      localStorage.setItem("repairsite-welcomed", "1");
    } catch (e) {
      // ignore
    }
  }

  // ---- inbox state ----
  const [requests, setRequests] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [inboxLoading, setInboxLoading] = useState(true);
  const [inboxError, setInboxError] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});

  // ---- visitor stats ----
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const [liveCount, setLiveCount] = useState(1);
  const [totalVisits, setTotalVisits] = useState(null);

  const price = useMemo(() => (brand && issue ? estimatePrice(brand, issue, model) : null), [brand, issue, model]);
  const brandLabel = BRANDS.find((b) => b.id === brand)?.label;
  const issueLabel = ISSUES.find((i) => i.id === issue)?.label;

  const canNext = (step === 0 && brand) || (step === 1 && model.trim()) || (step === 2 && issue) || step === 3;
  const needsPriceTier = issue === "screen" || issue === "battery";
  const canSubmit = name.trim() && phone.trim() && city.trim() && city.trim() !== "زاخو -" && (!needsPriceTier || priceTier);

  const loadRequests = useCallback(async () => {
    setInboxLoading(true);
    setInboxError(false);
    try {
      const res = await window.storage.get(REQUESTS_KEY, true);
      const list = res ? JSON.parse(res.value) : [];
      setRequests(list);
      setUnseenCount(list.filter((r) => !r.seen).length);
    } catch (e) {
      setRequests([]);
      setUnseenCount(0);
    } finally {
      setInboxLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // total visits: real global counter via CountAPI (works on the live deployed site,
  // since window.storage only exists inside the Claude preview and not on Netlify)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://api.countapi.xyz/hit/repairsite-zakho/total-visits");
        const data = await res.json();
        setTotalVisits(typeof data.value === "number" ? data.value : null);
      } catch (e) {
        setTotalVisits(null);
      }
    })();
  }, []);

  // live viewers: real presence counter via CountAPI (increments when someone
  // opens the site, decrements when they leave) — this actually works cross-visitor
  // on the deployed site, unlike window.storage which only exists in the Claude preview
  useEffect(() => {
    let cancelled = false;
    let joined = false;

    async function join() {
      try {
        const res = await fetch("https://api.countapi.xyz/hit/repairsite-zakho/live-viewers");
        const data = await res.json();
        joined = true;
        if (!cancelled) setLiveCount(Math.max(1, typeof data.value === "number" ? data.value : 1));
      } catch (e) {
        if (!cancelled) setLiveCount(1);
      }
    }

    function leave() {
      if (!joined) return;
      try {
        fetch("https://api.countapi.xyz/update/repairsite-zakho/live-viewers?amount=-1", { keepalive: true });
      } catch (e) {
        // ignore, best effort
      }
      joined = false;
    }

    join();
    window.addEventListener("pagehide", leave);
    window.addEventListener("beforeunload", leave);
    // safety net: in case the tab stays open without firing unload events,
    // drop this viewer from the live count after 10 minutes
    const safetyTimeout = setTimeout(leave, 10 * 60 * 1000);

    return () => {
      cancelled = true;
      clearTimeout(safetyTimeout);
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("beforeunload", leave);
      leave();
    };
  }, []);

  useEffect(() => {
    if (tab === "inbox") {
      (async () => {
        try {
          const res = await window.storage.get(REQUESTS_KEY, true);
          const list = res ? JSON.parse(res.value) : [];
          setRequests(list);
          const anyUnseen = list.some((r) => !r.seen);
          if (anyUnseen) {
            const marked = list.map((r) => ({ ...r, seen: true }));
            await window.storage.set(REQUESTS_KEY, JSON.stringify(marked), true);
            setRequests(marked);
          }
          setUnseenCount(0);
        } catch (e) {
          // ignore
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  function next() {
    if (step < 3) setStep(step + 1);
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }

  async function updateRequest(ticketNo, patch) {
    try {
      const res = await window.storage.get(REQUESTS_KEY, true);
      const list = res ? JSON.parse(res.value) : [];
      const updated = list.map((r) => (r.ticketNo === ticketNo ? { ...r, ...patch } : r));
      await window.storage.set(REQUESTS_KEY, JSON.stringify(updated), true);
      setRequests(updated);
    } catch (e) {
      // ignore
    }
  }

  async function submit() {
    if (!canSubmit) return;
    // open the tab synchronously (tied to the click) so mobile browsers don't block it
    // while we wait for the async geolocation lookup below
    const win = window.open("", "_blank");
    const entry = {
      ticketNo,
      name,
      phone,
      city,
      brandLabel,
      model,
      issueLabel,
      price,
      seen: false,
      status: "pending",
      reply: "",
      createdAt: new Date().toISOString(),
    };
    try {
      const res = await window.storage.get(REQUESTS_KEY, true);
      const list = res ? JSON.parse(res.value) : [];
      const updated = [entry, ...list];
      await window.storage.set(REQUESTS_KEY, JSON.stringify(updated), true);
    } catch (e) {
      // storage failed, still proceed to whatsapp
    }
    const locationLink = await getLocationLink();
    const msg = buildWhatsAppMessage({ ticketNo, brandLabel, model, issueLabel, price, name, phone, city, locationLink });
    const url = `https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(msg)}`;
    if (win) {
      win.location.href = url;
    } else {
      window.open(url, "_blank");
    }
    setMyTicket(ticketNo);
    setSubmitted(true);
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full flex flex-col items-center p-4 md:p-8 pb-28"
      style={{ background: "#14171A", fontFamily: "'Vazirmatn', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .amber-glow { box-shadow: 0 0 0 1px #E8A33D33, 0 0 24px 0 #E8A33D22; }
        .dot { width: 6px; height: 6px; border-radius: 50%; }
      `}</style>

      {showWelcome && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ background: "#14171Aee", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-8 text-center relative overflow-hidden amber-glow"
            style={{ background: "#1E2226", border: "1px solid #2c3136" }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "#E8A33D14", border: "1px solid #E8A33D" }}
            >
              <Wrench size={36} color="#E8A33D" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#EDEAE3" }}>
              بخێرهاتی بۆ ناڤا مالپەڕی
            </h2>
            <p className="text-sm mb-6 leading-6" style={{ color: "#a7ada3" }}>
              خزمەتا چاکرنا مووبایلان ل زاخۆ — ب خێرایی و متمانەیێ ئاریشا مووبایلا خۆ دەستنیشان بکە و نرخێ وێ ببینە.
            </p>
            <button
              onClick={dismissWelcome}
              className="w-full rounded-xl px-5 py-3 text-sm font-semibold transition-all"
              style={{ background: "#E8A33D", color: "#14171A" }}
            >
              دەستپێکرن
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Wrench size={18} color="#E8A33D" />
          <span className="text-xs tracking-[0.2em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8a8f86" }}>
            خزمەتا چاکرنا مووبایلێ
          </span>
        </div>
        <div className="flex gap-2">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{ background: "#1E2226", border: "1px solid #2c3136", color: "#c9cdc6" }}
          >
            <span>👀</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#6B8F71" }}>{liveCount}</span>
            <span style={{ color: "#8a8f86" }}>چاڤدێری نوکە</span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{ background: "#1E2226", border: "1px solid #2c3136", color: "#c9cdc6" }}
          >
            <span>🌏</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#E8A33D" }}>{totalVisits ?? "…"}</span>
            <span style={{ color: "#8a8f86" }}>گشتی سەردانکەران</span>
          </div>
        </div>
      </div>

      {/* SERVICE TAB */}
      {tab === "service" && (
        <div className="w-full max-w-4xl grid md:grid-cols-[1.15fr_0.85fr] gap-6">
          <div className="rounded-2xl p-6 md:p-9" style={{ background: "#1E2226", border: "1px solid #2c3136" }}>
            <h1 className="text-2xl md:text-[28px] font-bold mb-6" style={{ color: "#EDEAE3" }}>
              ئاریشا مۆبایلا خۆ دەستنیشان بکە
            </h1>

            {!submitted ? (
              <>
                <div className="flex items-center gap-2 mb-8">
                  {[0, 1, 2, 3].map((s) => (
                    <div key={s} className="h-1 flex-1 rounded-full transition-all" style={{ background: s <= step ? "#E8A33D" : "#2c3136" }} />
                  ))}
                </div>

                {step === 0 && (
                  <div>
                    <p className="text-sm mb-4" style={{ color: "#a7ada3" }}>جۆرێ مۆبایلێ</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {BRANDS.map((b) => {
                        const active = brand === b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => {
                              setBrand(b.id);
                              setModel("");
                            }}
                            className="relative rounded-xl px-4 py-3 text-sm text-right transition-all"
                            style={{
                              background: active ? "#E8A33D22" : "#181c1f",
                              border: active ? "2px solid #E8A33D" : "1px solid #2c3136",
                              color: active ? "#E8A33D" : "#c9cdc6",
                              fontWeight: active ? 700 : 400,
                              boxShadow: active ? "0 0 0 3px #E8A33D22" : "none",
                            }}
                          >
                            {active && (
                              <span
                                className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: "#E8A33D", color: "#14171A" }}
                              >
                                <Check size={12} strokeWidth={3} />
                              </span>
                            )}
                            {b.id === "iphone" && (
                              <span
                                className="absolute -top-1.5 -right-1.5 px-1 py-[1px] rounded-full text-[7px] font-bold leading-tight"
                                style={{ background: "#14171A", color: "#6B8F71", border: "1px solid #6B8F71" }}
                              >
                                Online
                              </span>
                            )}
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <p className="text-sm mb-4" style={{ color: "#a7ada3" }}>جۆرێ مووبایلێ</p>
                    {brand === "iphone" ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                        {IPHONE_MODELS.map((m) => {
                          const active = model === m;
                          return (
                            <button
                              key={m}
                              onClick={() => setModel(m)}
                              className="relative rounded-lg px-3 py-2.5 text-xs text-right transition-all"
                              style={{
                                background: active ? "#E8A33D22" : "#181c1f",
                                border: active ? "2px solid #E8A33D" : "1px solid #2c3136",
                                color: active ? "#E8A33D" : "#c9cdc6",
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontWeight: active ? 700 : 400,
                                boxShadow: active ? "0 0 0 3px #E8A33D22" : "none",
                              }}
                            >
                              {active && (
                                <span
                                  className="absolute -top-2 -left-2 w-4 h-4 rounded-full flex items-center justify-center"
                                  style={{ background: "#E8A33D", color: "#14171A" }}
                                >
                                  <Check size={10} strokeWidth={3} />
                                </span>
                              )}
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <input
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="ناڤ و مۆدێلێ مووبایلی بنڤیسە"
                        className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                        style={{ background: "#181c1f", border: "1px solid #2c3136", color: "#EDEAE3" }}
                      />
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <p className="text-sm mb-4" style={{ color: "#a7ada3" }}>چ کێماسیەک هەیە؟</p>
                    <div className="grid grid-cols-2 gap-3">
                      {ISSUES.map((it) => {
                        const Icon = it.icon;
                        const active = issue === it.id;
                        return (
                          <button
                            key={it.id}
                            onClick={() => setIssue(it.id)}
                            className="relative rounded-xl px-4 py-4 text-sm flex flex-col items-start gap-3 transition-all"
                            style={{
                              background: active ? "#E8A33D22" : "#181c1f",
                              border: active ? "2px solid #E8A33D" : "1px solid #2c3136",
                              color: active ? "#E8A33D" : "#c9cdc6",
                              fontWeight: active ? 700 : 400,
                              boxShadow: active ? "0 0 0 3px #E8A33D22" : "none",
                            }}
                          >
                            {active && (
                              <span
                                className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: "#E8A33D", color: "#14171A" }}
                              >
                                <Check size={12} strokeWidth={3} />
                              </span>
                            )}
                            {["charge", "water", "sound", "other"].includes(it.id) && (
                              <span
                                className="absolute -top-2 right-2 px-1.5 py-[1px] rounded-full text-[7px] font-bold"
                                style={{ background: "#14171A", color: "#d97757", border: "1px solid #d97757" }}
                              >
                                پێتڤیه بهێنه رەوانه کرن بو جهێ کاری
                              </span>
                            )}
                            <Icon size={18} />
                            <span>{it.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm" style={{ color: "#a7ada3" }}>
                        زانیارییێن خۆ توماربکە
                      </p>
                      {issue === "screen" && (
                        <p className="text-sm" style={{ color: "#E8A33D" }}>
                          جۆرێ شاشێ دەستنیشان بکە.
                        </p>
                      )}
                    </div>
                    {issue === "screen" && price && (
                      <button
                        onClick={() => setPriceTier("screen-normal")}
                        className="relative w-full mt-3 rounded-xl px-4 py-4 flex items-center justify-between text-right transition-all"
                        style={{
                          background: priceTier === "screen-normal" ? "#E8A33D33" : "#E8A33D14",
                          border: priceTier === "screen-normal" ? "2px solid #E8A33D" : "1px solid #E8A33D",
                          boxShadow: priceTier === "screen-normal" ? "0 0 0 3px #E8A33D22" : "none",
                        }}
                      >
                        <span
                          className="absolute -top-2 right-3 px-1.5 py-[1px] rounded-full text-[8px] font-bold"
                          style={{ background: "#14171A", color: "#E8A33D", border: "1px solid #E8A33D" }}
                        >
                          جۆرێ شاشێ - نورمال
                        </span>
                        {priceTier === "screen-normal" && (
                          <span
                            className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "#E8A33D", color: "#14171A" }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                        <span className="text-sm" style={{ color: "#c9cdc6" }}>نرخ</span>
                        <span
                          className="text-lg font-bold"
                          style={{ color: "#E8A33D", fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          {price.low} – {price.high} $
                        </span>
                      </button>
                    )}
                    {issue === "screen" && price && (
                      <button
                        onClick={() => setPriceTier("screen-good")}
                        className="relative w-full mt-3 rounded-xl px-4 py-4 flex items-center justify-between text-right transition-all"
                        style={{
                          background: priceTier === "screen-good" ? "#E8A33D33" : "#E8A33D14",
                          border: priceTier === "screen-good" ? "2px solid #E8A33D" : "1px solid #E8A33D",
                          boxShadow: priceTier === "screen-good" ? "0 0 0 3px #E8A33D22" : "none",
                        }}
                      >
                        <span
                          className="absolute -top-2 right-3 px-1.5 py-[1px] rounded-full text-[8px] font-bold"
                          style={{ background: "#14171A", color: "#E8A33D", border: "1px solid #E8A33D" }}
                        >
                          جۆرێ شاشێ - باش
                        </span>
                        {priceTier === "screen-good" && (
                          <span
                            className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "#E8A33D", color: "#14171A" }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                        <span className="text-sm" style={{ color: "#c9cdc6" }}>نرخ</span>
                        <span
                          className="text-lg font-bold"
                          style={{ color: "#E8A33D", fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          {Math.round(price.low * 1.2)} – {Math.round(price.high * 1.2)} $
                        </span>
                      </button>
                    )}
                    {issue === "screen" && price && (
                      <button
                        onClick={() => setPriceTier("screen-trade-orig")}
                        className="relative w-full mt-3 rounded-xl px-4 py-4 flex items-center justify-between text-right transition-all"
                        style={{
                          background: priceTier === "screen-trade-orig" ? "#E8A33D33" : "#E8A33D14",
                          border: priceTier === "screen-trade-orig" ? "2px solid #E8A33D" : "1px solid #E8A33D",
                          boxShadow: priceTier === "screen-trade-orig" ? "0 0 0 3px #E8A33D22" : "none",
                        }}
                      >
                        <span
                          className="absolute -top-2 right-3 px-1.5 py-[1px] rounded-full text-[8px] font-bold"
                          style={{ background: "#14171A", color: "#E8A33D", border: "1px solid #E8A33D" }}
                        >
                          جۆرێ شاشێ - تجاری ئەسلی
                        </span>
                        {priceTier === "screen-trade-orig" && (
                          <span
                            className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "#E8A33D", color: "#14171A" }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                        <span className="text-sm" style={{ color: "#c9cdc6" }}>نرخ</span>
                        <span
                          className="text-lg font-bold"
                          style={{ color: "#E8A33D", fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          {Math.round(price.low * 0.8)} – {Math.round(price.high * 0.8)} $
                        </span>
                      </button>
                    )}
                    {issue === "screen" && price && (
                      <button
                        onClick={() => setPriceTier("screen-orig-company")}
                        className="relative w-full mt-3 rounded-xl px-4 py-4 flex items-center justify-between text-right transition-all"
                        style={{
                          background: priceTier === "screen-orig-company" ? "#E8A33D33" : "#E8A33D14",
                          border: priceTier === "screen-orig-company" ? "2px solid #E8A33D" : "1px solid #E8A33D",
                          boxShadow: priceTier === "screen-orig-company" ? "0 0 0 3px #E8A33D22" : "none",
                        }}
                      >
                        <span
                          className="absolute -top-2 right-3 px-1.5 py-[1px] rounded-full text-[8px] font-bold"
                          style={{ background: "#14171A", color: "#E8A33D", border: "1px solid #E8A33D" }}
                        >
                          جۆرێ شاشێ - ئەسلی، شرکە
                        </span>
                        {priceTier === "screen-orig-company" && (
                          <span
                            className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "#E8A33D", color: "#14171A" }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                        <span className="text-sm" style={{ color: "#c9cdc6" }}>نرخ</span>
                        <span
                          className="text-lg font-bold"
                          style={{ color: "#E8A33D", fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          {Math.round(price.low * 0.6)} – {Math.round(price.high * 0.6)} $
                        </span>
                      </button>
                    )}
                    {issue === "battery" && price && (
                      <button
                        onClick={() => setPriceTier("battery-normal")}
                        className="relative w-full mt-3 rounded-xl px-4 py-4 flex items-center justify-between text-right transition-all"
                        style={{
                          background: priceTier === "battery-normal" ? "#E8A33D33" : "#E8A33D14",
                          border: priceTier === "battery-normal" ? "2px solid #E8A33D" : "1px solid #E8A33D",
                          boxShadow: priceTier === "battery-normal" ? "0 0 0 3px #E8A33D22" : "none",
                        }}
                      >
                        <span
                          className="absolute -top-2 right-3 px-1.5 py-[1px] rounded-full text-[8px] font-bold"
                          style={{ background: "#14171A", color: "#E8A33D", border: "1px solid #E8A33D" }}
                        >
                          جۆرێ باتریێ - نورمال
                        </span>
                        {priceTier === "battery-normal" && (
                          <span
                            className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "#E8A33D", color: "#14171A" }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                        <span className="text-sm" style={{ color: "#c9cdc6" }}>نرخ</span>
                        <span
                          className="text-lg font-bold"
                          style={{ color: "#E8A33D", fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          {price.low} – {price.high} $
                        </span>
                      </button>
                    )}
                    {issue === "battery" && price && (
                      <button
                        onClick={() => setPriceTier("battery-trade-orig")}
                        className="relative w-full mt-3 rounded-xl px-4 py-4 flex items-center justify-between text-right transition-all"
                        style={{
                          background: priceTier === "battery-trade-orig" ? "#E8A33D33" : "#E8A33D14",
                          border: priceTier === "battery-trade-orig" ? "2px solid #E8A33D" : "1px solid #E8A33D",
                          boxShadow: priceTier === "battery-trade-orig" ? "0 0 0 3px #E8A33D22" : "none",
                        }}
                      >
                        <span
                          className="absolute -top-2 right-3 px-1.5 py-[1px] rounded-full text-[8px] font-bold"
                          style={{ background: "#14171A", color: "#E8A33D", border: "1px solid #E8A33D" }}
                        >
                          جۆرێ باتریێ - تجاری ئەسلی
                        </span>
                        {priceTier === "battery-trade-orig" && (
                          <span
                            className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: "#E8A33D", color: "#14171A" }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                        <span className="text-sm" style={{ color: "#c9cdc6" }}>نرخ</span>
                        <span
                          className="text-lg font-bold"
                          style={{ color: "#E8A33D", fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          {Math.round(price.low * 1.2)} – {Math.round(price.high * 1.2)} $
                        </span>
                      </button>
                    )}
                    <div className="space-y-3">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ناڤێ تە"
                        className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                        style={{ background: "#181c1f", border: "1px solid #2c3136", color: "#EDEAE3" }}
                      />
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="ژمارا تەلەفۆنێ"
                        className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                        style={{ background: "#181c1f", border: "1px solid #2c3136", color: "#EDEAE3", fontFamily: "'IBM Plex Mono', monospace" }}
                      />
                      <div>
                        {cityMode === null && (
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              onClick={() => {
                                setCityMode("zakho");
                                setCity("");
                                setShowCustomZakhoArea(false);
                              }}
                              className="relative rounded-lg px-3 py-2.5 text-xs text-center transition-all"
                              style={{ background: "#181c1f", border: "1px solid #2c3136", color: "#c9cdc6" }}
                            >
                              <span
                                className="absolute -top-2 right-1/2 translate-x-1/2 px-1.5 py-[1px] rounded-full text-[8px] font-bold whitespace-nowrap"
                                style={{ background: "#14171A", color: "#E8A33D", border: "1px solid #E8A33D" }}
                              >
                                تاخێ خۆ هەلبژێرە
                              </span>
                              زاخو
                            </button>
                          </div>
                        )}

                        {cityMode === "zakho" && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs" style={{ color: "#8a8f86" }}>زاخو - شوینێ خۆ هەلبژێرە</span>
                              <button
                                onClick={() => {
                                  setCityMode(null);
                                  setCity("");
                                  setShowCustomZakhoArea(false);
                                }}
                                className="text-xs"
                                style={{ color: "#E8A33D" }}
                              >
                                گۆرین
                              </button>
                            </div>
                            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                              {ZAKHO_AREAS.map((a) => (
                                <button
                                  key={a}
                                  onClick={() => {
                                    setCity(`زاخو - ${a}`);
                                    setShowCustomZakhoArea(false);
                                  }}
                                  className="rounded-lg px-4 py-2.5 text-sm text-right transition-all"
                                  style={{
                                    background: city === `زاخو - ${a}` ? "#E8A33D14" : "#181c1f",
                                    border: city === `زاخو - ${a}` ? "1px solid #E8A33D" : "1px solid #2c3136",
                                    color: city === `زاخو - ${a}` ? "#E8A33D" : "#c9cdc6",
                                  }}
                                >
                                  {a}
                                </button>
                              ))}
                              <button
                                onClick={() => {
                                  setShowCustomZakhoArea(true);
                                  setCity("زاخو - ");
                                }}
                                className="rounded-lg px-4 py-2.5 text-sm text-right transition-all"
                                style={{
                                  background: showCustomZakhoArea ? "#E8A33D14" : "#181c1f",
                                  border: showCustomZakhoArea ? "1px solid #E8A33D" : "1px solid #2c3136",
                                  color: showCustomZakhoArea ? "#E8A33D" : "#c9cdc6",
                                }}
                              >
                                شوینەکا دی
                              </button>
                            </div>
                            {showCustomZakhoArea && (
                              <input
                                value={city.replace(/^زاخو - /, "")}
                                onChange={(e) => setCity(`زاخو - ${e.target.value}`)}
                                placeholder="ناڤێ شوینی بنڤیسە"
                                className="w-full rounded-lg px-4 py-3 text-sm outline-none mt-2"
                                style={{ background: "#181c1f", border: "1px solid #2c3136", color: "#EDEAE3" }}
                              />
                            )}
                          </div>
                        )}

                        {cityMode === "other" && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs" style={{ color: "#8a8f86" }}>شار / ناڤچە</span>
                              <button
                                onClick={() => {
                                  setCityMode(null);
                                  setCity("");
                                  setShowCustomCity(false);
                                }}
                                className="text-xs"
                                style={{ color: "#E8A33D" }}
                              >
                                گۆرین
                              </button>
                            </div>
                            <input
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="شار / ناڤچە بنڤیسە"
                              className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                              style={{ background: "#181c1f", border: "1px solid #2c3136", color: "#EDEAE3" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-8">
                  <button onClick={back} disabled={step === 0} className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg disabled:opacity-30" style={{ color: "#a7ada3" }}>
                    <ArrowRight size={16} /> پاش
                  </button>
                  {step < 3 ? (
                    <button
                      onClick={next}
                      disabled={!canNext}
                      className="flex items-center gap-1 text-sm px-5 py-2.5 rounded-lg font-medium disabled:opacity-30 transition-all"
                      style={{ background: "#E8A33D", color: "#14171A" }}
                    >
                      پێش <ArrowLeft size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={submit}
                      disabled={!canSubmit}
                      className="flex items-center gap-1 text-sm px-5 py-2.5 rounded-lg font-medium disabled:opacity-30 transition-all"
                      style={{ background: "#E8A33D", color: "#14171A" }}
                    >
                      ناردن ب واتساپ <Check size={16} />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-10">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ background: "#E8A33D22", border: "1px solid #E8A33D" }}>
                  <Check size={26} color="#E8A33D" />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "#EDEAE3" }}>
                  پەیامێ واتساپی ڤەکر
                </h2>
                <p className="text-sm max-w-xs" style={{ color: "#a7ada3" }}>
                  ژمارا تیکێتا تە <span style={{ color: "#E8A33D", fontFamily: "'IBM Plex Mono', monospace" }}>#{ticketNo}</span> یە.
                  ئەگەر پەیج نوی نەڤەکریە، دوگمەیا "ناردن" دووبارە پشکنە. پاش ناردنا پەیامی ل واتساپێ، ئەم ب زوی پەیوەندیێ ب تە ڤە دکەین.
                </p>
                <button
                  onClick={() => setTab("inbox")}
                  className="mt-5 text-sm px-5 py-2.5 rounded-lg font-medium transition-all"
                  style={{ background: "#E8A33D14", border: "1px solid #E8A33D", color: "#E8A33D" }}
                >
                  داخازیا خۆ ل سەر سایتی ببینە
                </button>
              </div>
            )}
          </div>

          {/* live ticket */}
          <div className="rounded-2xl p-6 relative overflow-hidden amber-glow" style={{ background: "#181c1f", border: "1px solid #2c3136" }}>
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] tracking-widest uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8a8f86" }}>
                تیکێتا چاکرنێ
              </span>
              <span className="flex items-center gap-1.5">
                <span className="dot" style={{ background: submitted ? "#6B8F71" : "#E8A33D" }} />
                <span className="text-[11px]" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8a8f86" }}>
                  {submitted ? "پەسندکری" : "چاڤەڕوانی"}
                </span>
              </span>
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[28px] mb-4">
              <span style={{ color: "#E8A33D" }}>#{ticketNo}</span>
            </div>
            <div className="space-y-1">
              <TicketLine label="مارکا" value={brandLabel} filled={!!brand} />
              <TicketLine label="مۆدێل" value={model} filled={!!model} />
              <TicketLine label="کێماسی" value={issueLabel} filled={!!issue} />
              <TicketLine label="نرخێ تخمینی" value={price ? `${price.low} – ${price.high} $` : null} filled={!!price} />
              <TicketLine label="ناڤ" value={name} filled={!!name} />
              <TicketLine label="تەلەفۆن" value={phone} filled={!!phone} />
              <TicketLine label="شار" value={city} filled={!!city} />
            </div>
            <p className="text-[11px] mt-6 leading-5" style={{ color: "#6d726a" }}>
              نرخێ لسەرخۆ تخمینیە، پشتی پشکنینا مووبایلێ نرخێ دویماهیک دیار دبیت.
            </p>
          </div>
        </div>
      )}

      {/* QUICK CONTACT TAB */}
      {tab === "contact" && (
        <div className="w-full max-w-4xl grid sm:grid-cols-2 gap-4">
          <a
            href={`tel:${SHOP_PHONE}`}
            className="rounded-2xl p-6 flex items-center gap-4 transition-all hover:border-[#E8A33D]"
            style={{ background: "#1E2226", border: "1px solid #2c3136" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E8A33D14" }}>
              <Phone size={20} color="#E8A33D" />
            </div>
            <div>
              <div className="text-sm mb-1" style={{ color: "#8a8f86" }}>پەیوەندی</div>
              <div className="text-base font-semibold" style={{ color: "#EDEAE3", fontFamily: "'IBM Plex Mono', monospace" }}>{SHOP_PHONE}</div>
            </div>
          </a>

          <a
            href={`https://wa.me/${SHOP_WHATSAPP}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl p-6 flex items-center gap-4 transition-all hover:border-[#E8A33D]"
            style={{ background: "#1E2226", border: "1px solid #2c3136" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E8A33D14" }}>
              <MessageCircle size={20} color="#E8A33D" />
            </div>
            <div>
              <div className="text-sm mb-1" style={{ color: "#8a8f86" }}>واتساپ</div>
              <div className="text-base font-semibold" style={{ color: "#EDEAE3", fontFamily: "'IBM Plex Mono', monospace" }}>{SHOP_PHONE}</div>
            </div>
          </a>

          <div className="rounded-2xl p-6 flex items-center gap-4" style={{ background: "#1E2226", border: "1px solid #2c3136" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E8A33D14" }}>
              <Clock size={20} color="#E8A33D" />
            </div>
            <div>
              <div className="text-sm mb-1" style={{ color: "#8a8f86" }}>کاتێن کارکرنێ</div>
              <div className="text-base" style={{ color: "#EDEAE3" }}>هەمی رۆژان ٩:٠٠ – ٩:٠٠</div>
            </div>
          </div>

          <div className="rounded-2xl p-6 flex items-center gap-4" style={{ background: "#1E2226", border: "1px solid #2c3136" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E8A33D14" }}>
              <MapPin size={20} color="#E8A33D" />
            </div>
            <div>
              <div className="text-sm mb-1" style={{ color: "#8a8f86" }}>شوین</div>
              <div className="text-base" style={{ color: "#EDEAE3" }}>ناڤچا خۆ ل ڤێرێ زیاد بکە</div>
            </div>
          </div>
        </div>
      )}

      {/* INBOX TAB */}
      {tab === "inbox" && (
        <div className="w-full max-w-4xl rounded-2xl p-6 md:p-8" style={{ background: "#1E2226", border: "1px solid #2c3136" }}>
          <h2 className="text-xl font-bold mb-1" style={{ color: "#EDEAE3" }}>ئاگەهدارکرنێن نوی</h2>
          <p className="text-sm mb-6" style={{ color: "#8a8f86" }}>هەمی داواکارییێن ژ ماڵپەڕی هاتینە ناردن ل ڤێرێ دیارن.</p>

          {inboxLoading && <p className="text-sm" style={{ color: "#8a8f86" }}>د بارکرنێ دایە...</p>}

          {!inboxLoading && requests.length === 0 && (
            <p className="text-sm" style={{ color: "#6d726a" }}>هێشتا هیچ داواکارییەک نەهاتییە.</p>
          )}

          <div className="space-y-3">
            {requests.map((r) => (
              <div
                key={r.ticketNo + r.createdAt}
                className="rounded-xl p-4"
                style={{
                  background: "#181c1f",
                  border: r.ticketNo === myTicket ? "1px solid #6B8F71" : r.seen ? "1px solid #2c3136" : "1px solid #E8A33D",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#E8A33D" }}>#{r.ticketNo}</span>
                  {r.ticketNo === myTicket ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#6B8F7122", color: "#6B8F71" }}>داخازیا تە</span>
                  ) : !r.seen ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#E8A33D22", color: "#E8A33D" }}>نوی</span>
                  ) : null}
                </div>
                <div className="text-sm" style={{ color: "#EDEAE3" }}>{r.name} — {r.phone}</div>
                <div className="text-xs mt-1" style={{ color: "#8a8f86" }}>{r.brandLabel}{r.model ? ` · ${r.model}` : ""} · {r.issueLabel}{r.city ? ` · ${r.city}` : ""}</div>
                {r.price && (
                  <div className="text-xs mt-1" style={{ color: "#6B8F71", fontFamily: "'IBM Plex Mono', monospace" }}>
                    {r.price.low} – {r.price.high} $
                  </div>
                )}

                {r.status === "accepted" && (
                  <div className="text-[11px] mt-2 inline-block px-2 py-0.5 rounded-full" style={{ background: "#6B8F7122", color: "#6B8F71" }}>
                    پەسندکری
                  </div>
                )}
                {r.status === "rejected" && (
                  <div className="text-[11px] mt-2 inline-block px-2 py-0.5 rounded-full" style={{ background: "#c2555522", color: "#d97757" }}>
                    ڕەتکری
                  </div>
                )}

                {r.reply && (
                  <div className="text-xs mt-2 rounded-lg p-2" style={{ background: "#14171A", color: "#c9cdc6", border: "1px solid #2c3136" }}>
                    <span style={{ color: "#8a8f86" }}>وەڵام: </span>{r.reply}
                  </div>
                )}

                {r.ticketNo !== myTicket && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateRequest(r.ticketNo, { status: "accepted" })}
                        className="flex-1 text-xs px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: r.status === "accepted" ? "#6B8F71" : "#6B8F7114", color: r.status === "accepted" ? "#14171A" : "#6B8F71", border: "1px solid #6B8F71" }}
                      >
                        پەسندکرن
                      </button>
                      <button
                        onClick={() => updateRequest(r.ticketNo, { status: "rejected" })}
                        className="flex-1 text-xs px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: r.status === "rejected" ? "#d97757" : "#d9775714", color: r.status === "rejected" ? "#14171A" : "#d97757", border: "1px solid #d97757" }}
                      >
                        ڕەتکرن
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={replyDrafts[r.ticketNo] ?? r.reply ?? ""}
                        onChange={(e) => setReplyDrafts((d) => ({ ...d, [r.ticketNo]: e.target.value }))}
                        placeholder="وەڵامەکێ بنڤیسە بۆ میوانی"
                        className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-none"
                        style={{ background: "#14171A", border: "1px solid #2c3136", color: "#EDEAE3" }}
                      />
                      <button
                        onClick={() => updateRequest(r.ticketNo, { reply: replyDrafts[r.ticketNo] ?? r.reply ?? "" })}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={{ background: "#E8A33D", color: "#14171A" }}
                      >
                        ناردن
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SOCIAL TAB */}
      {tab === "social" && (
        <div className="w-full max-w-4xl grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => openApp(INSTAGRAM_APP_URL, INSTAGRAM_URL)}
            className="rounded-2xl p-6 flex items-center gap-4 text-right transition-all hover:border-[#E8A33D] w-full"
            style={{ background: "#1E2226", border: "1px solid #2c3136" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E8A33D14" }}>
              <Instagram size={20} color="#E8A33D" />
            </div>
            <div>
              <div className="text-sm mb-1" style={{ color: "#8a8f86" }}>ئینستاگرام</div>
              <div className="text-base font-semibold" style={{ color: "#EDEAE3", fontFamily: "'IBM Plex Mono', monospace" }}>@{INSTAGRAM_HANDLE}</div>
            </div>
          </button>

          <button
            onClick={() => openApp(SNAPCHAT_APP_URL, SNAPCHAT_URL)}
            className="rounded-2xl p-6 flex items-center gap-4 text-right transition-all hover:border-[#E8A33D] w-full"
            style={{ background: "#1E2226", border: "1px solid #2c3136" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E8A33D14" }}>
              <Ghost size={20} color="#E8A33D" />
            </div>
            <div>
              <div className="text-sm mb-1" style={{ color: "#8a8f86" }}>سناب چات</div>
              <div className="text-base font-semibold" style={{ color: "#EDEAE3", fontFamily: "'IBM Plex Mono', monospace" }}>@{SNAPCHAT_HANDLE}</div>
            </div>
          </button>

          <a
            href={`https://wa.me/message/CLRUY536HPHPN1?text=${encodeURIComponent("سلاو، ئەز ژ ماڵپەڕی هاتیم")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl p-6 flex items-center gap-4 text-right transition-all hover:border-[#E8A33D] w-full"
            style={{ background: "#1E2226", border: "1px solid #2c3136" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E8A33D14" }}>
              <MessageCircle size={20} color="#E8A33D" />
            </div>
            <div>
              <div className="text-sm mb-1" style={{ color: "#8a8f86" }}>واتسئاپ</div>
              <div className="text-base font-semibold" style={{ color: "#EDEAE3", fontFamily: "'IBM Plex Mono', monospace" }}>salimzaki</div>
            </div>
          </a>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center z-50"
        style={{ background: "#1a1e21", borderTop: "1px solid #2c3136" }}
      >
        <div className="w-full max-w-4xl flex px-2 py-2 gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="relative flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-[11px] transition-all"
                style={{
                  background: active ? "#E8A33D14" : "transparent",
                  color: active ? "#E8A33D" : "#8a8f86",
                }}
              >
                <Icon size={18} />
                {t.label}
                {t.id === "inbox" && unseenCount > 0 && (
                  <span
                    className="absolute top-0 left-1/2 translate-x-3 rounded-full text-[10px] w-4 h-4 flex items-center justify-center"
                    style={{ background: "#E8A33D", color: "#14171A", fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {unseenCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
