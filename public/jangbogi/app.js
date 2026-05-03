// SUPABASE_URL, SUPABASE_KEY — config.js에서 로드
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── State ──
let categories = [];
let items = [];
let shoppingItems = [];
let selectedIds = new Set();
let currentTab = "inventory";
const scrollPositions = {};
const pendingCompletions = new Map();
const CACHE_KEY = "jangbogi_frozen_snapshot";

// ── DOM refs ──
const $tabs = document.querySelectorAll(".tab");
const $inventoryList = document.getElementById("inventory-list");
const $shoppingList = document.getElementById("shopping-list");
const $addBar = document.getElementById("add-bar");
const $selectedCount = document.getElementById("selected-count");
const $searchInput = document.getElementById("search-inventory");
const $clearBtn = document.getElementById("btn-clear-search");
const $toast = document.getElementById("toast");
const $loading = document.getElementById("loading");

// ── Init ──
let initialized = false;
async function init() {
  if (initialized) return;
  initialized = true;
  setupTabs();
  setupSearch();
  setupButtons();
  await loadData();
  renderInventory();
}

// ── Tabs ──
function setupTabs() {
  $tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const alreadyActive = tab.classList.contains("active");

      if (alreadyActive) {
        document
          .getElementById("tab-" + tab.dataset.tab)
          .scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      scrollPositions[currentTab] = window.scrollY;

      $tabs.forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      const nextEl = document.getElementById("tab-" + tab.dataset.tab);
      nextEl.classList.add("active");

      currentTab = tab.dataset.tab;
      const showSearch =
        currentTab === "inventory" || currentTab === "shopping";
      document
        .querySelector(".search-bar")
        .classList.toggle("hidden", !showSearch);
      clearSearchInput();
      if (currentTab !== "inventory") {
        selectedIds.clear();
        updateAddBar();
      }

      if (currentTab === "shopping") loadShopping();
      else if (currentTab === "inventory") renderInventory();

      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositions[currentTab] ?? 0);
      });
    });
  });
}

// ── Search ──
function setupSearch() {
  $searchInput.addEventListener("input", () => {
    $clearBtn.classList.toggle("hidden", $searchInput.value === "");
    if (currentTab === "shopping") renderShopping();
    else renderInventory();
  });
  $clearBtn.addEventListener("click", () => {
    clearSearchInput();
    $searchInput.focus();
    if (currentTab === "shopping") renderShopping();
    else renderInventory();
  });
}

// ── Buttons ──
function setupButtons() {
  document
    .getElementById("btn-add-to-shopping")
    .addEventListener("click", addToShopping);
  document
    .getElementById("btn-delete-selected")
    .addEventListener("click", deleteSelected);
  document
    .getElementById("btn-clear-completed")
    .addEventListener("click", clearCompleted);
  const $catName = document.getElementById("new-cat-name");
  const $addCat = document.getElementById("btn-add-cat");
  $catName.addEventListener("input", () => {
    $addCat.disabled = !$catName.value.trim();
  });
  $addCat.addEventListener("click", addNewCategory);
  document
    .getElementById("btn-set-storage")
    .addEventListener("click", setStorageSelected);
}

// ── Data loading ──
async function loadData() {
  showLoading(true);
  clearSessionCache();
  const [catRes, itemRes, shopRes] = await Promise.all([
    sb
      .from("jangbogi_categories")
      .select("*")
      .order("sort_order", { ascending: true }),
    sb.from("jangbogi_items").select("*").order("name", { ascending: true }),
    sb
      .from("jangbogi_shopping")
      .select("*, jangbogi_items(name, category_id, storage_type)")
      .order("added_at", { ascending: true }),
  ]);
  categories = catRes.data || [];
  items = itemRes.data || [];
  shoppingItems = hydrateShoppingRows(shopRes.data || []);
  sortLocalData();
  saveSessionCache();
  showLoading(false);
}

