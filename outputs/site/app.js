(() => {
  "use strict";

  const STORAGE_KEY = "muli-posts-v1";
  const DRAFT_KEY = "muli-draft-v1";
  const THEME_KEY = "muli-theme-v2";
  const SITE_KEY = "muli-site-settings-v1";
  const FEED_CACHE_KEY = "muli-one-feed-v1";
  const API_BASE = location.protocol === "file:" ? "http://127.0.0.1:8080" : "";
  const STATIC_HOSTING = location.hostname.endsWith(".github.io");
  const DB_NAME = "muli-journal";
  const DB_STORE = "covers";
  const FALLBACK_COVER = "assets/images/soft-geometry.svg";

  const SITE_DEFAULTS = {
    brandMark: "M:",
    brandName: "暮里",
    menuLabel: "菜单",
    writeLabel: "写一篇",
    navWorks: "作品",
    navWorksEn: "Selected work",
    navJournal: "日志",
    navJournalEn: "Notes",
    navAbout: "关于",
    navAboutEn: "About",
    menuEyebrow: "目录",
    menuEdition: "MULI / 2026",
    menuPublish: "发布新文章",
    menuSearch: "搜索内容",
    menuTheme: "切换明暗",
    adminLabel: "后台",
    heroKicker: "Independent journal · 2026",
    heroIssue: "NO.05",
    heroTitle1: "把日常",
    heroTitle2: "折成作品",
    heroIntro: "视觉、城市与日常观察。",
    heroBrowse: "浏览全部",
    heroFeatureMeta: "Selected / 01",
    heroFeatureTitle: "柔和的秩序",
    heroFeatureText: "陶土、纸张与午后的光",
    heroMetaLabel: "本期目录",
    heroMetaTags: "视觉 · 日常 · 手记",
    heroMetaAction: "查看全部作品",
    feedEyebrow: "ONE · DAILY FEED",
    feedTitle: "今日一页",
    worksEyebrow: "Selected works / archive",
    worksTitle: "最近发布",
    manageLabel: "管理文章",
    shuffleLabel: "随机漫游",
    filterAll: "全部",
    filterVisual: "视觉",
    filterDaily: "日常",
    filterNotes: "手记",
    emptyTitle: "这个分类还没有内容",
    emptyText: "换个筛选，或发布第一篇。",
    feedOpenLabel: "阅读原文",
    journalEyebrow: "From the notebook",
    journalTitle1: "随时，记下",
    journalTitle2: "一个念头。",
    journalQuote: "为某个瞬间，多停留一分钟。",
    journalMeta: "— 编辑手记 / 10.2026",
    aboutEyebrow: "About this journal",
    aboutTitle1: "暮里是一场",
    aboutTitle2: "持续的采集。",
    aboutText: "设计、影像与日常片段。内容保存在当前浏览器。",
    aboutNew: "开始记录",
    aboutManage: "文章管理",
    aboutExport: "导出备份",
    footerBrand: "暮里 MULI",
    footerTagline: "把日常折成作品。",
    footerNote: "LOCAL-FIRST JOURNAL",
    footerCopyright: "© 2026",
    footerReset: "恢复示例内容",
    siteTitle: "暮里 MULI — 把日常折成作品",
    siteDescription: "暮里是一份关于视觉、城市与日常观察的本地博客。"
  };

  const SITE_FIELD_GROUPS = [
    {
      title: "品牌与导航",
      fields: [
        ["brandMark", "品牌缩写"],
        ["brandName", "品牌名称"],
        ["menuLabel", "菜单按钮文字"],
        ["menuEyebrow", "菜单标题"],
        ["menuEdition", "菜单版本文字"],
        ["navWorks", "作品导航"],
        ["navJournal", "日志导航"],
        ["navAbout", "关于导航"],
        ["navWorksEn", "作品英文"],
        ["navJournalEn", "日志英文"],
        ["navAboutEn", "关于英文"]
      ]
    },
    {
      title: "操作按钮",
      fields: [
        ["writeLabel", "写一篇按钮"],
        ["menuPublish", "菜单发布文字"],
        ["menuSearch", "菜单搜索文字"],
        ["menuTheme", "菜单主题文字"],
        ["adminLabel", "后台入口文字"]
      ]
    },
    {
      title: "首屏主视觉",
      wide: true,
      fields: [
        ["heroKicker", "首屏眉题"],
        ["heroIssue", "期号"],
        ["heroTitle1", "标题第一行"],
        ["heroTitle2", "标题第二行"],
        ["heroIntro", "首屏短句", true],
        ["heroBrowse", "浏览按钮文字"],
        ["heroFeatureMeta", "精选标签"],
        ["heroFeatureTitle", "精选作品标题"],
        ["heroFeatureText", "精选作品短句", true],
        ["heroMetaLabel", "目录标签"],
        ["heroMetaTags", "目录分类文字", true],
        ["heroMetaAction", "查看全部文字"]
      ]
    },
    {
      title: "首页内容区",
      wide: true,
      fields: [
        ["feedEyebrow", "RSS 眉题"],
        ["feedTitle", "RSS 标题"],
        ["worksEyebrow", "作品区眉题"],
        ["worksTitle", "作品区标题"],
        ["manageLabel", "管理文章按钮"],
        ["shuffleLabel", "随机漫游按钮"],
        ["filterAll", "筛选：全部"],
        ["filterVisual", "筛选：视觉"],
        ["filterDaily", "筛选：日常"],
        ["filterNotes", "筛选：手记"],
        ["emptyTitle", "空状态标题"],
        ["emptyText", "空状态说明"],
        ["feedOpenLabel", "RSS 阅读按钮"]
      ]
    },
    {
      title: "日志与关于",
      wide: true,
      fields: [
        ["journalEyebrow", "日志眉题"],
        ["journalTitle1", "日志标题上行"],
        ["journalTitle2", "日志标题下行"],
        ["journalQuote", "日志引言", true],
        ["journalMeta", "日志署名"],
        ["aboutEyebrow", "关于眉题"],
        ["aboutTitle1", "关于标题上行"],
        ["aboutTitle2", "关于标题下行"],
        ["aboutText", "关于说明", true],
        ["aboutNew", "开始记录按钮"],
        ["aboutManage", "关于区管理按钮"],
        ["aboutExport", "关于区导出按钮"]
      ]
    },
    {
      title: "页脚与网页信息",
      wide: true,
      fields: [
        ["footerBrand", "页脚品牌"],
        ["footerTagline", "页脚句子", true],
        ["footerNote", "页脚说明"],
        ["footerCopyright", "版权文字"],
        ["footerReset", "恢复示例按钮"],
        ["siteTitle", "浏览器页面标题", true],
        ["siteDescription", "页面 SEO 描述", true]
      ]
    }
  ];

  const FALLBACK_FEED = [
    {
      title: "总得热爱一点什么吧，据说，人活着，是要有精神支柱的。",
      link: "https://wufazhuce.com/one/5244",
      category: "摄影",
      volume: "VOL.5129",
      credit: "「ONE · 一个」",
      quote: "总得热爱一点什么吧，据说，人活着，是要有精神支柱的。",
      image: "https://image.wufazhuce.com/Fiea7hIi0JIrojLNTvjJxTlAzsnI",
      fallbackImage: "assets/images/coastline.svg"
    },
    {
      title: "痛苦是不能闷在心里的：要把它化为喜剧。",
      link: "https://wufazhuce.com/one/5252",
      category: "摄影",
      volume: "VOL.5128",
      credit: "「ONE · 一个」",
      quote: "痛苦是不能闷在心里的：要把它化为喜剧。",
      image: "https://image.wufazhuce.com/FiM_WGFhzb1_esxI_ZB5vsrgo0uj",
      fallbackImage: "assets/images/four-pm.svg"
    },
    {
      title: "一个白纸上赶路的人",
      link: "https://wufazhuce.com/one/5309",
      category: "摄影",
      volume: "VOL.5127",
      credit: "「ONE · 一个」",
      quote: "没有人能告诉他，穿过腐败时间的另一条路径。",
      image: "https://image.wufazhuce.com/Fo8-o09GC8OL7OFTV7yInechgfXk",
      fallbackImage: "assets/images/city-pause.svg"
    },
    {
      title: "瞎操心就是以爱的名义互相伤害。",
      link: "https://wufazhuce.com/one/5278",
      category: "摄影",
      volume: "VOL.5126",
      credit: "「ONE · 一个」",
      quote: "瞎操心就是以爱的名义互相伤害。",
      image: "https://image.wufazhuce.com/Ftjj7JXgic_IwvsLYNPEfBznD1Jk",
      fallbackImage: "assets/images/night-index.svg"
    }
  ];

  const samplePosts = [
    {
      id: "soft-geometry",
      title: "柔和的秩序",
      titleEn: "Soft Geometry",
      excerpt: "在陶土、纸张和午后的光之间，寻找一种不尖锐的秩序。",
      category: "视觉",
      date: "2026.10.18",
      tags: ["物件", "空间", "陶土"],
      cover: "assets/images/soft-geometry.svg",
      layout: "wide",
      body: [
        "有些秩序并不需要被立刻看见。它藏在球体的弧线里，藏在一块布落下时形成的折痕里，也藏在房间慢慢变暗的那几分钟里。",
        "这次练习从三个基本形开始：圆、拱与方。它们没有功能，也不需要解释。我只是把颜色降低一点，把边缘放软一点，让光成为真正的结构。",
        "物件之间的关系比物件本身更值得记录下来。陶土吸收光，金属将光推开，纸张则把光留在表面。它们处在同一个空间里，却各自拥有不同的时间。"
      ]
    },
    {
      id: "slower-coast",
      title: "沿着海岸线慢行",
      titleEn: "A Slower Coast",
      excerpt: "潮汐退去之后，海岸留下了一组缓慢、重复又不断变化的线条。",
      category: "日常",
      date: "2026.10.12",
      tags: ["海岸", "旅行", "观察"],
      cover: "assets/images/coastline.svg",
      layout: "portrait",
      body: [
        "傍晚六点，海面开始失去颜色。远处的岸线像铅笔反复描过，又被橡皮轻轻擦掉。",
        "我喜欢沿着潮水退去的方向走，不去计划终点。脚下的沙地记录了每一次浪到达的位置，那些浅浅的弧度比地图更准确。",
        "旅行的意义有时只是在陌生的地方重新学习速度。风很慢，云很慢，连一个念头也需要走很久才能到达。"
      ]
    },
    {
      id: "four-in-the-afternoon",
      title: "留住下午四点",
      titleEn: "Four in the Afternoon",
      excerpt: "一天里最柔软的光，通常只停留十几分钟。",
      category: "手记",
      date: "2026.10.06",
      tags: ["光", "静物", "片刻"],
      cover: "assets/images/four-pm.svg",
      layout: "square",
      body: [
        "下午四点，光从窗边横着进来。它经过桌面的边缘，经过一杯水的侧面，最后停在墙上，像某个人忘记带走的手写便签。",
        "我试过用照片留住这种光，但照片只能保存颜色，无法保存温度。后来我决定先坐下来看完它消失，再去做别的事情。",
        "记录不一定意味着占有。有时只是认真地承认：这个瞬间发生过。"
      ]
    },
    {
      id: "pause-in-the-city",
      title: "城市里的留白",
      titleEn: "A Pause in the City",
      excerpt: "建筑之间的一小块空地，可能比建筑本身更接近一座城市的表情。",
      category: "视觉",
      date: "2026.09.28",
      tags: ["城市", "建筑", "留白"],
      cover: "assets/images/city-pause.svg",
      layout: "wide",
      body: [
        "城市总在催促人向前走。电梯向上，车流向前，屏幕里的信息不断刷新。偶尔出现的一块空地，会让这种节奏突然停顿。",
        "没有招牌，没有明确的入口，只有一道拱、几扇窗和落在地上的影子。人们经过它，却很少真正看向它。",
        "我越来越喜欢这些没有被安排用途的地方。它们像一段句子里的空白，让前后的事物都有了呼吸。"
      ]
    },
    {
      id: "chair-imagination",
      title: "关于一把椅子的想象",
      titleEn: "Study of a Chair",
      excerpt: "当功能被暂时拿走，一把椅子还能剩下什么？",
      category: "手记",
      date: "2026.09.20",
      tags: ["家具", "形态", "研究"],
      cover: "assets/images/chair-study.svg",
      layout: "portrait",
      body: [
        "这把椅子没有使用者。它被放在一个没有房间的空间里，只需要负责自己的轮廓。",
        "金属管形成靠背，软垫提供唯一的颜色。结构里有一些明显的多余，也有一些本可以省略的部分。设计常常在这些犹豫中变得有趣。",
        "如果一件物品不再被使用，它会不会更接近自己的本质？我没有答案，但愿意继续画下去。"
      ]
    },
    {
      id: "night-index",
      title: "夜行记录",
      titleEn: "Night Index",
      excerpt: "路灯把夜晚切成一段一段，每盏灯之间都藏着不同的声音。",
      category: "日常",
      date: "2026.09.14",
      tags: ["夜行", "声音", "城市"],
      cover: "assets/images/night-index.svg",
      layout: "square",
      body: [
        "晚上十一点以后，城市会换一种语言。商店卷帘门落下的声音、远处自行车的铃声、某一扇窗里很轻的电视声，都比白天更清楚。",
        "我沿着路灯走，每经过一盏，就记下一个刚听见的词：风、树叶、塑料袋、脚步、呼吸。",
        "这些词最后没有组成一篇文章。它们只是证明了，我在那个夜晚确实醒着。"
      ]
    }
  ];

  const el = {
    worksGrid: document.querySelector("#works-grid"),
    emptyState: document.querySelector("#empty-state"),
    postCount: document.querySelector("#post-count"),
    filters: [...document.querySelectorAll(".filter-chip")],
    shuffleButton: document.querySelector("#shuffle-button"),
    readerModal: document.querySelector("#reader-modal"),
    readerCounter: document.querySelector("#reader-counter"),
    readerImage: document.querySelector("#reader-image"),
    readerCategory: document.querySelector("#reader-category"),
    readerTitle: document.querySelector("#reader-title"),
    readerExcerpt: document.querySelector("#reader-excerpt"),
    readerDate: document.querySelector("#reader-date"),
    readerTags: document.querySelector("#reader-tags"),
    readerBody: document.querySelector("#reader-body"),
    prevButton: document.querySelector("#prev-post"),
    nextButton: document.querySelector("#next-post"),
    prevTitle: document.querySelector("#prev-post-title"),
    nextTitle: document.querySelector("#next-post-title"),
    composerEyebrow: document.querySelector("#composer-eyebrow"),
    composerHeading: document.querySelector("#composer-title"),
    publishLabel: document.querySelector(".publish-label"),
    composerModal: document.querySelector("#composer-modal"),
    composerForm: document.querySelector("#composer-form"),
    composerTitleInput: document.querySelector("#post-title-input"),
    composerExcerptInput: document.querySelector("#post-excerpt-input"),
    composerCategoryInput: document.querySelector("#post-category-input"),
    composerTagsInput: document.querySelector("#post-tags-input"),
    composerBodyInput: document.querySelector("#post-body-input"),
    coverInput: document.querySelector("#cover-input"),
    dropZone: document.querySelector("#drop-zone"),
    previewImage: document.querySelector("#preview-image"),
    previewTitle: document.querySelector("#preview-title"),
    previewExcerpt: document.querySelector("#preview-excerpt"),
    previewCategory: document.querySelector("#preview-category"),
    previewDate: document.querySelector("#preview-date"),
    removeCover: document.querySelector("#remove-cover"),
    autosaveStatus: document.querySelector("#autosave-status"),
    searchModal: document.querySelector("#search-modal"),
    searchInput: document.querySelector("#search-input"),
    searchResults: document.querySelector("#search-results"),
    adminModal: document.querySelector("#admin-modal"),
    adminTitle: document.querySelector("#admin-title"),
    adminEyebrow: document.querySelector("#admin-eyebrow"),
    adminViews: [...document.querySelectorAll("[data-admin-view]")],
    adminNavButtons: [...document.querySelectorAll(".admin-nav [data-admin-panel]")],
    adminTotalCount: document.querySelector("#admin-total-count"),
    adminLocalCount: document.querySelector("#admin-local-count"),
    adminFeedCount: document.querySelector("#admin-feed-count"),
    adminRecentList: document.querySelector("#admin-recent-list"),
    sidePostCount: document.querySelector("#side-post-count"),
    settingsGroups: document.querySelector("#site-settings-groups"),
    settingsForm: document.querySelector("#site-settings-form"),
    settingsSaveStatus: document.querySelector("#settings-save-status"),
    settingsResetButton: document.querySelector("#settings-reset-button"),
    adminDataBackup: document.querySelector("#admin-data-backup"),
    adminImportButton: document.querySelector("#admin-import-button"),
    adminImportInput: document.querySelector("#admin-import-input"),
    adminBackupButton: document.querySelector("#admin-backup-button"),
    adminResetButton: document.querySelector("#admin-reset-button"),
    serverSyncButton: document.querySelector("#server-sync-button"),
    serverSyncStatus: document.querySelector("#server-sync-status"),
    managerList: document.querySelector("#manager-list"),
    managerEmpty: document.querySelector("#manager-empty"),
    managerSearch: document.querySelector("#manager-search-input"),
    managerTabs: [...document.querySelectorAll(".manager-tab")],
    allPostCount: document.querySelector("#all-post-count"),
    localPostCount: document.querySelector("#local-post-count"),
    menuPostCount: document.querySelector("#menu-post-count"),
    menuTrigger: document.querySelector("#menu-trigger"),
    floatingMenu: document.querySelector("#floating-menu"),
    themeLabel: document.querySelector(".theme-label"),
    feedGrid: document.querySelector("#one-feed-grid"),
    feedStatus: document.querySelector("#feed-status"),
    feedRefresh: document.querySelector("#feed-refresh"),
    toast: document.querySelector("#toast"),
    exportButton: document.querySelector("#export-button"),
    resetButton: document.querySelector("#reset-button"),
    themeToggle: document.querySelector(".theme-toggle"),
    progress: document.querySelector(".scroll-progress span"),
    cursor: document.querySelector(".cursor-label"),
    body: document.body
  };

  let localPosts = readLocalPosts();
  let allPosts = [...localPosts, ...samplePosts];
  let renderedPosts = [];
  let activeFilter = "全部";
  let shuffled = false;
  let activeReaderPost = null;
  let selectedCoverFile = null;
  let selectedCoverUrl = "";
  let editingPostId = null;
  let existingCoverKey = "";
  let existingCoverPath = "";
  let managerFilter = "all";
  let feedRequest = null;
  let siteSettings = readSiteSettings();
  let activeAdminView = "overview";
  let serverAvailable = false;
  let serverRevision = 0;
  let settingsSyncTimer = null;
  let draftTimer = null;
  let toastTimer = null;
  let dbPromise = null;
  const coverUrlCache = new Map();
  const objectUrls = new Set();

  function escapeHTML(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function safeArray(value) {
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  }

  function readSiteSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SITE_KEY) || "{}");
      const valid = saved && typeof saved === "object" && !Array.isArray(saved);
      return { ...SITE_DEFAULTS, ...(valid ? saved : {}) };
    } catch {
      return { ...SITE_DEFAULTS };
    }
  }

  function applySiteSettings(settings = siteSettings) {
    document.querySelectorAll("[data-site]").forEach((node) => {
      const key = node.dataset.site;
      if (Object.prototype.hasOwnProperty.call(settings, key)) node.textContent = settings[key];
    });
    document.title = settings.siteTitle?.trim() || `${settings.brandName} MULI`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = settings.siteDescription || "";
    const homeLink = document.querySelector(".brand");
    if (homeLink) homeLink.setAttribute("aria-label", `${settings.brandName}首页`);
  }

  function persistSiteSettings() {
    applySiteSettings(siteSettings);
    try {
      localStorage.setItem(SITE_KEY, JSON.stringify(siteSettings));
      el.settingsSaveStatus.textContent = "所有文字均已保存";
      scheduleSettingsSync();
    } catch {
      el.settingsSaveStatus.textContent = "保存失败，请检查浏览器存储空间";
    }
  }

  function renderSettingsForm() {
    el.settingsGroups.innerHTML = SITE_FIELD_GROUPS.map((group) => `
      <section class="settings-group ${group.wide ? "settings-group-wide" : ""}">
        <h3>${escapeHTML(group.title)}</h3>
        <div class="settings-grid">
          ${group.fields.map(([key, label, multiline]) => `
            <label class="setting-field ${multiline ? "is-wide" : ""}">
              <span>${escapeHTML(label)}</span>
              ${multiline
                ? `<textarea data-setting-key="${escapeHTML(key)}" rows="2">${escapeHTML(siteSettings[key] || "")}</textarea>`
                : `<input data-setting-key="${escapeHTML(key)}" type="text" value="${escapeHTML(siteSettings[key] || "")}">`}
            </label>
          `).join("")}
        </div>
      </section>
    `).join("");
  }

  function readSettingsForm() {
    const next = { ...SITE_DEFAULTS };
    el.settingsForm.querySelectorAll("[data-setting-key]").forEach((input) => {
      next[input.dataset.settingKey] = input.value.trim();
    });
    return next;
  }

  function renderAdminOverview() {
    if (!el.adminRecentList) return;
    el.adminFeedCount.textContent = String(document.querySelectorAll(".one-feed-card").length).padStart(2, "0");
    el.adminRecentList.innerHTML = allPosts.slice(0, 5).map((post) => `
      <article class="admin-recent-item">
        <img src="${escapeHTML(coverSource(post))}" alt="">
        <div>
          <h4>${escapeHTML(post.title)}</h4>
          <p>${escapeHTML(post.category)} · ${escapeHTML(post.date || "未标注日期")}</p>
        </div>
        <span>${post.isLocal ? "本地" : "示例"}</span>
      </article>
    `).join("");
  }

  function readLocalPosts() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(value)) return [];
      return value.filter((post) => post && typeof post.id === "string" && post.isLocal);
    } catch {
      return [];
    }
  }

  function persistLocalPosts() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localPosts));
      return true;
    } catch {
      showToast("浏览器存储空间不足，文章可能无法持久保存");
      return false;
    }
  }

  function openDatabase() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB unavailable"));
        return;
      }
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(DB_STORE)) {
          request.result.createObjectStore(DB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }

  async function putCover(key, blob) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(blob, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getCover(key) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE, "readonly").objectStore(DB_STORE).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function deleteCover(key) {
    if (!key) return;
    try {
      const db = await openDatabase();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).delete(key);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // A missing image should never block metadata cleanup.
    }
  }

  async function hydrateLocalCovers() {
    await Promise.all(localPosts.map(async (post) => {
      if (!post.coverKey || coverUrlCache.has(post.coverKey)) return;
      try {
        const blob = await getCover(post.coverKey);
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        coverUrlCache.set(post.coverKey, url);
        objectUrls.add(url);
      } catch {
        // The card falls back to the bundled cover if image storage is unavailable.
      }
    }));
  }

  function coverSource(post) {
    if (post.cover) {
      return post.cover.startsWith("/media/") ? `${API_BASE}${post.cover}` : post.cover;
    }
    if (post.coverKey && coverUrlCache.has(post.coverKey)) {
      return coverUrlCache.get(post.coverKey);
    }
    return FALLBACK_COVER;
  }

  function getLayout(post, index) {
    if (post.layout) return post.layout;
    return ["wide", "portrait", "", "square", "portrait", ""][index % 6];
  }

  function filteredPosts() {
    let posts = activeFilter === "全部"
      ? allPosts
      : allPosts.filter((post) => post.category === activeFilter);
    posts = [...posts];
    if (shuffled) {
      for (let i = posts.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [posts[i], posts[j]] = [posts[j], posts[i]];
      }
    }
    return posts;
  }

  function renderPosts() {
    const posts = filteredPosts();
    renderedPosts = posts;
    updatePostCounts();
    el.emptyState.hidden = posts.length !== 0;
    el.worksGrid.hidden = posts.length === 0;

    el.worksGrid.innerHTML = posts.map((post, index) => {
      const layout = getLayout(post, index);
      const tags = safeArray(post.tags);
      const meta = tags.slice(0, 2).join(" · ") || "无标签";
      return `
        <article class="work-card size-${escapeHTML(layout)} ${escapeHTML(layout)} ${post.isLocal ? "is-local" : ""}" style="animation-delay:${Math.min(index * 55, 280)}ms">
          <a class="work-link" href="#post=${encodeURIComponent(post.id)}" data-post-id="${escapeHTML(post.id)}" aria-label="阅读《${escapeHTML(post.title)}》">
            <div class="work-image-wrap">
              <img class="work-image" src="${escapeHTML(coverSource(post))}" alt="${escapeHTML(post.title)}封面" loading="lazy">
              <span class="work-overlay" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg>
              </span>
            </div>
            <div class="work-info">
              <div>
                <div class="work-meta">
                  <span class="local-mark" aria-hidden="true"></span>
                  <span>${escapeHTML(post.category)}</span>
                  <span>/</span>
                  <span>${escapeHTML(meta)}</span>
                </div>
                <h3 class="work-title">${escapeHTML(post.title)}</h3>
                <p class="work-en">${escapeHTML(post.titleEn || post.date)}</p>
                <span class="work-read">
                  阅读文章
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
                </span>
              </div>
              <span class="work-number">${String(index + 1).padStart(2, "0")}</span>
            </div>
          </a>
        </article>
      `;
    }).join("");
  }

  function updatePostCounts() {
    const allCount = String(allPosts.length).padStart(2, "0");
    const localCount = String(localPosts.length).padStart(2, "0");
    el.postCount.textContent = allCount;
    el.menuPostCount.textContent = allCount;
    el.allPostCount.textContent = allCount;
    el.localPostCount.textContent = localCount;
    el.sidePostCount.textContent = allCount;
    el.adminTotalCount.textContent = allCount;
    el.adminLocalCount.textContent = localCount;
    renderAdminOverview();
  }

  function openLayer(layer) {
    closeOtherLayers(layer);
    layer.classList.add("is-open");
    layer.setAttribute("aria-hidden", "false");
    el.body.classList.add("is-locked");
  }

  function closeLayer(layer) {
    layer.classList.remove("is-open");
    layer.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal-layer.is-open")) {
      el.body.classList.remove("is-locked");
    }
  }

  function closeOtherLayers(except) {
    document.querySelectorAll(".modal-layer.is-open").forEach((layer) => {
      if (layer !== except) closeLayer(layer);
    });
  }

  function closeAllLayers() {
    document.querySelectorAll(".modal-layer.is-open").forEach(closeLayer);
    closeMenu();
    activeReaderPost = null;
    if (location.hash.startsWith("#post=")) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  function openReader(id, { updateHistory = true } = {}) {
    const source = renderedPosts.length && renderedPosts.some((post) => post.id === id)
      ? renderedPosts
      : allPosts;
    const index = source.findIndex((post) => post.id === id);
    if (index < 0) return;
    activeReaderPost = source[index];
    const post = activeReaderPost;
    const previous = source[(index - 1 + source.length) % source.length];
    const next = source[(index + 1) % source.length];
    const body = safeArray(post.body).length
      ? safeArray(post.body)
      : String(post.body || "").split(/\n\s*\n/).filter(Boolean);
    const tags = safeArray(post.tags);

    el.readerCounter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(source.length).padStart(2, "0")}`;
    el.readerImage.src = coverSource(post);
    el.readerImage.alt = `${post.title}封面`;
    el.readerCategory.textContent = `${post.category} · ${post.titleEn || "Journal entry"}`;
    el.readerTitle.textContent = post.title;
    el.readerExcerpt.textContent = post.excerpt || "";
    el.readerDate.textContent = post.date || "";
    el.readerTags.textContent = tags.length ? tags.join(" / ") : "MULI JOURNAL";
    el.readerBody.innerHTML = body.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("");
    el.prevTitle.textContent = previous.title;
    el.nextTitle.textContent = next.title;
    el.prevButton.dataset.postId = previous.id;
    el.nextButton.dataset.postId = next.id;

    openLayer(el.readerModal);
    if (updateHistory) {
      history.replaceState(null, "", `#post=${encodeURIComponent(post.id)}`);
    }
    el.readerModal.querySelector(".close-button").focus({ preventScroll: true });
    el.readerModal.scrollTop = 0;
  }

  function updatePreview() {
    el.previewTitle.textContent = el.composerTitleInput.value.trim() || "未命名作品";
    el.previewExcerpt.textContent = el.composerExcerptInput.value.trim() || "一句话简介会出现在这里。";
    el.previewCategory.textContent = el.composerCategoryInput.value;
    const editingPost = localPosts.find((post) => post.id === editingPostId);
    el.previewDate.textContent = editingPost?.date || formatDate(new Date());
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  }

  function renderCoverPreview(src = "") {
    let image = el.previewImage.querySelector("img");
    if (src) {
      if (!image) {
        image = document.createElement("img");
        image.alt = "封面预览";
        el.previewImage.prepend(image);
      }
      image.src = src;
      el.removeCover.hidden = false;
      el.previewImage.querySelector(":scope > span").textContent = "COVER READY";
    } else {
      image?.remove();
      el.removeCover.hidden = true;
      el.previewImage.querySelector(":scope > span").textContent = "COVER IMAGE";
      el.coverInput.value = "";
    }
  }

  function setPreviewCover(file) {
    if (selectedCoverUrl) URL.revokeObjectURL(selectedCoverUrl);
    selectedCoverFile = file;
    selectedCoverUrl = file ? URL.createObjectURL(file) : "";
    renderCoverPreview(selectedCoverUrl);
  }

  function validateImage(file) {
    if (!file) return false;
    if (!file.type.startsWith("image/")) {
      showToast("请选择图片文件");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("图片需要小于 10MB");
      return false;
    }
    return true;
  }

  function currentDraftKey() {
    return editingPostId ? `muli-edit-draft-${editingPostId}` : DRAFT_KEY;
  }

  function saveDraft() {
    const draft = {
      title: el.composerTitleInput.value,
      excerpt: el.composerExcerptInput.value,
      category: el.composerCategoryInput.value,
      tags: el.composerTagsInput.value,
      body: el.composerBodyInput.value
    };
    try {
      localStorage.setItem(currentDraftKey(), JSON.stringify(draft));
    } catch {
      showToast("草稿保存失败，请检查浏览器存储空间");
      return;
    }
    el.autosaveStatus.textContent = "草稿已保存 " + new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function scheduleDraftSave() {
    updatePreview();
    el.autosaveStatus.textContent = "正在保存…";
    window.clearTimeout(draftTimer);
    draftTimer = window.setTimeout(saveDraft, 450);
  }

  function loadDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(currentDraftKey()) || "null");
      if (!draft) return;
      el.composerTitleInput.value = draft.title || "";
      el.composerExcerptInput.value = draft.excerpt || "";
      el.composerCategoryInput.value = draft.category || "视觉";
      el.composerTagsInput.value = draft.tags || "";
      el.composerBodyInput.value = draft.body || "";
    } catch {
      localStorage.removeItem(currentDraftKey());
    }
  }

  function resetComposer() {
    el.composerForm.reset();
    setPreviewCover(null);
    editingPostId = null;
    existingCoverKey = "";
    existingCoverPath = "";
    el.autosaveStatus.textContent = "草稿会自动保存";
    updatePreview();
  }

  function openComposer(postId = null) {
    if (typeof postId !== "string") postId = null;
    closeMenu();
    editingPostId = postId;
    existingCoverKey = "";
    existingCoverPath = "";
    selectedCoverFile = null;
    if (selectedCoverUrl) URL.revokeObjectURL(selectedCoverUrl);
    selectedCoverUrl = "";
    el.composerForm.reset();
    renderCoverPreview("");

    if (editingPostId) {
      const post = localPosts.find((item) => item.id === editingPostId);
      if (!post) {
        editingPostId = null;
        return;
      }
      el.composerEyebrow.textContent = "Edit entry";
      el.composerHeading.textContent = "编辑文章";
      el.publishLabel.textContent = "保存修改";
      el.composerTitleInput.value = post.title;
      el.composerExcerptInput.value = post.excerpt || "";
      el.composerCategoryInput.value = post.category || "视觉";
      el.composerTagsInput.value = safeArray(post.tags).join(", ");
      el.composerBodyInput.value = safeArray(post.body).join("\n\n");
      existingCoverKey = post.coverKey || "";
      existingCoverPath = post.cover || "";
      if (existingCoverKey || post.cover) renderCoverPreview(coverSource(post));
    } else {
      el.composerEyebrow.textContent = "New entry";
      el.composerHeading.textContent = "发布一篇新作品";
      el.publishLabel.textContent = "立即发布";
    }

    loadDraft();
    updatePreview();
    openLayer(el.composerModal);
    el.composerTitleInput.focus({ preventScroll: true });
    el.composerModal.scrollTop = 0;
  }

  async function savePost() {
    const title = el.composerTitleInput.value.trim();
    if (!title) {
      el.composerTitleInput.focus();
      showToast("先给这篇文章一个标题");
      return;
    }

    const editingPost = localPosts.find((post) => post.id === editingPostId) || null;
    const id = editingPost?.id || `local-${Date.now()}`;
    const draftKey = currentDraftKey();
    const coverKey = selectedCoverFile
      ? (existingCoverKey || `cover-${id}-${Date.now()}`)
      : existingCoverKey;
    if (selectedCoverFile) {
      try {
        await putCover(coverKey, selectedCoverFile);
        const oldUrl = coverUrlCache.get(coverKey);
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
          objectUrls.delete(oldUrl);
        }
        const coverUrl = URL.createObjectURL(selectedCoverFile);
        coverUrlCache.set(coverKey, coverUrl);
        objectUrls.add(coverUrl);
      } catch {
        showToast("封面保存失败，请尝试较小的图片");
        return;
      }
    }

    const rawBody = el.composerBodyInput.value.trim();
    const post = {
      id,
      title,
      titleEn: "Local entry",
      excerpt: el.composerExcerptInput.value.trim() || "一篇刚刚发布的新作品。",
      category: el.composerCategoryInput.value,
      date: editingPost?.date || formatDate(new Date()),
      tags: el.composerTagsInput.value.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
      body: rawBody
        ? rawBody.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean)
        : ["这篇内容还没有正文，但它已经准备好被继续书写。"],
      cover: selectedCoverFile ? "" : existingCoverPath,
      coverKey,
      isLocal: true,
      layout: editingPost?.layout || "wide"
    };

    if (editingPost) {
      Object.assign(editingPost, post);
    } else {
      localPosts.unshift(post);
    }
    allPosts = [...localPosts, ...samplePosts];
    persistLocalPosts();
    await pushStateToServer({ silent: true });
    localStorage.removeItem(draftKey);
    localStorage.removeItem("muli-draft-image");
    const savedId = id;
    const wasEditing = Boolean(editingPost);
    resetComposer();
    activeFilter = "全部";
    shuffled = false;
    el.filters.forEach((button) => button.classList.toggle("active", button.dataset.filter === "全部"));
    renderPosts();
    renderManager();
    closeLayer(el.composerModal);
    showToast(wasEditing ? "文章已更新" : "发布成功，内容已保存在本地");
    window.setTimeout(() => openReader(savedId), 220);
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    el.toast.textContent = message;
    el.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => el.toast.classList.remove("is-visible"), 2600);
  }

  async function removeLocalPost(id, { skipConfirm = false } = {}) {
    const index = localPosts.findIndex((post) => post.id === id);
    if (index < 0) return;
    const post = localPosts[index];
    if (!skipConfirm && !window.confirm(`确定删除《${post.title}》吗？此操作无法撤销。`)) return;

    localPosts.splice(index, 1);
    allPosts = [...localPosts, ...samplePosts];
    persistLocalPosts();
    localStorage.removeItem(`muli-edit-draft-${id}`);
    await deleteCover(post.coverKey);
    if (post.coverKey && coverUrlCache.has(post.coverKey)) {
      const url = coverUrlCache.get(post.coverKey);
      URL.revokeObjectURL(url);
      objectUrls.delete(url);
      coverUrlCache.delete(post.coverKey);
    }
    await pushStateToServer({ silent: true });
    renderPosts();
    renderManager();
    showToast("本地文章已删除");
  }

  function renderSearch(query = "") {
    const normalized = query.trim().toLowerCase();
    const posts = normalized
      ? allPosts.filter((post) => {
          const searchable = [
            post.title,
            post.titleEn,
            post.excerpt,
            post.category,
            safeArray(post.tags).join(" "),
            safeArray(post.body).join(" ")
          ].join(" ").toLowerCase();
          return searchable.includes(normalized);
        })
      : allPosts.slice(0, 4);

    if (!posts.length) {
      el.searchResults.innerHTML = '<p class="no-results">没有找到相关内容。换个词试试。</p>';
      return;
    }

    el.searchResults.innerHTML = posts.map((post) => `
      <button class="search-result" type="button" data-post-id="${escapeHTML(post.id)}">
        <img src="${escapeHTML(coverSource(post))}" alt="">
        <div>
          <h4>${escapeHTML(post.title)}</h4>
          <p>${escapeHTML(post.excerpt)}</p>
        </div>
        <span>${escapeHTML(post.category)} · ${escapeHTML(post.date)}</span>
      </button>
    `).join("");
  }

  function openSearch() {
    renderSearch("");
    openLayer(el.searchModal);
    el.searchInput.value = "";
    window.setTimeout(() => el.searchInput.focus(), 80);
  }

  function safeFeedLink(value) {
    try {
      const url = new URL(value);
      if (!/^https?:$/.test(url.protocol)) return "";
      if (url.hostname !== "wufazhuce.com" && !url.hostname.endsWith(".wufazhuce.com")) return "";
      url.protocol = "https:";
      return url.href;
    } catch {
      return "";
    }
  }

  function safeFeedImage(value) {
    try {
      const url = new URL(value);
      if (!/^https?:$/.test(url.protocol) || url.hostname !== "image.wufazhuce.com") return "";
      url.protocol = "https:";
      return url.href;
    } catch {
      return "";
    }
  }

  function parseFeed(xmlText) {
    const xml = new DOMParser().parseFromString(xmlText, "application/xml");
    if (xml.querySelector("parsererror")) throw new Error("RSS 格式无法解析");
    return [...xml.querySelectorAll("channel > item")].map((item, index) => {
      const description = item.querySelector("description")?.textContent || "";
      const content = new DOMParser().parseFromString(description, "text/html");
      const image = content.querySelector(".one-imagen img")?.getAttribute("src")
        || content.querySelector("img")?.getAttribute("src")
        || "";
      const text = (selector) => content.querySelector(selector)?.textContent.trim() || "";
      return {
        title: item.querySelector("title")?.textContent.trim() || "「ONE · 一个」",
        link: safeFeedLink(item.querySelector("link")?.textContent.trim() || ""),
        category: item.querySelector("category")?.textContent.trim() || "阅读",
        volume: text(".one-titulo"),
        credit: text(".one-imagen-leyenda") || "「ONE · 一个」",
        quote: text(".one-cita"),
        image: safeFeedImage(image),
        fallbackImage: FALLBACK_FEED[index % FALLBACK_FEED.length].fallbackImage
      };
    }).filter((item) => item.link && item.image).slice(0, 7);
  }

  function renderFeed(items, { cached = false } = {}) {
    el.feedGrid.innerHTML = items.map((item) => {
      const linked = safeFeedLink(item.link);
      const image = safeFeedImage(item.image) || item.fallbackImage || FALLBACK_COVER;
      return `
        <a class="one-feed-card" href="${escapeHTML(linked)}" target="_blank" rel="noopener noreferrer">
          <div class="one-feed-image">
            <img src="${escapeHTML(image)}" alt="${escapeHTML(item.title)}" loading="lazy" data-fallback="${escapeHTML(item.fallbackImage || FALLBACK_COVER)}">
          </div>
          <div class="one-feed-copy">
            <div class="one-feed-meta">
              <span>${escapeHTML(item.volume || "ONE DAILY")}</span>
              <span>·</span>
              <span>${escapeHTML(item.credit || item.category)}</span>
            </div>
            <h3>${escapeHTML(item.title)}</h3>
            ${item.quote && item.quote !== item.title ? `<p>${escapeHTML(item.quote)}</p>` : ""}
            <span class="one-feed-open">
              <span data-site="feedOpenLabel">${escapeHTML(siteSettings.feedOpenLabel || SITE_DEFAULTS.feedOpenLabel)}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
            </span>
          </div>
        </a>
      `;
    }).join("");

    el.feedGrid.querySelectorAll("img[data-fallback]").forEach((image) => {
      image.addEventListener("error", () => {
        const fallback = image.dataset.fallback;
        if (fallback && image.src !== new URL(fallback, location.href).href) image.src = fallback;
      }, { once: true });
    });

    el.feedStatus.innerHTML = `<i></i>${cached ? "离线缓存" : "RSS 已更新"} · ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
    el.adminFeedCount.textContent = String(items.length).padStart(2, "0");
  }

  function cachedFeed() {
    try {
      const cache = JSON.parse(localStorage.getItem(FEED_CACHE_KEY) || "null");
      if (cache && Array.isArray(cache.items) && cache.items.length) return cache;
    } catch {
      localStorage.removeItem(FEED_CACHE_KEY);
    }
    return null;
  }

  async function loadFeed(force = false) {
    if (feedRequest) return feedRequest;
    if (STATIC_HOSTING) {
      renderFeed(FALLBACK_FEED, { cached: true });
      el.feedStatus.classList.add("is-error");
      el.feedStatus.innerHTML = "<i></i>RSS 静态快照";
      return;
    }
    el.feedRefresh.classList.add("is-loading");
    el.feedStatus.classList.remove("is-error");
    el.feedStatus.innerHTML = "<i></i>正在获取「ONE」";
    el.feedGrid.innerHTML = '<div class="one-feed-skeleton"></div><div class="one-feed-skeleton"></div><div class="one-feed-skeleton"></div><div class="one-feed-skeleton"></div>';

    feedRequest = (async () => {
      try {
        const response = await fetch(`${apiUrl("/api/wufazhuce-rss")}${force ? "?refresh=1" : ""}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const items = parseFeed(await response.text());
        if (!items.length) throw new Error("RSS 暂无内容");
        renderFeed(items);
        try {
          localStorage.setItem(FEED_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), items }));
        } catch {
          // Live feed still works when local cache storage is unavailable.
        }
      } catch {
        const cache = cachedFeed();
        const items = cache?.items || FALLBACK_FEED;
        renderFeed(items, { cached: true });
        el.feedStatus.classList.add("is-error");
        el.feedStatus.innerHTML = `<i></i>${cache ? "显示上次缓存" : "RSS 暂不可用"}`;
      } finally {
        el.feedRefresh.classList.remove("is-loading");
        feedRequest = null;
      }
    })();
    return feedRequest;
  }

  function closeMenu() {
    el.floatingMenu.classList.remove("is-open");
    el.floatingMenu.setAttribute("aria-hidden", "true");
    el.menuTrigger.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    const shouldOpen = !el.floatingMenu.classList.contains("is-open");
    el.floatingMenu.classList.toggle("is-open", shouldOpen);
    el.floatingMenu.setAttribute("aria-hidden", String(!shouldOpen));
    el.menuTrigger.setAttribute("aria-expanded", String(shouldOpen));
  }

  function renderManager() {
    const query = el.managerSearch.value.trim().toLowerCase();
    const source = managerFilter === "local" ? localPosts : allPosts;
    const posts = source.filter((post) => {
      if (!query) return true;
      return [
        post.title,
        post.titleEn,
        post.excerpt,
        post.category,
        safeArray(post.tags).join(" ")
      ].join(" ").toLowerCase().includes(query);
    });

    updatePostCounts();
    el.managerEmpty.hidden = posts.length !== 0;
    el.managerList.hidden = posts.length === 0;
    el.managerList.innerHTML = posts.map((post, index) => `
      <article class="manager-row ${post.isLocal ? "is-local" : ""}" data-manager-post="${escapeHTML(post.id)}">
        <span class="manager-row-number">${String(index + 1).padStart(2, "0")}</span>
        <img src="${escapeHTML(coverSource(post))}" alt="">
        <div class="manager-row-copy">
          <div class="manager-row-meta">
            <span class="local-badge">我的文章</span>
            <span>${escapeHTML(post.category)}</span>
            <span>·</span>
            <span>${escapeHTML(post.date || "未标注日期")}</span>
          </div>
          <h3>${escapeHTML(post.title)}</h3>
        </div>
        <div class="manager-row-actions">
          <button type="button" data-manager-action="view" data-post-id="${escapeHTML(post.id)}">查看</button>
          ${post.isLocal
            ? `<button type="button" data-manager-action="edit" data-post-id="${escapeHTML(post.id)}">编辑</button>
               <button type="button" data-manager-action="delete" data-post-id="${escapeHTML(post.id)}">删除</button>`
            : `<button type="button" data-manager-action="duplicate" data-post-id="${escapeHTML(post.id)}">复制</button>`}
        </div>
      </article>
    `).join("");
  }

  const ADMIN_VIEW_META = {
    overview: ["Dashboard", "后台概览"],
    articles: ["Content", "文章管理"],
    settings: ["Site copy", "站点文字"],
    data: ["Backup & publish", "数据与发布"]
  };

  function setAdminView(view) {
    activeAdminView = ADMIN_VIEW_META[view] ? view : "overview";
    el.adminNavButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.adminPanel === activeAdminView);
    });
    el.adminViews.forEach((panel) => {
      panel.hidden = panel.dataset.adminView !== activeAdminView;
    });
    const [eyebrow, title] = ADMIN_VIEW_META[activeAdminView];
    el.adminEyebrow.textContent = eyebrow;
    el.adminTitle.textContent = title;
    if (activeAdminView === "overview") renderAdminOverview();
    if (activeAdminView === "articles") renderManager();
    if (activeAdminView === "settings") renderSettingsForm();
  }

  function openAdmin(view = "overview") {
    closeMenu();
    setAdminView(view);
    openLayer(el.adminModal);
  }

  function openManager() {
    managerFilter = "all";
    el.managerSearch.value = "";
    el.managerTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.managerFilter === "all"));
    openAdmin("articles");
  }

  async function duplicatePost(id) {
    const source = allPosts.find((post) => post.id === id);
    if (!source) return;
    const copy = {
      ...source,
      id: `local-${Date.now()}`,
      title: `${source.title} · 副本`,
      date: formatDate(new Date()),
      titleEn: "Local entry",
      isLocal: true,
      cover: source.cover || "",
      coverKey: "",
      layout: "wide"
    };
    localPosts.unshift(copy);
    allPosts = [...localPosts, ...samplePosts];
    persistLocalPosts();
    await pushStateToServer({ silent: true });
    renderPosts();
    renderManager();
    showToast("已复制到我的文章");
  }

  async function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  function apiUrl(path) {
    return `${API_BASE}${path}`;
  }

  function setServerStatus(message, isError = false) {
    if (!el.serverSyncStatus) return;
    el.serverSyncStatus.textContent = message;
    el.serverSyncStatus.classList.toggle("is-error", isError);
  }

  function normalizeServerPosts(posts) {
    if (!Array.isArray(posts)) return [];
    return posts.filter((post) => (
      post && typeof post.id === "string" && typeof post.title === "string"
    )).map((post) => ({
      ...post,
      isLocal: true,
      coverKey: "",
      tags: safeArray(post.tags),
      body: safeArray(post.body).length
        ? safeArray(post.body)
        : String(post.body || "").split(/\n\s*\n/).filter(Boolean)
    }));
  }

  async function preparePostsForServer() {
    const posts = [];
    for (const post of localPosts) {
      const copy = { ...post };
      if (!copy.coverData) copy.coverData = "";
      if (post.coverKey) {
        try {
          const blob = await getCover(post.coverKey);
          if (blob) copy.coverData = await blobToDataURL(blob);
        } catch {
          // Text still syncs even if a legacy local image cannot be read.
        }
      }
      posts.push(copy);
    }
    return posts;
  }

  async function importBackupFile(file) {
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      if (!backup || !Array.isArray(backup.posts)) throw new Error("Invalid backup");
      const importedSettings = backup.settings && typeof backup.settings === "object"
        ? backup.settings
        : {};
      siteSettings = { ...SITE_DEFAULTS, ...importedSettings };
      const importedPosts = [];
      for (const [index, rawPost] of backup.posts.entries()) {
        if (!rawPost || typeof rawPost.id !== "string" || typeof rawPost.title !== "string") continue;
        const post = { ...rawPost, isLocal: true, coverKey: "" };
        if (rawPost.coverData) {
          try {
            const blob = await (await fetch(rawPost.coverData)).blob();
            const coverKey = `import-${Date.now()}-${index}`;
            await putCover(coverKey, blob);
            const url = URL.createObjectURL(blob);
            coverUrlCache.set(coverKey, url);
            objectUrls.add(url);
            post.cover = "";
            post.coverKey = coverKey;
          } catch {
            post.coverData = rawPost.coverData;
          }
        }
        if (!post.coverData) delete post.coverData;
        importedPosts.push(post);
      }
      localPosts = normalizeServerPosts(importedPosts);
      allPosts = [...localPosts, ...samplePosts];
      localStorage.setItem(SITE_KEY, JSON.stringify(siteSettings));
      persistLocalPosts();
      applySiteSettings();
      renderSettingsForm();
      renderPosts();
      renderManager();
      await pushStateToServer({ silent: true });
      showToast("备份已导入并同步到本机后台");
    } catch {
      showToast("备份文件无法读取或格式不正确");
    } finally {
      el.adminImportInput.value = "";
    }
  }

  async function pushStateToServer({ silent = false } = {}) {
    if (STATIC_HOSTING) {
      setServerStatus("GitHub Pages 静态模式：内容保存在当前浏览器");
      return false;
    }
    try {
      const response = await fetch(apiUrl("/api/state"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: siteSettings,
          posts: await preparePostsForServer()
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const state = await response.json();
      serverAvailable = true;
      serverRevision = Number(state.revision || 0);
      if (Array.isArray(state.posts)) {
        localPosts = normalizeServerPosts(state.posts);
        persistLocalPosts();
        allPosts = [...localPosts, ...samplePosts];
        renderPosts();
        renderManager();
      }
      setServerStatus(`已同步到本机后台 · ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`);
      if (!silent) showToast("已同步到本机后台");
      return true;
    } catch {
      serverAvailable = false;
      setServerStatus("未连接本地后台，内容暂存在当前浏览器", true);
      return false;
    }
  }

  async function hydrateFromServer() {
    if (STATIC_HOSTING) {
      serverAvailable = false;
      setServerStatus("GitHub Pages 静态模式：内容保存在当前浏览器");
      return false;
    }
    try {
      const response = await fetch(apiUrl("/api/state"), { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const state = await response.json();
      serverAvailable = true;
      serverRevision = Number(state.revision || 0);
      if (state.initialized) {
        siteSettings = { ...SITE_DEFAULTS, ...(state.settings || {}) };
        localStorage.setItem(SITE_KEY, JSON.stringify(siteSettings));
        localPosts = normalizeServerPosts(state.posts);
        persistLocalPosts();
        allPosts = [...localPosts, ...samplePosts];
        applySiteSettings();
        setServerStatus(`已连接本机后台 · 版本 ${serverRevision}`);
        return true;
      }

      const hasLocalContent = localPosts.length > 0
        || JSON.stringify(siteSettings) !== JSON.stringify(SITE_DEFAULTS);
      if (hasLocalContent) {
        await pushStateToServer({ silent: true });
        return true;
      }
      setServerStatus("后台已连接，等待首次保存");
      return false;
    } catch {
      serverAvailable = false;
      setServerStatus("本地后台未启动，当前使用浏览器存储", true);
      return false;
    }
  }

  async function refreshFromServer() {
    if (STATIC_HOSTING) return;
    if (document.querySelector(".modal-layer.is-open")) return;
    try {
      const response = await fetch(apiUrl("/api/state"), { cache: "no-store" });
      if (!response.ok) return;
      const state = await response.json();
      if (!state.initialized || Number(state.revision || 0) <= serverRevision) return;
      serverRevision = Number(state.revision || 0);
      serverAvailable = true;
      siteSettings = { ...SITE_DEFAULTS, ...(state.settings || {}) };
      localPosts = normalizeServerPosts(state.posts);
      allPosts = [...localPosts, ...samplePosts];
      localStorage.setItem(SITE_KEY, JSON.stringify(siteSettings));
      persistLocalPosts();
      applySiteSettings();
      renderPosts();
      renderManager();
      setServerStatus(`已读取其他浏览器的修改 · 版本 ${serverRevision}`);
    } catch {
      serverAvailable = false;
    }
  }

  function scheduleSettingsSync() {
    if (STATIC_HOSTING) {
      setServerStatus("GitHub Pages 静态模式：内容保存在当前浏览器");
      return;
    }
    window.clearTimeout(settingsSyncTimer);
    setServerStatus("正在保存到本机后台…");
    settingsSyncTimer = window.setTimeout(async () => {
      try {
        const response = await fetch(apiUrl("/api/settings"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: siteSettings })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const state = await response.json();
        serverAvailable = true;
        serverRevision = Number(state.revision || 0);
        setServerStatus(`文字已同步 · 版本 ${serverRevision}`);
      } catch {
        serverAvailable = false;
        setServerStatus("未连接本地后台，文字只保存在当前浏览器", true);
      }
    }, 450);
  }

  async function exportBackup() {
    showToast("正在整理备份…");
    const posts = [];
    for (const post of localPosts) {
      let coverData = "";
      if (post.coverKey) {
        try {
          const blob = await getCover(post.coverKey);
          if (blob) coverData = await blobToDataURL(blob);
        } catch {
          // Export the text even when an image can no longer be read.
        }
      }
      posts.push({ ...post, coverData });
    }
    const payload = JSON.stringify({
      site: "暮里 MULI",
      exportedAt: new Date().toISOString(),
      settings: siteSettings,
      posts
    }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `muli-backup-${formatDate(new Date()).replaceAll(".", "-")}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(localPosts.length ? "备份已导出" : "当前还没有本地文章，已导出空备份");
  }

  async function resetJournal() {
    if (!localPosts.length) {
      showToast("当前已经只有示例内容");
      return;
    }
    if (!window.confirm("确定删除全部本地文章和图片，恢复示例内容吗？")) return;
    const keys = localPosts.map((post) => post.coverKey).filter(Boolean);
    await Promise.all(keys.map(deleteCover));
    keys.forEach((key) => {
      const url = coverUrlCache.get(key);
      if (url) URL.revokeObjectURL(url);
    });
    coverUrlCache.clear();
    localPosts = [];
    allPosts = [...samplePosts];
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DRAFT_KEY);
    Object.keys(localStorage)
      .filter((key) => key.startsWith("muli-edit-draft-"))
      .forEach((key) => localStorage.removeItem(key));
    await pushStateToServer({ silent: true });
    renderPosts();
    renderManager();
    showToast("已恢复示例内容");
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#090a0b" : "#f3f0e9";
    el.themeLabel.textContent = theme === "dark" ? "Dark" : "Light";
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    setTheme(saved === "light" ? "light" : "dark");
  }

  function trapFocus(event) {
    if (event.key !== "Tab") return;
    const openLayerEl = document.querySelector(".modal-layer.is-open");
    if (!openLayerEl) return;
    const focusable = [...openLayerEl.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter((node) => node.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  el.worksGrid.addEventListener("click", (event) => {
    const link = event.target.closest("[data-post-id]");
    if (!link) return;
    event.preventDefault();
    openReader(link.dataset.postId);
  });

  document.querySelector(".hero-feature-card").addEventListener("click", (event) => {
    event.preventDefault();
    openReader(event.currentTarget.dataset.postId);
  });

  el.worksGrid.addEventListener("pointerover", (event) => {
    if (!event.target.closest(".work-link") || !window.matchMedia("(pointer: fine)").matches) return;
    el.cursor.classList.add("is-visible");
  });

  el.worksGrid.addEventListener("pointerleave", () => {
    el.cursor.classList.remove("is-visible");
  });

  document.addEventListener("pointermove", (event) => {
    if (!el.cursor.classList.contains("is-visible")) return;
    el.cursor.style.left = `${event.clientX}px`;
    el.cursor.style.top = `${event.clientY}px`;
  });

  el.filters.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      shuffled = false;
      el.filters.forEach((item) => item.classList.toggle("active", item === button));
      renderPosts();
    });
  });

  el.shuffleButton.addEventListener("click", () => {
    shuffled = !shuffled;
    renderPosts();
    showToast(shuffled ? "内容顺序已随机打乱" : "已恢复最近发布顺序");
  });

  el.readerModal.addEventListener("click", (event) => {
    if (event.target === el.readerModal || event.target.closest("[data-close='reader']")) {
      closeAllLayers();
    }
  });

  el.prevButton.addEventListener("click", () => openReader(el.prevButton.dataset.postId));
  el.nextButton.addEventListener("click", () => openReader(el.nextButton.dataset.postId));

  el.menuTrigger.addEventListener("click", toggleMenu);

  el.floatingMenu.addEventListener("click", (event) => {
    const navButton = event.target.closest("[data-scroll-target]");
    if (navButton) {
      closeMenu();
      document.querySelector(`#${navButton.dataset.scrollTarget}`)?.scrollIntoView({ behavior: "smooth" });
    }
  });

  document.addEventListener("click", (event) => {
    if (!el.floatingMenu.classList.contains("is-open")) return;
    if (event.target.closest("#floating-menu") || event.target.closest("#menu-trigger")) return;
    closeMenu();
  });

  document.querySelector(".menu-search").addEventListener("click", () => {
    closeMenu();
    openSearch();
  });

  document.querySelectorAll(".open-composer").forEach((button) => {
    button.addEventListener("click", () => openComposer());
  });

  document.querySelectorAll(".open-admin").forEach((button) => {
    button.addEventListener("click", () => openAdmin(button.dataset.adminViewTarget || "overview"));
  });

  el.composerModal.addEventListener("click", (event) => {
    if (event.target === el.composerModal || event.target.closest("[data-close='composer']")) {
      closeLayer(el.composerModal);
    }
  });

  el.composerForm.addEventListener("input", scheduleDraftSave);
  el.composerForm.addEventListener("change", scheduleDraftSave);
  el.composerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    savePost();
  });

  el.coverInput.addEventListener("change", () => {
    const file = el.coverInput.files[0];
    if (validateImage(file)) setPreviewCover(file);
  });

  ["dragenter", "dragover"].forEach((type) => {
    el.dropZone.addEventListener(type, (event) => {
      event.preventDefault();
      el.dropZone.classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach((type) => {
    el.dropZone.addEventListener(type, (event) => {
      event.preventDefault();
      el.dropZone.classList.remove("is-dragging");
    });
  });

  el.dropZone.addEventListener("drop", (event) => {
    const file = event.dataTransfer.files[0];
    if (validateImage(file)) setPreviewCover(file);
  });

  el.removeCover.addEventListener("click", (event) => {
    event.preventDefault();
    existingCoverKey = "";
    existingCoverPath = "";
    setPreviewCover(null);
  });

  document.querySelector(".search-trigger").addEventListener("click", openSearch);

  el.searchModal.addEventListener("click", (event) => {
    if (event.target === el.searchModal || event.target.closest("[data-close='search']")) {
      closeLayer(el.searchModal);
    }
    const result = event.target.closest(".search-result");
    if (result) {
      closeLayer(el.searchModal);
      openReader(result.dataset.postId);
    }
  });

  el.searchInput.addEventListener("input", () => renderSearch(el.searchInput.value));

  el.themeToggle.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "dark" ? "light" : "dark");
  });

  el.exportButton.addEventListener("click", exportBackup);
  el.resetButton.addEventListener("click", resetJournal);
  el.feedRefresh.addEventListener("click", () => loadFeed(true));
  el.adminBackupButton.addEventListener("click", exportBackup);
  el.adminDataBackup.addEventListener("click", exportBackup);
  el.adminImportButton.addEventListener("click", () => el.adminImportInput.click());
  el.adminImportInput.addEventListener("change", () => importBackupFile(el.adminImportInput.files[0]));
  el.adminResetButton.addEventListener("click", resetJournal);
  el.serverSyncButton.addEventListener("click", () => pushStateToServer());

  el.adminModal.addEventListener("click", async (event) => {
    if (event.target === el.adminModal || event.target.closest("[data-close='admin']")) {
      closeLayer(el.adminModal);
      return;
    }
    const viewButton = event.target.closest("[data-admin-panel]");
    if (viewButton) {
      setAdminView(viewButton.dataset.adminPanel);
      return;
    }
    const actionButton = event.target.closest("[data-manager-action]");
    if (!actionButton) return;
    const { managerAction, postId } = actionButton.dataset;
    if (managerAction === "view") {
      closeLayer(el.adminModal);
      openReader(postId);
    } else if (managerAction === "edit") {
      openComposer(postId);
    } else if (managerAction === "duplicate") {
      duplicatePost(postId);
    } else if (managerAction === "delete") {
      if (actionButton.dataset.confirmDelete === "true") {
        await removeLocalPost(postId, { skipConfirm: true });
        renderManager();
      } else {
        actionButton.dataset.confirmDelete = "true";
        actionButton.textContent = "确认删除";
        actionButton.classList.add("is-confirming");
        window.setTimeout(() => {
          if (!actionButton.isConnected) return;
          actionButton.dataset.confirmDelete = "false";
          actionButton.textContent = "删除";
          actionButton.classList.remove("is-confirming");
        }, 2800);
      }
    }
  });

  el.managerTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      managerFilter = tab.dataset.managerFilter;
      el.managerTabs.forEach((item) => item.classList.toggle("active", item === tab));
      renderManager();
    });
  });

  el.managerSearch.addEventListener("input", renderManager);

  el.settingsForm.addEventListener("input", () => {
    siteSettings = readSettingsForm();
    el.settingsSaveStatus.textContent = "正在自动保存…";
    persistSiteSettings();
  });

  el.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    siteSettings = readSettingsForm();
    persistSiteSettings();
    showToast("站点文字已保存");
  });

  el.settingsResetButton.addEventListener("click", () => {
    if (el.settingsResetButton.dataset.confirm !== "true") {
      el.settingsResetButton.dataset.confirm = "true";
      el.settingsResetButton.textContent = "再点一次确认";
      window.setTimeout(() => {
        if (!el.settingsResetButton.isConnected) return;
        el.settingsResetButton.dataset.confirm = "false";
        el.settingsResetButton.textContent = "恢复默认文案";
      }, 2800);
      return;
    }
    siteSettings = { ...SITE_DEFAULTS };
    persistSiteSettings();
    renderSettingsForm();
    el.settingsResetButton.dataset.confirm = "false";
    el.settingsResetButton.textContent = "恢复默认文案";
    showToast("已恢复默认站点文字");
  });

  document.addEventListener("keydown", (event) => {
    trapFocus(event);
    if (event.key === "Escape") {
      closeAllLayers();
      el.cursor.classList.remove("is-visible");
    }
    const isTyping = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (event.key === "/" && !isTyping && !document.querySelector(".modal-layer.is-open")) {
      event.preventDefault();
      openSearch();
    }
  });

  function updateScrollUI() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    el.progress.style.transform = `scaleX(${progress})`;
  }

  window.addEventListener("scroll", updateScrollUI, { passive: true });
  window.addEventListener("focus", refreshFromServer);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshFromServer();
  });
  window.setInterval(refreshFromServer, 15000);

  window.addEventListener("beforeunload", () => {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
  });

  async function init() {
    initTheme();
    applySiteSettings();
    updatePreview();
    updateScrollUI();
    await hydrateLocalCovers();
    await hydrateFromServer();
    applySiteSettings();
    renderPosts();
    loadFeed();

    if (location.hash.startsWith("#post=")) {
      const id = decodeURIComponent(location.hash.slice(6));
      window.setTimeout(() => openReader(id, { updateHistory: false }), 100);
    }
  }

  init();
})();
