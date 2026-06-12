/* Review Reply Agent — main app (calm restyle) */
const { useState, useEffect, useMemo, useRef } = React;

/* ---------------- Sidebar ---------------- */
function Sidebar({ onSwitch }) {
  const nav = [
    { icon: "pin", label: "My Locations" },
    { icon: "prompt", label: "Prompts" },
    { icon: "chart", label: "Competitors" },
    { icon: "megaphone", label: "Social Posting" },
  ];
  const tail = [{ icon: "zap", label: "Marketing" }, { icon: "euro", label: "Finance" }];
  const [revOpen, setRevOpen] = useState(true);
  return (
    <aside className="sb">
      <button className="sb-head" aria-label="Switch location" onClick={onSwitch}>
        <div className="sb-mark"><Logomark size={13} /></div>
        <div className="sb-name">Bar Sumac</div>
        <span className="sb-head-chev"><Icon.chevrons /></span>
      </button>

      <div className="sb-section">
        {nav.map((n) => (<button className="sb-item" key={n.label}>{React.createElement(Icon[n.icon])}{n.label}</button>))}
        <button className="sb-item" onClick={() => setRevOpen(!revOpen)}>
          <Icon.reviews />Review Management
          <span style={{ marginLeft: "auto", color: "var(--faint)", display: "inline-flex", transform: revOpen ? "none" : "rotate(-90deg)", transition: "transform .15s" }}><Icon.chevronD width={13} height={13} /></span>
        </button>
        {revOpen && (
          <div className="sb-sub">
            <button className="sb-subitem">Inbox</button>
            <button className="sb-subitem">Response templates</button>
            <button className="sb-subitem active">Review Reply Agent</button>
          </div>
        )}
        {tail.map((n) => (<button className="sb-item" key={n.label}>{React.createElement(Icon[n.icon])}{n.label}</button>))}
      </div>

      <div className="sb-section" style={{ marginTop: "auto" }}>
        <button className="sb-item"><Icon.gear />Settings</button>
        <button className="sb-item"><Icon.info />Information</button>
      </div>

      <div className="sb-foot">
        <div className="avatar">BS</div>
        <div style={{ lineHeight: 1.25, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--ink)" }}>Fleur de Vries</div>
          <div style={{ fontSize: 12, color: "var(--faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>fleur@barsumac.nl</div>
        </div>
      </div>
    </aside>
  );
}

/* ---------------- Hero ---------------- */
function Hero({ pending, onReview, onEditRules }) {
  const gradientRef = useRef(null);
  useEffect(() => {
    if (!gradientRef.current || !window.lottie) return;
    const anim = window.lottie.loadAnimation({
      container: gradientRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "assets/blue-gradient.json",
    });
    return () => anim.destroy();
  }, []);

  return (
    <div className="hero">
      <div className="hero-lottie" ref={gradientRef} aria-hidden="true"></div>
      <div className="hero-l">
        <h1 className="hero-title">10 reviews handled for you</h1>
        <p className="hero-sub">I sent safe replies automatically and prepared 4 drafts that are ready for your review.</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={onReview}>Review outstanding drafts</button>
        </div>
      </div>
      <div className="hero-art"><img src="assets/reviews-illustration.svg" alt="Review replies" /></div>
    </div>
  );
}

/* ---------------- Stats — 3 plain ---------------- */
function StatCards({ pending }) {
  const items = [
    { label: "Replies sent", value: "47" },
    { label: "Time saved", value: "2h 44m" },
    { label: "Need approval", value: String(pending) },
  ];
  return (
    <div className="stats">
      {items.map((s) => (
        <div className="stat" key={s.label}>
          <div className="s-label">{s.label}</div>
          <div className="s-value">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Needs attention — inbox ---------------- */
function NeedsAttention({ items, onOpen, sectionRef }) {
  return (
    <div className="section" ref={sectionRef}>
      <div className="section-h">
        <h2>Needs your attention</h2>
        <span className="sub">{items.length > 0 ? items.length + " waiting" : "All handled"}</span>
      </div>
      <div className="attn">
        {items.length === 0 ? (
          <div className="empty-calm">
            <span className="ec-check"><Icon.check /></span>
            <div className="ec-t">You're all caught up</div>
            <div className="ec-s">Every flagged review has been handled. New ones will appear here.</div>
          </div>
        ) : items.map((r) => (
          <div className="attn-row" key={r.id} onClick={() => onOpen(r)}>
            <div className="attn-rev">
              <div className="attn-top">
                <span className="attn-name">{r.name}</span>
                <span className="attn-stars"><Stars rating={r.rating} size={13} /></span>
                <span className="attn-src">{r.platform}</span>
              </div>
              <div className="attn-text">{r.text}</div>
            </div>
            <div className="attn-action">
              <button className="attn-link" onClick={(e) => { e.stopPropagation(); onOpen(r); }}>Review reply<Icon.arrowRight /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Activity timeline ---------------- */
function ActivityFeed() {
  const items = window.RRA_DATA.ACTIVITY;
  return (
    <div>
      <h3 className="col-h">Recent activity</h3>
      <div className="timeline">
        {items.map((a, i) => (
          <div className="tl-row" key={i}>
            <div className="tl-rail">
              <span className={"tl-dot" + (a.type === "sent" ? " sent" : "")}></span>
              <span className="tl-line"></span>
            </div>
            <div className="tl-body">
              <div className="tl-text" dangerouslySetInnerHTML={{ __html: a.text }} />
              <div className="tl-time">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- How it works ---------------- */
function HowItWorks({ settings, onEdit }) {
  const D = window.RRA_DATA;
  const toneLabel = (D.TONES.find((t) => t.key === settings.tone) || {}).title || "Professional";
  const locCount = Object.values(settings.locations).filter(Boolean).length;
  const items = [
    <span>Auto-sends replies to <b>4–5 star</b> reviews</span>,
    <span>Drafts replies for <b>1–3 star</b> reviews, saved for approval</span>,
    <span>Writes in your <b>{toneLabel}</b> tone</span>,
    <span>Works across <b>{locCount} connected locations</b></span>,
  ];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <h3 className="col-h" style={{ margin: 0 }}>How your agent works</h3>
        <span className="link" style={{ fontSize: 13.5, color: "var(--navy)", fontWeight: 500, cursor: "pointer" }} onClick={onEdit}>Edit rules</span>
      </div>
      <div className="howlist">
        {items.map((c, i) => (<div className="how-item" key={i}><span className="hk"><Icon.check /></span><span className="ht">{c}</span></div>))}
      </div>
      <div className="how-note"><b>Sensitive reviews are never sent automatically.</b> Low ratings, complaints and unclear reviews are saved for your approval first.</div>
    </div>
  );
}

/* ---------------- Reviews — shared row list ---------------- */
function ReviewRows({ rows, onOpen, emptyLabel = "No reviews match your search.", selectionMode = false, selectedIds = [], onToggleSelect, isSelectable = () => true }) {
  const D = window.RRA_DATA;
  const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const selected = new Set(selectedIds);

  return (
    <div className="hlist">
      {rows.map((h) => {
        const meta = D.STATUS_META[h.status];
        const isSelected = selected.has(h.id);
        const canSelect = isSelectable(h);
        return (
          <div className={"hrow" + (selectionMode ? " selectable" : "") + (selectionMode && !canSelect ? " disabled-select" : "") + (isSelected ? " selected" : "")} key={h.id}
            onClick={() => selectionMode ? (canSelect && onToggleSelect(h.id)) : onOpen(h)}>
            {selectionMode && (
              <label className="bulk-check" aria-label={"Select review from " + h.name} onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" checked={isSelected} disabled={!canSelect} onChange={() => canSelect && onToggleSelect(h.id)} />
                <span className="bulk-box">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                    <path d="M2 5.6L4.3 8L9 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </label>
            )}
            <div className="hrow-head">
              <div className="hrow-person">
                <div className={"hglyph " + avatarTone(h.id || h.name)}>
                  {initials(h.name)}
                  {h.isNew && h.status !== "auto" && <span className="new-dot" title="New review" aria-label="New review"></span>}
                </div>
                <div className="htop">
                  <span className="hname">{h.name}</span>
                  <Stars rating={h.rating} size={12} />
                </div>
              </div>
              <div className="hright">
                <div className={"hcell hstatus st-" + h.status}>
                  {h.status === "auto" ? <span className="st-ai-icon" aria-hidden="true"></span> : <span className="sd"></span>}
                  <span className="hstatus-label">{meta.label}</span>
                </div>
                <div className="hcell hcell-src" title={h.platform}><PlatformMark platform={h.platform} size={18} /></div>
                <div className="hcell hcell-date">{relTime(h.date)}</div>
              </div>
            </div>
            <div className="hrow-content">
              <div className="hcopy hreview">{h.review}</div>
              {h.status !== "unanswered" && h.reply && h.reply !== "—" && (
                <div className="hreply">
                  <img className="hreply-icon" src="assets/reply-curve-down-right.svg" alt="" aria-hidden="true" />
                  <span className="hcopy hreply-text">{h.reply}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {rows.length === 0 && <div className="hempty">{emptyLabel}</div>}
    </div>
  );
}

function RecentReviews({ onOpen, onAllReviews }) {
  const D = window.RRA_DATA;
  const rows = D.HISTORY.slice(0, 15);
  return (
    <div className="section recent-reviews">
      <div className="section-h">
        <div>
          <h2>Incoming reviews</h2>
        </div>
      </div>
      <div className="recent-preview">
        <ReviewRows rows={rows} onOpen={onOpen} emptyLabel="No recent reviews yet." />
        <div className="recent-fade">
          <button className="btn btn-secondary btn-sm" onClick={onAllReviews}>All reviews</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- History — open list ---------------- */
function HistoryView({ onOpen, onToast, initialFilter = "all" }) {
  const D = window.RRA_DATA;
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkReviews, setBulkReviews] = useState(null);
  const counts = useMemo(() => {
    const c = { all: D.HISTORY.length };
    D.HISTORY.forEach((h) => { c[h.status] = (c[h.status] || 0) + 1; });
    return c;
  }, []);
  const q = query.trim().toLowerCase();
  const ALL_STATUSES = ["unanswered", "sent", "auto", "failed"];
  const ALL_RATINGS = [5, 4, 3, 2, 1];
  const LOCATIONS = ["Amsterdam Centrum", "Rotterdam Markthal", "Utrecht Domplein"];
  const FILTER_DEFAULTS = { business: "all", location: "all", dateRange: "", statuses: ALL_STATUSES, ratings: ALL_RATINGS };
  const [advOpen, setAdvOpen] = useState(false);
  const [applied, setApplied] = useState(FILTER_DEFAULTS);
  const [draft, setDraft] = useState(FILTER_DEFAULTS);
  const openFilters = () => { setDraft(applied); setAdvOpen(true); };
  const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  useEffect(() => setFilter(initialFilter), [initialFilter]);

  const activeCount =
    (applied.business !== "all" ? 1 : 0) +
    (applied.location !== "all" ? 1 : 0) +
    (applied.dateRange ? 1 : 0) +
    (applied.statuses.length !== ALL_STATUSES.length ? 1 : 0) +
    (applied.ratings.length !== ALL_RATINGS.length ? 1 : 0);

  const rows = D.HISTORY.filter((h) =>
    (filter === "all" || h.status === filter) &&
    (applied.location === "all" || h.loc === applied.location) &&
    applied.statuses.includes(h.status) &&
    applied.ratings.includes(h.rating) &&
    (!q || h.name.toLowerCase().includes(q) || h.review.toLowerCase().includes(q))
  );
  const rowById = new Map(rows.map((h) => [h.id, h]));
  const canBulkSelect = (h) => h.status !== "sent" && h.status !== "auto";
  const visibleIds = rows.map((h) => h.id);
  const selectableVisibleIds = rows.filter(canBulkSelect).map((h) => h.id);
  const selectedVisibleIds = selectedIds.filter((id) => visibleIds.includes(id) && rowById.has(id) && canBulkSelect(rowById.get(id)));
  const allVisibleSelected = selectableVisibleIds.length > 0 && selectedVisibleIds.length === selectableVisibleIds.length;
  const toggleSelect = (id) => {
    const row = rowById.get(id);
    if (!row || !canBulkSelect(row)) return;
    setSelectedIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  };
  const selectAllVisible = () => setSelectedIds((ids) => Array.from(new Set([...ids, ...selectableVisibleIds])));
  const clearVisibleSelection = () => setSelectedIds((ids) => ids.filter((id) => !visibleIds.includes(id)));
  const exitBulkMode = () => { setBulkMode(false); setSelectedIds([]); };
  const generateSelected = () => {
    if (selectedVisibleIds.length === 0) return;
    setBulkReviews(rows.filter((h) => selectedVisibleIds.includes(h.id)));
  };

  return (
    <div className={"section" + (bulkMode ? " bulk-mode" : "")}>
      <div className="section-h">
        <div>
          <h2>Reply history</h2>
          <div className="sub" style={{ marginTop: 4 }}>Every reply your agent has sent, automated, or left for you.</div>
        </div>
      </div>

      <label className="hsearch">
        <Icon.search />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search history…" />
      </label>

      <div className="hbar">
        <div className="chips">
          {D.HISTORY_FILTERS.map((f) => (
            <button key={f.key} className={"chip" + (filter === f.key ? " active" : "")} onClick={() => setFilter(f.key)}>
              {f.label}{counts[f.key] != null && <span className="cn">{counts[f.key]}</span>}
            </button>
          ))}
        </div>
        <div className="htools">
          <button className={"btn btn-sm" + (bulkMode ? " btn-secondary" : " btn-outline")} onClick={() => bulkMode ? exitBulkMode() : setBulkMode(true)}>
            {bulkMode ? "Cancel" : "Bulk reply"}
          </button>
          <div className="flt-wrap">
            <button className={"btn btn-sm flt-btn" + (activeCount ? " active" : "")} onClick={openFilters}>
              <img className="filter-icon" src="assets/filter-text-streamline-micro.svg" alt="" aria-hidden="true" />Filters
              {activeCount > 0 && <span className="flt-badge">{activeCount}</span>}
            </button>
            {activeCount > 0 && (
              <button className="flt-clear" title="Clear filters" onClick={() => setApplied(FILTER_DEFAULTS)} aria-label="Clear filters"><Icon.x /></button>
            )}
            {advOpen && (
              <React.Fragment>
                <div className="menu-backdrop" onClick={() => setAdvOpen(false)}></div>
                <div className="fltpanel" role="dialog" aria-label="Filter reviews">
                  <div className="fltpanel-head">
                    <h4>Filter reviews</h4>
                    <div className="fltpanel-head-r">
                      <button className="flt-clearall" onClick={() => setDraft(FILTER_DEFAULTS)}>Clear all</button>
                      <button className="x-btn" onClick={() => setAdvOpen(false)} aria-label="Close"><Icon.x /></button>
                    </div>
                  </div>
                  <div className="fltpanel-body">
                    <div className="flt-group">
                      <label className="flt-label">Businesses</label>
                      <div className="flt-select">
                        <select value={draft.business} onChange={(e) => setDraft({ ...draft, business: e.target.value })}>
                          <option value="all">All businesses</option>
                          <option value="sumac">Bar Sumac</option>
                        </select>
                        <Icon.chevronD />
                      </div>
                    </div>
                    <div className="flt-group">
                      <label className="flt-label">Location</label>
                      <div className="flt-select">
                        <select value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })}>
                          <option value="all">All locations</option>
                          {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <Icon.chevronD />
                      </div>
                    </div>
                    <div className="flt-group">
                      <label className="flt-label">Date range</label>
                      <button className="flt-daterange"><Icon.calendar /><span>Select date range</span></button>
                    </div>
                    <div className="flt-group">
                      <label className="flt-label">Status</label>
                      <div className="flt-checks">
                        {ALL_STATUSES.map((s) => (
                          <label key={s} className="flt-check">
                            <input type="checkbox" checked={draft.statuses.includes(s)} onChange={() => setDraft({ ...draft, statuses: toggleIn(draft.statuses, s) })} />
                            <span className="flt-box">
                              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                                <path d="M2 5.6L4.3 8L9 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                            {D.STATUS_META[s].label}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flt-group">
                      <label className="flt-label">Star rating</label>
                      <div className="flt-checks">
                        {ALL_RATINGS.map((r) => (
                          <label key={r} className="flt-check">
                            <input type="checkbox" checked={draft.ratings.includes(r)} onChange={() => setDraft({ ...draft, ratings: toggleIn(draft.ratings, r) })} />
                            <span className="flt-box">
                              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                                <path d="M2 5.6L4.3 8L9 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                            <Stars rating={r} size={13} />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="fltpanel-foot">
                    <button className="btn btn-outline btn-sm" onClick={() => setAdvOpen(false)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={() => { setApplied(draft); setAdvOpen(false); }}>Apply</button>
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>

      {bulkMode && (
        <div className="bulk-topbar" aria-label="Bulk selection controls">
          <label className="bulk-select-all">
            <input type="checkbox" checked={allVisibleSelected} disabled={selectableVisibleIds.length === 0} onChange={(e) => e.target.checked ? selectAllVisible() : clearVisibleSelection()} />
            <span className="bulk-box">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <path d="M2 5.6L4.3 8L9 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Select all available
          </label>
          <button className="bulk-link" onClick={clearVisibleSelection} disabled={selectedVisibleIds.length === 0}>Clear selection</button>
        </div>
      )}

      <ReviewRows rows={rows} onOpen={onOpen} emptyLabel="No reviews match your search."
        selectionMode={bulkMode} selectedIds={selectedIds} onToggleSelect={toggleSelect} isSelectable={canBulkSelect} />

      {bulkMode && (
        <div className="bulk-actionbar" role="region" aria-label="Bulk actions">
          <div className="bulk-actionbar__meta">
            <strong>{selectedVisibleIds.length}</strong>
            <span>selected</span>
          </div>
          <div className="bulk-actionbar__actions">
            <button className="btn btn-ghost btn-sm" onClick={exitBulkMode}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={generateSelected} disabled={selectedVisibleIds.length === 0}>
              Generate replies
            </button>
          </div>
        </div>
      )}

      {bulkReviews && (
        <BulkReplyModal reviews={bulkReviews}
          onClose={() => setBulkReviews(null)}
          onSave={() => {
            setBulkReviews(null);
            exitBulkMode();
            onToast("Drafts saved for review");
          }} />
      )}
    </div>
  );
}

/* ---------------- Settings tab ---------------- */
function SettingsTab({ settings, setSettings, onSaved }) {
  const [savedSnap, setSavedSnap] = useState(() => JSON.stringify(settings));
  const dirty = JSON.stringify(settings) !== savedSnap;
  const save = () => { setSavedSnap(JSON.stringify(settings)); onSaved(); };
  return (
    <div style={{ maxWidth: 880, display: "flex", flexDirection: "column", gap: 28 }}>
      <SettingsForm settings={settings} setSettings={setSettings} />
      <div className="set-foot">
        <span className={"b ghost " + (dirty ? "error" : "success")}>
          <span className="dot"></span>
          {dirty ? "Unsaved changes" : "All changes saved"}
        </span>
        <button className="btn btn-primary" onClick={save} disabled={!dirty}>Save changes</button>
      </div>
    </div>
  );
}

/* ---------------- App ---------------- */
function App() {
  const D = window.RRA_DATA;
  const [tab, setTab] = useState("overview");
  const [modal, setModal] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [chat, setChat] = useState(null);
  const [onboard, setOnboard] = useState(false);
  const [toast, setToast] = useState(null);
  const [resolved, setResolved] = useState({});
  const [historyInitialFilter, setHistoryInitialFilter] = useState("all");
  const [settings, setSettings] = useState({
    enabled: true,
    stars: { 1: "off", 2: "off", 3: "off", 4: "send", 5: "send" },
    tone: "pro",
    rules: "1. Sign-off: Team Bar Sumac.\n2. Languages: Dutch and English. Always reply in the language of the review. Reviews in another language are answered in English.\n3. Ratings: Only 4 and 5 star reviews are auto-replied. 1, 2 and 3 star reviews are flagged to the team to answer personally.\n4. Tone: Warm, modern neighbourhood restaurant tone, generous and grounded, never stiff. Keep replies personal and direct, with a relaxed Mediterranean feel only when it reads naturally. Do not sound overly formal, touristy, or generic.\n5. Greeting: Guest name is filled in automatically. Dutch: Beste {name}. English: Hi {name}.\n6. Length: Short and to the point. No long paragraphs. Always end every reply with a period.\n7. Punctuation: Never use em dashes. Use commas, periods, or short sentences instead.\n8. Specific mentions: Mention maximum one specific point and only when it reads naturally. Refer to dinner, drinks, the team, the kitchen or the terrace only when the guest brings it up. Food compliments go to the kitchen team.\n9. Emojis: Never, unless the review itself is very informal and uses an emoji. Then one matching emoji is fine.\n10. Never say or promise: Never mention or compare to other venues or competitors. Never promise refunds, free items, vouchers or compensation. Never invent details such as dishes, prices or events that are not in the review. Stay calm and never defensive when a review contains criticism.\n11. Feedback on pricing: If it feels natural, thank them for their feedback. Do not go into detailed explanations or discussions about pricing.",
    locations: { ams: true, rot: true, utr: false },
  });
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const pendingItems = D.ATTENTION.filter((r) => !resolved[r.id]);

  const openHistory = (h) => {
    setChat({
      id: h.id, name: h.name, rating: h.rating, loc: h.loc, platform: h.platform,
      date: h.date, time: h.time, text: h.review, reply: h.reply === "—" ? "" : h.reply, status: h.status,
    });
  };

  const resolveReview = (id) => { setResolved((r) => ({ ...r, [id]: true })); setModal(null); setToast("Reply sent"); };
  const sendChatReply = (id) => { setResolved((r) => ({ ...r, [id]: true })); setToast("Reply sent"); };

  const reviewPending = () => {
    setHistoryInitialFilter("unanswered");
    setTab("history");
  };

  const openAllReviews = () => {
    setHistoryInitialFilter("all");
    setTab("history");
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "history", label: "All reviews", count: D.HISTORY.length },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="app">
      <main className="main">
        <header className="ph">
          <div className="ph-l">
            <ol className="bc">
              <li><a className="bc-link">Bar Sumac</a></li>
              <li className="bc-sep"><Icon.chevronR width={13} height={13} /></li>
              <li><a className="bc-link">Review Management</a></li>
              <li className="bc-sep"><Icon.chevronR width={13} height={13} /></li>
              <li><span className="bc-page">Review Reply Agent</span></li>
            </ol>
          </div>
          <div className="ph-r"></div>
        </header>

        <div className="page">
          <div className="page-head">
            <div>
              <h1 className="page-title">Review Reply Agent</h1>
              <div className="page-sub"><span className="agent-tag"><span className="agent-tag-dot"></span>Jonathan</span> drafts, checks, and sends review replies based on your rules.</div>
            </div>
          </div>

          <div className="ptabs">
            {tabs.map((t) => (
              <button key={t.key} className={"ptab" + (tab === t.key ? " active" : "")} onClick={() => { if (t.key === "history") setHistoryInitialFilter("all"); setTab(t.key); }}>
                {t.label}{t.count != null && <span className="count">{t.count}</span>}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="fade-in overview-stack">
              <StatCards pending={pendingItems.length} />
              <Hero pending={pendingItems.length} onReview={reviewPending} onEditRules={() => setDrawer(true)} />
              <RecentReviews onOpen={openHistory} onAllReviews={openAllReviews} />
            </div>
          )}

          {tab === "history" && <div className="fade-in"><HistoryView onOpen={openHistory} onToast={setToast} initialFilter={historyInitialFilter} /></div>}
          {tab === "settings" && <div className="fade-in"><SettingsTab settings={settings} setSettings={setSettings} onSaved={() => setToast("Settings saved")} /></div>}
        </div>
      </main>

      {modal && <ReviewModal review={modal} onClose={() => setModal(null)} onResolve={resolveReview} />}
      {chat && <ReviewChatSheet key={chat.id} review={chat} onClose={() => setChat(null)} onSend={sendChatReply} />}
      {drawer && <SettingsDrawer settings={settings} setSettings={setSettings} onClose={() => setDrawer(false)} onSave={() => { setDrawer(false); setToast("Settings saved"); }} />}
      {onboard && <Onboarding settings={settings} setSettings={setSettings} onClose={() => setOnboard(false)} onComplete={() => { setOnboard(false); setTab("overview"); setToast("Your review agent is live"); }} />}

      {toast && <div className="toast"><Icon.check />{toast}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