async function loadShopping() {
  loadSessionCache();
  shoppingItems = hydrateShoppingRows(shoppingItems);
  sortShoppingItems();
  renderShopping();
}

function clearSessionCache() {
  sessionStorage.removeItem(CACHE_KEY);
}

function loadSessionCache() {
  const raw = sessionStorage.getItem(CACHE_KEY);
  if (!raw) return;

  try {
    const snapshot = JSON.parse(raw);
    categories = snapshot.categories || [];
    items = snapshot.items || [];
    shoppingItems = snapshot.shoppingItems || [];
  } catch (error) {
    console.error("장보기 캐시를 읽는 데 실패했습니다", error);
  }
}

function saveSessionCache() {
  sessionStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ categories, items, shoppingItems }),
  );
}

function sortLocalData() {
  categories.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  items.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  sortShoppingItems();
}

function sortShoppingItems() {
  shoppingItems.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (
      new Date(a.added_at || 0).getTime() -
      new Date(b.added_at || 0).getTime()
    );
  });
}

function hydrateShoppingRows(rows) {
  return rows.map(hydrateShoppingRow);
}

function hydrateShoppingRow(row) {
  const item = items.find((candidate) => candidate.id === row.item_id);
  return {
    ...row,
    jangbogi_items: item
      ? {
          name: item.name,
          category_id: item.category_id,
          storage_type: item.storage_type,
        }
      : row.jangbogi_items,
  };
}

