const WHATSAPP_NUMBER = "6285861783384";
const menu = [
  {
    id: "kentang_goreng",
    name: "Kentang Goreng",
    price: 10000,
    img: "assets/kentang_goreng.png",
  },
  {
    id: "sosis_goreng",
    name: "Sosis Goreng",
    price: 10000,
    img: "assets/sosis_goreng.png",
  },
  {
    id: "spageti",
    name: "Spageti",
    price: 15000,
    img: "assets/spageti.png",
  },
  {
    id: "kentang_sosis",
    name: "Kentang + Sosis",
    price: 18000,
    img: "assets/kentang_sosis.png",
  },
  {
    id: "spageti_sosis",
    name: "Spageti + Sosis",
    price: 20000,
    img: "assets/spageti_sosis.png",
  },
];
const cart = new Map();
const fIDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
});
const elMenuList = document.getElementById("menu-list");
const elCartEmpty = document.getElementById("cart-empty");
const elCartItems = document.getElementById("cart-items");
const elCartTotal = document.getElementById("cart-total");
const elName = document.getElementById("customer-name");
const elNote = document.getElementById("customer-note");
const elWa = document.getElementById("wa-button");
const elNameErr = document.getElementById("name-error");
function renderMenu() {
  elMenuList.innerHTML = "";
  for (const item of menu) {
    const card = document.createElement("div");
    card.className = "menu-card";
    const img = document.createElement("img");
    img.className = "menu-img";
    img.src = item.img;
    img.alt = item.name;
    img.loading = "lazy";
    const t = document.createElement("div");
    t.className = "menu-title";
    t.textContent = item.name;
    const p = document.createElement("div");
    p.className = "menu-price";
    p.textContent = fIDR.format(item.price);
    const step = document.createElement("div");
    step.className = "stepper";
    const btnMinus = document.createElement("button");
    btnMinus.className = "btn btn-danger";
    btnMinus.textContent = "–";
    btnMinus.onclick = () => updateQty(item.id, -1);
    const btnPlus = document.createElement("button");
    btnPlus.className = "btn";
    btnPlus.textContent = "+";
    btnPlus.onclick = () => updateQty(item.id, +1);
    step.append(btnMinus, btnPlus);
    card.append(img, t, p, step);
    elMenuList.append(card);
  }
}
function updateQty(id, delta) {
  const curr = cart.get(id) || 0;
  const next = Math.max(0, curr + delta);
  if (next === 0) cart.delete(id);
  else cart.set(id, next);
  renderCart();
}
function renderCart() {
  const items = [...cart.entries()];
  const rows = items.map(([id, qty]) => {
    const item = menu.find((m) => m.id === id);
    const li = document.createElement("li");
    li.className = "cart-item";
    const left = document.createElement("div");
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = item.name;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${qty} × ${fIDR.format(item.price)}`;
    left.append(name, meta);
    const right = document.createElement("div");
    const minus = document.createElement("button");
    minus.className = "btn btn-danger";
    minus.textContent = "–";
    minus.onclick = () => updateQty(id, -1);
    const plus = document.createElement("button");
    plus.className = "btn";
    plus.textContent = "+";
    plus.onclick = () => updateQty(id, +1);
    right.append(minus, plus);
    li.append(left, right);
    return li;
  });
  elCartItems.innerHTML = "";
  for (const r of rows) elCartItems.append(r);
  const total = items.reduce(
    (acc, [id, qty]) => acc + menu.find((m) => m.id === id).price * qty,
    0
  );
  elCartTotal.textContent = fIDR.format(total);
  elCartEmpty.style.display = items.length ? "none" : "block";
  const nameEmpty = elName.value.trim().length === 0;
  if (nameEmpty) {
    elName.classList.add("input-error");
    if (elNameErr) elNameErr.style.display = "block";
  } else {
    elName.classList.remove("input-error");
    if (elNameErr) elNameErr.style.display = "none";
  }
  const btnEnabled = items.length > 0 && !nameEmpty;
  elWa.disabled = !btnEnabled;
}
function composeMessage() {
  const lines = [];
  lines.push("Halo, saya ingin memesan:");
  for (const [id, qty] of cart.entries()) {
    const item = menu.find((m) => m.id === id);
    const sub = item.price * qty;
    lines.push(`- ${item.name} x${qty} = ${fIDR.format(sub)}`);
  }
  const total = [...cart.entries()].reduce(
    (acc, [id, qty]) => acc + menu.find((m) => m.id === id).price * qty,
    0
  );
  lines.push(`Total: ${fIDR.format(total)}`);
  lines.push(`Nama: ${elName.value.trim()}`);
  if (elNote.value.trim()) lines.push(`Catatan: ${elNote.value.trim()}`);
  return lines.join("\n");
}
function openWhatsApp() {
  if (elName.value.trim().length === 0) {
    elName.setCustomValidity("Nama wajib diisi");
    elName.reportValidity();
    elName.focus();
    return;
  }
  const msg = encodeURIComponent(composeMessage());
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  window.open(url, "_blank");
}
elName.addEventListener("input", () => {
  elName.setCustomValidity("");
  renderCart();
});
elNote.addEventListener("input", renderCart);
elWa.addEventListener("click", openWhatsApp);
renderMenu();
renderCart();