function createId() {
  return crypto.randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeCategoryId(categoryId) {
  const category = categories.find(
    (cat) => String(cat.id) === String(categoryId),
  );
  return category ? category.id : categoryId;
}

function findItemByNameAndCategory(name, categoryId) {
  const normalized = normalizeCategoryId(categoryId);
  return items.find(
    (item) =>
      item.name === name && String(item.category_id) === String(normalized),
  );
}

function createLocalItem(name, categoryId) {
  const now = nowIso();
  return {
    id: createId(),
    name,
    category_id: normalizeCategoryId(categoryId),
    storage_type: "실온",
    created_at: now,
    updated_at: now,
  };
}

function createLocalShoppingRow(itemId) {
  return hydrateShoppingRow({
    id: createId(),
    item_id: itemId,
    custom_name: null,
    completed: false,
    completed_at: null,
    added_at: nowIso(),
  });
}

function addShoppingRows(itemIds) {
  const activeIds = new Set(
    shoppingItems
      .filter((shopping) => !shopping.completed)
      .map((shopping) => shopping.item_id),
  );
  const nextRows = [];

  for (const itemId of itemIds) {
    if (activeIds.has(itemId)) continue;
    activeIds.add(itemId);
    nextRows.push(createLocalShoppingRow(itemId));
  }

  shoppingItems = hydrateShoppingRows([...shoppingItems, ...nextRows]);
  sortShoppingItems();
  saveSessionCache();
  return nextRows.length;
}

function removeItemsById(ids) {
  const idSet = new Set(ids);
  items = items.filter((item) => !idSet.has(item.id));
  shoppingItems = shoppingItems.filter(
    (shopping) => !idSet.has(shopping.item_id),
  );
  saveSessionCache();
}

// ── Render: Inventory ──
function renderInventory() {
  const query = $searchInput.value.trim();
  const shoppingItemIds = new Set(
    shoppingItems.filter((s) => !s.completed).map((s) => s.item_id),
  );

  $inventoryList.innerHTML = "";

  let totalMatches = 0;
  for (const cat of categories) {
    let catItems = items.filter((i) => String(i.category_id) === String(cat.id));
    if (query) {
      catItems = catItems.filter((i) => i.name.includes(query));
    }
    totalMatches += catItems.length;
    if (catItems.length === 0) continue;

    const group = document.createElement("div");
    group.className = "category-group";
    group.innerHTML = `
      <div class="category-header">
        <div class="left">
          <h2>${cat.name}</h2>
          <span class="count">${catItems.length}개</span>
        </div>
        <span class="chevron">&#9660;</span>
      </div>
      <div class="card-list"></div>
    `;

    const header = group.querySelector(".category-header");
    header.addEventListener("click", () => group.classList.toggle("collapsed"));

    const itemsContainer = group.querySelector(".card-list");
    for (const item of catItems) {
      const inShopping = shoppingItemIds.has(item.id);
      const isSelected = selectedIds.has(item.id);
      const row = document.createElement("div");
      row.className =
        "item-row" +
        (isSelected ? " selected" : "") +
        (inShopping ? " in-shopping" : "");
      row.innerHTML = `
        <div class="item-checkbox"></div>
        <span class="item-name"${inShopping ? ' data-badge="장보기"' : ""}>${item.name}</span>
        ${item.storage_type && item.storage_type !== "실온" ? `<span class="storage-badge storage-${item.storage_type}">${item.storage_type}</span>` : ""}
        <button class="btn-edit-item" title="이름 수정">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"/>
          </svg>
        </button>
      `;

      row.querySelector(".btn-edit-item").addEventListener("click", (e) => {
        e.stopPropagation();
        showItemInfo(item);
      });

      if (!inShopping) {
        row.addEventListener("click", () => toggleSelect(item.id));
      }

      itemsContainer.appendChild(row);
    }

    $inventoryList.appendChild(group);
  }

  if (query && totalMatches === 0) {
    const el = document.createElement("div");
    el.className = "quick-add-prompt";
    el.innerHTML = `<p>"<strong>${query}</strong>" 검색 결과 없음</p>`;

    const directBtn = document.createElement("button");
    directBtn.className = "btn-direct-add";
    directBtn.textContent = `"${query}" 새 항목 추가`;
    directBtn.addEventListener("click", () =>
      pickCategory(query, async (categoryId) => {
        showLoading(true);

        const existing = findItemByNameAndCategory(query, categoryId);

        if (existing) {
          showLoading(false);
          showToast("이미 존재하는 항목입니다");
          return;
        }

        items = [...items, createLocalItem(query, categoryId)];
        sortLocalData();
        saveSessionCache();
        showLoading(false);
        showToast(`"${query}" 추가됨`);
        clearSearchInput();
        renderInventory();
      }),
    );
    el.appendChild(directBtn);
    $inventoryList.appendChild(el);
  }
}

function toggleSelect(itemId) {
  if (selectedIds.has(itemId)) {
    selectedIds.delete(itemId);
  } else {
    selectedIds.add(itemId);
  }
  updateAddBar();
  renderInventory();
}

function updateAddBar() {
  if (selectedIds.size > 0) {
    $addBar.classList.remove("hidden");
    $selectedCount.textContent = `${selectedIds.size}개 선택`;
  } else {
    $addBar.classList.add("hidden");
  }
}

// ── Render: Shopping ──
function renderShopping() {
  const completedCount = shoppingItems.filter((s) => s.completed).length;
  const actionsEl = document.getElementById("shopping-actions");
  actionsEl.classList.toggle("hidden", completedCount === 0);
  const countEl = document.getElementById("completed-count");
  countEl.textContent = `완료 ${completedCount}개`;
  countEl.onclick = () =>
    document
      .querySelector(".shopping-completed-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  if (shoppingItems.length === 0) {
    $shoppingList.innerHTML =
      '<div class="shopping-empty">장보기 목록이 비어있습니다.<br>재고 탭에서 항목을 추가하세요.</div>';
    return;
  }

  const query = currentTab === "shopping" ? $searchInput.value.trim() : "";
  const visible = query
    ? shoppingItems.filter((s) => shoppingItemName(s).includes(query))
    : shoppingItems;

  if (visible.length === 0) {
    renderShoppingNoResults(query);
    return;
  }

  $shoppingList.innerHTML = "";

  const incomplete = visible.filter((s) => !s.completed);
  const completed = visible.filter((s) => s.completed);

  if (incomplete.length > 0) {
    const catGroups = new Map();
    const nocat = [];

    for (const s of incomplete) {
      const catId = s.jangbogi_items?.category_id;
      if (catId != null) {
        if (!catGroups.has(catId)) catGroups.set(catId, []);
        catGroups.get(catId).push(s);
      } else {
        nocat.push(s);
      }
    }

    for (const cat of categories) {
      const groupItems = catGroups.get(cat.id);
      if (!groupItems || groupItems.length === 0) continue;
      $shoppingList.appendChild(
        renderShoppingCategoryGroup(cat.name, groupItems),
      );
    }

    if (nocat.length > 0) {
      $shoppingList.appendChild(renderShoppingCategoryGroup("기타", nocat));
    }
  }

  if (completed.length > 0) {
    $shoppingList.appendChild(renderShoppingCompletedGroup(completed));
  }
}

function renderShoppingCategoryGroup(catName, groupItems) {
  const section = document.createElement("div");
  section.className = "category-group";
  section.innerHTML = `
    <div class="category-header">
      <div class="left">
        <h2>${catName}</h2>
        <span class="count">${groupItems.length}개</span>
      </div>
    </div>
  `;

  const list = document.createElement("div");
  list.className = "card-list";

  const sorted = [...groupItems].sort((a, b) =>
    shoppingItemName(a).localeCompare(shoppingItemName(b), "ko"),
  );

  for (const s of sorted) {
    const isPending = pendingCompletions.has(s.id);
    const row = document.createElement("div");
    row.className = "item-row" + (isPending ? " pending" : "");
    const storage = s.jangbogi_items?.storage_type;
    row.innerHTML = `
      <div class="shopping-check"></div>
      <span class="shopping-item-name">${shoppingItemName(s)}</span>
      ${storage && storage !== "실온" ? `<span class="storage-badge storage-${storage}">${storage}</span>` : ""}
    `;
    row.addEventListener("click", () => toggleShoppingComplete(s));
    list.appendChild(row);
  }

  section.appendChild(list);
  return section;
}

function renderShoppingCompletedGroup(completedItems) {
  const section = document.createElement("div");
  section.className = "shopping-completed-section";
  section.innerHTML = `<h3>완료 (${completedItems.length})</h3>`;

  const list = document.createElement("div");
  list.className = "card-list";

  const catMap = {};
  for (const cat of categories) catMap[cat.id] = cat.name;

  for (const s of completedItems) {
    const catId = s.jangbogi_items?.category_id;
    const catName = catId ? catMap[catId] : "";

    const row = document.createElement("div");
    row.className = "item-row completed";
    const storage = s.jangbogi_items?.storage_type;
    row.innerHTML = `
      <div class="shopping-check"></div>
      <span class="shopping-item-name">${shoppingItemName(s)}</span>
      ${storage && storage !== "실온" ? `<span class="storage-badge storage-${storage}">${storage}</span>` : ""}
      <span class="shopping-item-cat">${catName}</span>
    `;
    row.addEventListener("click", () => toggleShoppingComplete(s));
    list.appendChild(row);
  }

  section.appendChild(list);
  return section;
}

function renderShoppingNoResults(query) {
  const activeShoppingIds = new Set(
    shoppingItems.filter((s) => !s.completed).map((s) => s.item_id),
  );
  const matchingInventory = items.filter(
    (item) => item.name.includes(query) && !activeShoppingIds.has(item.id),
  );

  const el = document.createElement("div");
  el.className = "quick-add-prompt";

  const p = document.createElement("p");
  p.innerHTML = `"<strong>${query}</strong>" 검색 결과 없음`;
  el.appendChild(p);

  if (matchingInventory.length > 0) {
    const section = document.createElement("div");
    section.className = "shopping-match-section";
    const label = document.createElement("div");
    label.className = "shopping-match-label";
    label.textContent = "재고에서 추가";
    section.appendChild(label);

    const list = document.createElement("div");
    list.className = "card-list shopping-match-list";
    for (const item of matchingInventory) {
      const cat = categories.find(
        (c) => String(c.id) === String(item.category_id),
      );
      const row = document.createElement("div");
      row.className = "item-row";
      row.style.padding = "8px 4px";
      row.innerHTML = `
        <span class="item-name"${cat ? ` data-badge="${cat.name}"` : ""}>${item.name}</span>
        <button class="btn-quick-add-shopping">＋</button>
      `;
      row
        .querySelector(".btn-quick-add-shopping")
        .addEventListener("click", async (e) => {
          e.stopPropagation();
          showLoading(true);
          const addedCount = addShoppingRows([item.id]);
          showLoading(false);
          showToast(
            addedCount > 0
              ? `"${item.name}" 추가됨`
              : "이미 장보기 목록에 있습니다",
          );
          clearSearchInput();
          await loadShopping();
        });
      list.appendChild(row);
    }
    section.appendChild(list);
    el.appendChild(section);
  }

  const directBtn = document.createElement("button");
  directBtn.className = "btn-direct-add";
  directBtn.textContent = `"${query}" 직접 추가`;
  directBtn.addEventListener("click", () =>
    pickCategory(query, async (categoryId) => {
      showLoading(true);

      // 동일 이름+카테고리 항목 조회, 없으면 insert
      let itemId;
      const existing = findItemByNameAndCategory(query, categoryId);

      if (existing) {
        itemId = existing.id;
      } else {
        const inserted = createLocalItem(query, categoryId);
        items = [...items, inserted];
        sortLocalData();
        itemId = inserted.id;
      }

      const addedCount = addShoppingRows([itemId]);

      showLoading(false);

      showToast(
        addedCount > 0 ? `"${query}" 추가됨` : "이미 장보기 목록에 있습니다",
      );
      clearSearchInput();
      await loadShopping();
    }),
  );
  el.appendChild(directBtn);

  $shoppingList.innerHTML = "";
  $shoppingList.appendChild(el);
}

// ── Actions ──
async function deleteSelected() {
  if (selectedIds.size === 0) return;
  const count = selectedIds.size;
  const overlay = showOverlay(`
    <p>${count}개 항목을 재고에서 삭제하시겠습니까?</p>
    <div class="btn-row">
      <button class="btn-cancel">취소</button>
      <button class="btn-delete">삭제</button>
    </div>
  `);
  overlay.querySelector(".btn-delete").addEventListener("click", async () => {
    overlay.remove();
    showLoading(true);
    const ids = [...selectedIds];
    removeItemsById(ids);
    showLoading(false);
    showToast(`${count}개 항목 삭제됨`);
    selectedIds.clear();
    updateAddBar();
    renderInventory();
  });
}

async function addToShopping() {
  if (selectedIds.size === 0) return;
  showLoading(true);
  const addedCount = addShoppingRows([...selectedIds]);
  showLoading(false);

  showToast(`${addedCount}개 항목 추가됨`);
  selectedIds.clear();
  updateAddBar();
  renderInventory();
}

function setStorageSelected() {
  if (selectedIds.size === 0) return;
  const STORAGE_TYPES = ["실온", "냉장", "냉동"];
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal">
    <p style="font-weight:700;margin-bottom:12px">보관 방법 설정</p>
    <div class="storage-picker">
      ${STORAGE_TYPES.map((t) => `<button class="storage-pick-btn storage-${t}" data-type="${t}">${t}</button>`).join("")}
    </div>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn-cancel">취소</button>
    </div>
  </div>`;
  overlay
    .querySelector(".btn-cancel")
    .addEventListener("click", () => overlay.remove());
  overlay.querySelectorAll(".storage-pick-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const storageType = btn.dataset.type;
      overlay.remove();
      showLoading(true);
      const now = nowIso();
      const ids = new Set(selectedIds);
      items = items.map((item) =>
        ids.has(item.id)
          ? { ...item, storage_type: storageType, updated_at: now }
          : item,
      );
      shoppingItems = hydrateShoppingRows(shoppingItems);
      saveSessionCache();
      showLoading(false);
      showToast(`${selectedIds.size}개 항목 → ${storageType}`);
      selectedIds.clear();
      updateAddBar();
      renderInventory();
    });
  });
  document.body.appendChild(overlay);
}

async function toggleShoppingComplete(shopping) {
  if (pendingCompletions.has(shopping.id)) {
    clearTimeout(pendingCompletions.get(shopping.id));
    pendingCompletions.delete(shopping.id);
    renderShopping();
    return;
  }

  if (shopping.completed) {
    shoppingItems = shoppingItems.map((item) =>
      item.id === shopping.id
        ? hydrateShoppingRow({ ...item, completed: false, completed_at: null })
        : item,
    );
    sortShoppingItems();
    saveSessionCache();
    showToast(`${shoppingItemName(shopping)} 구매 취소`);
    await loadShopping();
    return;
  }

  pendingCompletions.set(
    shopping.id,
    setTimeout(async () => {
      pendingCompletions.delete(shopping.id);
      shoppingItems = shoppingItems.map((item) =>
        item.id === shopping.id
          ? hydrateShoppingRow({
              ...item,
              completed: true,
              completed_at: nowIso(),
            })
          : item,
      );
      sortShoppingItems();
      saveSessionCache();
      showToast(`${shoppingItemName(shopping)} 구매 완료`);
      await loadShopping();
    }, 1000),
  );
  renderShopping();
}

async function clearCompleted() {
  const completed = shoppingItems.filter((s) => s.completed);
  if (completed.length === 0) {
    showToast("완료된 항목이 없습니다");
    return;
  }
  showLoading(true);
  const ids = completed.map((s) => s.id);
  const idSet = new Set(ids);
  shoppingItems = shoppingItems.filter((shopping) => !idSet.has(shopping.id));
  saveSessionCache();
  showLoading(false);
  showToast(`${completed.length}개 항목 정리됨`);
  await loadShopping();
  renderInventory();
}

async function addNewCategory() {
  const name = document.getElementById("new-cat-name").value.trim();
  if (!name) {
    showToast("카테고리 이름을 입력하세요");
    return;
  }
  const maxOrder = categories.reduce(
    (max, c) => Math.max(max, c.sort_order),
    -1,
  );
  categories = [
    ...categories,
    { id: createId(), name, sort_order: maxOrder + 1 },
  ];
  sortLocalData();
  saveSessionCache();
  document.getElementById("new-cat-name").value = "";
  document.getElementById("btn-add-cat").disabled = true;
  showToast(`"${name}" 카테고리 추가됨`);
  renderInventory();
}

function confirmDelete(item) {
  const overlay = showOverlay(`
    <p>"${item.name}"을(를) 삭제하시겠습니까?</p>
    <div class="btn-row">
      <button class="btn-cancel">취소</button>
      <button class="btn-delete">삭제</button>
    </div>
  `);
  overlay.querySelector(".btn-delete").addEventListener("click", async () => {
    overlay.remove();
    removeItemsById([item.id]);
    showToast(`"${item.name}" 삭제됨`);
    renderInventory();
  });
}

function showItemInfo(item) {
  const fmt = (iso) => {
    const d = new Date(iso);
    const p = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      month: "numeric",
      day: "numeric",
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .formatToParts(d)
      .reduce((acc, { type, value }) => ({ ...acc, [type]: value }), {});
    return `${p.month}월 ${p.day}일 (${p.weekday}) ${p.dayPeriod} ${p.hour}:${p.minute}`;
  };
  const overlay = showOverlay(`
    <input class="edit-item-input" style="margin-bottom: 8px;" type="text" value="${item.name}" />
    ${buildCatSelect('class="cat-select"', item.category_id)}
    <div class="item-meta">
      <div>수정일&nbsp;&nbsp;&nbsp;&nbsp;<span class="item-meta-value">${fmt(item.updated_at)}</span></div>
      <div>추가일&nbsp;&nbsp;&nbsp;&nbsp;<span class="item-meta-value">${fmt(item.created_at)}</span></div>
    </div>
    <div class="btn-row">
      <button class="btn-cancel">닫기</button>
      <button class="btn-save">저장</button>
    </div>
  `);

  const input = overlay.querySelector(".edit-item-input");
  input.focus();
  input.select();

  overlay.querySelector(".btn-save").addEventListener("click", async () => {
    const name = input.value.trim();
    const categoryId = normalizeCategoryId(
      overlay.querySelector(".cat-select").value,
    );
    const nameChanged = name && name !== item.name;
    const catChanged =
      categoryId && String(categoryId) !== String(item.category_id);
    if (!name || (!nameChanged && !catChanged)) {
      overlay.remove();
      return;
    }
    overlay.remove();
    showLoading(true);
    const updates = {};
    if (nameChanged) updates.name = name;
    if (catChanged) updates.category_id = categoryId;
    updates.updated_at = nowIso();
    items = items.map((current) =>
      current.id === item.id ? { ...current, ...updates } : current,
    );
    sortLocalData();
    shoppingItems = hydrateShoppingRows(shoppingItems);
    saveSessionCache();
    showLoading(false);
    showToast(nameChanged ? `"${name}"으로 수정됨` : "카테고리 변경됨");
    renderInventory();
  });
}

// ── Helpers ──
function pickCategory(query, onConfirm) {
  const overlay = showOverlay(`
    <p>"${query}" 카테고리 선택</p>
    <div class="cat-pick-list"></div>
    <div class="btn-row" style="margin-top:4px">
      <button class="btn-cancel">취소</button>
    </div>
  `);
  const list = overlay.querySelector(".cat-pick-list");
  for (const cat of categories) {
    const btn = document.createElement("button");
    btn.className = "btn-secondary";
    btn.textContent = cat.name;
    btn.addEventListener("click", () => {
      overlay.remove();
      document.body.style.overflow = "";
      onConfirm(String(cat.id));
    });
    list.appendChild(btn);
  }
}

function buildCatSelect(attrs = "", selectedId = null, placeholder = null) {
  const placeholderOpt = placeholder
    ? `<option value="">${placeholder}</option>`
    : "";
  const opts = categories
    .map(
      (c) =>
        `<option value="${c.id}"${String(c.id) === String(selectedId) ? " selected" : ""}>${c.name}</option>`,
    )
    .join("");
  return `<select ${attrs}>${placeholderOpt}${opts}</select>`;
}

function shoppingItemName(s) {
  return s.jangbogi_items?.name || s.custom_name || "?";
}

function clearSearchInput() {
  $searchInput.value = "";
  $clearBtn.classList.add("hidden");
}

function showOverlay(contentHtml) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal">${contentHtml}</div>`;
  document.body.style.overflow = "hidden";
  const close = () => {
    overlay.remove();
    document.body.style.overflow = "";
  };
  overlay.querySelector(".btn-cancel")?.addEventListener("click", close);
  document.body.appendChild(overlay);
  return overlay;
}

function showToast(msg) {
  $toast.textContent = msg;
  $toast.classList.remove("hidden");
  setTimeout(() => $toast.classList.add("hidden"), 2000);
}

function showLoading(show) {
  $loading.classList.toggle("hidden", !show);
}

// ── Start ──
document.addEventListener("touchstart", () => {}, { passive: true });
init();
