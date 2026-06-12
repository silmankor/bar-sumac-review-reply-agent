/* Review Reply Agent — Review modal, Settings (shared form + drawer), Onboarding */
const { useState, useEffect, useRef } = React;

function ScrimWrap({ side = "center", onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);
  return (
    <div className={"scrim " + side} ref={ref}
      onMouseDown={(e) => { if (e.target === ref.current) onClose(); }}>
      {children}
    </div>
  );
}

const Switch = ({ on, onClick }) => (
  <button className={"sw" + (on ? " on" : "")} onClick={onClick} role="switch" aria-checked={on} aria-label="toggle" />
);

const Seg = ({ value, options, onChange }) => (
  <div className="seg" role="group">
    {options.map((o) => (
      <button key={o.key} className={value === o.key ? "on" : ""} onClick={() => onChange(o.key)}>{o.label}</button>
    ))}
  </div>
);

function revealChunks(text, seed = "reply") {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const chunks = [];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;

  for (let i = 0; i < words.length;) {
    hash = (hash * 1664525 + 1013904223) | 0;
    const take = Math.abs(hash) % 5 < 2 ? 2 : 1;
    chunks.push(words.slice(i, i + take).join(" "));
    i += take;
  }
  return chunks;
}

function revealDuration(text) {
  return Math.min(3400, Math.max(1600, revealChunks(text).length * 72 + 900));
}

function WordReveal({ text, seed }) {
  return (
    <React.Fragment>
      {revealChunks(text, seed).map((chunk, i) => (
        <span key={i} className="reply-reveal__seg" style={{ animationDelay: (i * 0.072) + "s" }}>{chunk + " "}</span>
      ))}
    </React.Fragment>
  );
}

/* ---------------- Shared settings form ---------------- */
function SettingsForm({ settings, setSettings }) {
  const D = window.RRA_DATA;
  const s = settings;
  const set = (patch) => setSettings({ ...s, ...patch });
  const segOpts = [
    { key: "off", label: "Off" },
    // Temporarily hidden: { key: "draft", label: "Draft only" },
    { key: "send", label: "Auto-send" },
  ];
  return (
    <div className="set-form">
      <div className="set-row">
        <div className="set-row-l"><h4>Auto-reply</h4><p>When on, the agent sends safe replies automatically.</p></div>
        <div className="set-row-r set-row-r--inline">
          <div className="sw-field">
            <Switch on={s.enabled} onClick={() => set({ enabled: !s.enabled })} />
            <span className="sw-label" onClick={() => set({ enabled: !s.enabled })}>Enable auto reply</span>
          </div>
        </div>
      </div>

      {s.enabled && (
      <React.Fragment>
      <div className="set-row">
        <div className="set-row-l"><h4>When reviews come in</h4><p>Choose what the agent does for each rating.</p></div>
        <div className="set-row-r">
          <div className="rules">
            {[5, 4, 3, 2, 1].map((r) => (
              <div className="rule-row" key={r}>
                <div className="rule-left">
                  <span className="rule-stars"><Stars rating={r} size={13} /></span>
                  <span className="rule-label">{r} star{r > 1 ? "s" : ""}</span>
                </div>
                <Seg value={s.stars[r] || "off"} options={segOpts} onChange={(v) => set({ stars: { ...s.stars, [r]: v } })} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="set-row">
        <div className="set-row-l"><h4>Tone of voice</h4><p>Every reply is written in this voice.</p></div>
        <div className="set-row-r">
          <div className="tone-list">
            {D.TONES.map((t) => (
              <button key={t.key} className={"tone-row" + (s.tone === t.key ? " sel" : "")} onClick={() => set({ tone: t.key })}>
                <span className="tone-radio"></span>
                <span className="tone-m"><span className="tone-t">{t.title}</span><span className="tone-d">{t.desc}</span></span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="set-row">
        <div className="set-row-l"><h4>House rules</h4><p>Custom instructions the agent follows on every reply.</p></div>
        <div className="set-row-r">
          <div className="textarea-wrap">
            <textarea className="set-area" value={s.rules} onChange={(e) => set({ rules: e.target.value })} />
            <svg className="resize-grip" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"><path d="M9 4 4 9"></path><path d="M9 8 8 9"></path></svg>
          </div>
        </div>
      </div>
      </React.Fragment>
      )}
    </div>
  );
}

/* ---------------- Review detail modal — focused ---------------- */
function ReviewModal({ review, onClose, onResolve }) {
  const [reply, setReply] = useState(review.reply);
  const [regen, setRegen] = useState(false);
  const [fresh, setFresh] = useState(false);

  const ACTION = {
    approval: "Send reply", draft: "Send reply", tone: "Send reply",
    failed: "Retry", skipped: "Draft & send", sent: null,
  };
  const actionLabel = ACTION[review.status] || "Send reply";

  function regenerate() {
    setFresh(false);
    setRegen(true);
    setTimeout(() => {
      setRegen(false);
      setFresh(true);
      setTimeout(() => setFresh(false), revealDuration(reply));
    }, 1000);
  }

  const initials = review.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <ScrimWrap side="center" onClose={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={"Review from " + review.name}>
        <div className="modal-head">
          <div className="rm-id">
            <div className={"rm-avatar " + avatarTone(review.id || review.name)}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <h3 className="rm-name">{review.name}</h3>
              <div className="rm-channel"><PlatformMark platform={review.platform} size={15} />{review.platform}</div>
            </div>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="Close"><Icon.x /></button>
        </div>

        <div className="modal-body">
          {/* INPUT — the customer review */}
          <div className="rm-review">
            <div className="rm-review-top">
              <Stars rating={review.rating} size={16} />
              {review.ago && <span className="rm-date">{review.ago}</span>}
            </div>
            <p className="rm-review-text">{review.text}</p>
          </div>

          {/* OUTPUT — suggested reply, using the DS "AI layer" */}
          <div className="ai-layer">
            <div className="ai-layer__head">
              <div className="ai-layer__title"><span className="ai-layer__spark"></span>Suggested reply</div>
              <div className="ai-layer__sub">Generated using your tone and house rules.</div>
            </div>
            <div className="ai-layer__card">
              {regen ? (
                <div className="reply-skel" aria-label="Regenerating reply">
                  <div className="reply-skel__row">
                    <span className="reply-skel__line" style={{ width: "100%", "--grow-delay": "0ms" }}></span>
                  </div>
                  <div className="reply-skel__row">
                    <span className="reply-skel__line" style={{ width: "47%", "--grow-delay": "160ms" }}></span>
                    <span className="reply-skel__line" style={{ width: "45%", "--grow-delay": "320ms" }}></span>
                  </div>
                  <div className="reply-skel__row">
                    <span className="reply-skel__line" style={{ width: "26%", "--grow-delay": "480ms" }}></span>
                    <span className="reply-skel__line" style={{ width: "27%", "--grow-delay": "640ms" }}></span>
                  </div>
                  <div className="reply-skel__row">
                    <span className="reply-skel__line" style={{ width: "73%", "--grow-delay": "800ms" }}></span>
                  </div>
                </div>
              ) : (
                <React.Fragment>
                  <textarea className={"ai-layer__area" + (fresh ? " revealing" : "")} rows="5" value={reply}
                    onChange={(e) => setReply(e.target.value)} readOnly={fresh} />
                  {fresh && (
                    <div className="ai-layer__overlay reply-reveal" aria-label="Suggested reply">
                      <WordReveal text={reply} seed={review.id || review.name} />
                    </div>
                  )}
                  <svg className="resize-grip" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"><path d="M9 4 4 9" /><path d="M9 8 8 9" /></svg>
                </React.Fragment>
              )}
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost btn-sm" onClick={regenerate} disabled={regen}>
            {regen ? <Icon.refresh className="spin" /> : <Icon.refresh />}{regen ? "Regenerating" : "Regenerate"}
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
            {actionLabel && (
              <button className="btn btn-primary btn-sm" onClick={() => onResolve(review.id)} disabled={regen}>{actionLabel}</button>
            )}
          </div>
        </div>
      </div>
    </ScrimWrap>
  );
}

/* ---------------- Bulk generated replies modal ---------------- */
function BulkReplyModal({ reviews, onClose, onSave }) {
  const makeReply = (review, version = 0) => {
    const base = review.reply && review.reply !== "—"
      ? review.reply
      : "Thank you for taking the time to share this with us. We are sorry the visit did not feel as it should have, and your feedback has been shared with the team so we can improve the experience.";
    if (version % 3 === 1) {
      return base.replace(/^Thank you/, "Thanks").replace("We are sorry", "I'm sorry");
    }
    if (version % 3 === 2) {
      return base + " We appreciate you helping us get better.";
    }
    return base;
  };

  const [drafts, setDrafts] = useState(() => {
    const next = {};
    reviews.forEach((r) => { next[r.id] = makeReply(r, 0); });
    return next;
  });
  const [versions, setVersions] = useState(() => {
    const next = {};
    reviews.forEach((r) => { next[r.id] = 0; });
    return next;
  });
  const [phases, setPhases] = useState(() => {
    const next = {};
    reviews.forEach((r) => { next[r.id] = "writing"; });
    return next;
  });

  useEffect(() => {
    const timers = [];
    reviews.forEach((review, index) => {
      timers.push(setTimeout(() => {
        setPhases((p) => ({ ...p, [review.id]: "fresh" }));
        timers.push(setTimeout(() => {
          setPhases((p) => ({ ...p, [review.id]: "ready" }));
        }, revealDuration(drafts[review.id])));
      }, 900 + index * 520));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  const regenerate = (review) => {
    const nextVersion = (versions[review.id] || 0) + 1;
    setVersions((v) => ({ ...v, [review.id]: nextVersion }));
    setPhases((p) => ({ ...p, [review.id]: "writing" }));
    setTimeout(() => {
      const nextReply = makeReply(review, nextVersion);
      setDrafts((d) => ({ ...d, [review.id]: nextReply }));
      setPhases((p) => ({ ...p, [review.id]: "fresh" }));
      setTimeout(() => {
        setPhases((p) => ({ ...p, [review.id]: "ready" }));
      }, revealDuration(nextReply));
    }, 950);
  };

  const writingCount = reviews.filter((r) => phases[r.id] === "writing").length;

  return (
    <ScrimWrap side="center" onClose={onClose}>
      <div className="modal bulk-reply-modal" role="dialog" aria-modal="true" aria-label="Approve drafted replies">
        <div className="modal-head bulk-modal-head">
          <div>
            <h3 className="bulk-modal-title">Approve drafted replies</h3>
            <p className="bulk-modal-sub">
              {writingCount > 0
                ? "SOUS is drafting " + writingCount + " " + (writingCount === 1 ? "reply" : "replies") + " for the selected reviews."
                : reviews.length + " drafts are ready to edit, regenerate, or save."}
            </p>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="Close"><Icon.x /></button>
        </div>

        <div className="modal-body bulk-modal-body">
          {reviews.map((review) => {
            const phase = phases[review.id] || "ready";
            const fresh = phase === "fresh";
            const writing = phase === "writing";
            return (
              <section className="bulk-reply-card" key={review.id}>
                <div className="bulk-review-context">
                  <div className={"bulk-review-avatar " + avatarTone(review.id || review.name)}>
                    {review.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="bulk-review-main">
                    <div className="bulk-review-id">
                      <strong>{review.name}</strong>
                      <div className="bulk-review-meta">
                        <Stars rating={review.rating} size={12} />
                        <span>{review.platform}</span>
                      </div>
                    </div>
                    <p>{review.review}</p>
                  </div>
                </div>

                <div className="bulk-reply-output">
                  <div className="bulk-reply-output-head">
                    <div>
                      <div className="bulk-reply-output-title"><span className="ai-layer__spark"></span>Draft reply</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => regenerate(review)} disabled={writing}>
                      {writing ? <Icon.refresh className="spin" /> : <Icon.refresh />}{writing ? "Writing" : "Regenerate"}
                    </button>
                  </div>
                  <div className="bulk-reply-editor">
                    {writing ? (
                      <div className="reply-skel bulk-reply-skel" aria-label={"Writing reply for " + review.name}>
                        <div className="reply-skel__row">
                          <span className="reply-skel__line" style={{ width: "100%", "--grow-delay": "0ms" }}></span>
                        </div>
                        <div className="reply-skel__row">
                          <span className="reply-skel__line" style={{ width: "46%", "--grow-delay": "160ms" }}></span>
                          <span className="reply-skel__line" style={{ width: "42%", "--grow-delay": "320ms" }}></span>
                        </div>
                        <div className="reply-skel__row">
                          <span className="reply-skel__line" style={{ width: "68%", "--grow-delay": "480ms" }}></span>
                        </div>
                      </div>
                    ) : (
                      <React.Fragment>
                        <textarea className={"bulk-ai-area" + (fresh ? " revealing" : "")} rows="4"
                          value={drafts[review.id] || ""} readOnly={fresh}
                          onChange={(e) => setDrafts((d) => ({ ...d, [review.id]: e.target.value }))} />
                        {fresh && (
                          <div className="bulk-ai-overlay reply-reveal" aria-label={"Generated reply for " + review.name}>
                            <WordReveal text={drafts[review.id]} seed={review.id + "-bulk-" + versions[review.id]} />
                          </div>
                        )}
                        <svg className="resize-grip" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden="true">
                          <path d="M9 4 4 9" />
                          <path d="M9 8 8 9" />
                        </svg>
                      </React.Fragment>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <div className="modal-foot bulk-modal-foot">
          <span>{reviews.length} generated {reviews.length === 1 ? "reply" : "replies"}</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
            <button className="btn btn-primary btn-sm" onClick={() => onSave(drafts)}>Save drafts</button>
          </div>
        </div>
      </div>
    </ScrimWrap>
  );
}

/* ---------------- Review chat sheet — right drawer, conversation view ---------------- */
function ReviewChatSheet({ review, onClose, onSend }) {
  const alreadyReplied = review.status === "sent" || review.status === "auto";
  const needsGeneratedReply = review.status === "unanswered";
  const suggestedReply = review.reply || "Thank you for sharing your experience with us. We appreciate your feedback and have passed it along to the team.";
  const initial = alreadyReplied || needsGeneratedReply ? "" : suggestedReply;
  const [draft, setDraft] = useState(initial);
  const [regen, setRegen] = useState(false);
  const [fresh, setFresh] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const textareaRef = useRef(null);
  const DYNAMIC_FIELDS = ["Reviewer name", "City", "Postal code", "Province", "Phone", "Location ID", "Email", "Website", "Business name"];
  // outgoing reply shown in the thread: pre-existing sent reply, or one sent this session
  const [sentText, setSentText] = useState(alreadyReplied ? review.reply : null);
  const [justSent, setJustSent] = useState(false);
  const locked = sentText != null;

  const initials = review.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const platLabel = (review.platform || "").replace(/\b\w/g, (c) => c.toUpperCase()) + " review";
  const replyDate = relTime(review.date) || review.ago;
  const reviewMeta = [relTime(review.date) || review.ago, review.time].filter(Boolean).join(" · ");
  const replyMeta = justSent
    ? "Just now · via SOUS"
    : review.status === "auto"
      ? "Replied by agent · " + replyDate + " · via SOUS"
      : "Replied · " + replyDate;

  function regenerate() {
    setFresh(false);
    setRegen(true);
    setTimeout(() => {
      setDraft(suggestedReply);
      setRegen(false);
      setFresh(true);
      setTimeout(() => setFresh(false), revealDuration(suggestedReply));
    }, 1000);
  }
  function insertField(name) {
    const token = "{" + name + "}";
    const el = textareaRef.current;
    const start = el ? el.selectionStart : draft.length;
    const end = el ? el.selectionEnd : draft.length;
    const next = draft.slice(0, start) + token + draft.slice(end);
    setDraft(next);
    setFieldsOpen(false);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  }
  function send() {
    if (!draft.trim() || locked) return;
    setSentText(draft.trim());
    setJustSent(true);
    onSend(review.id);
  }

  return (
    <ScrimWrap side="right" onClose={onClose}>
      <div className="drawer chat-sheet" role="dialog" aria-modal="true" aria-label={"Conversation with " + review.name}>
        <div className="chat-head">
          <div className="chat-head-main">
            <h3 className="chat-name">{review.name}</h3>
            <div className="chat-sub">
              <Stars rating={review.rating} size={12} />
              <span className="chat-platform"><PlatformMark platform={review.platform} /></span>
            </div>
          </div>
          <div className="chat-head-actions">
            <a className="chat-orig" href="#" onClick={(e) => e.preventDefault()}><Icon.externalLink width={14} height={14} />Original post</a>
            <button className="x-btn" onClick={onClose} aria-label="Close"><Icon.x /></button>
          </div>
        </div>

        <div className="chat-body">
          <div className="chat-msg in">
            <div className="chat-col">
              <div className={"chat-avatar " + avatarTone(review.id || review.name)}>{initials}</div>
              <div className="chat-bubble in">
                {review.isNew ? (
                  <span className="reply-reveal review-word-reveal">
                    <WordReveal text={review.text} seed={(review.id || review.name) + "-review"} />
                  </span>
                ) : review.text}
              </div>
              <div className="chat-time">{reviewMeta}</div>
            </div>
          </div>

          {locked && (
            <div className="chat-msg out">
              <div className="chat-col">
                <div className="chat-avatar brand"><Logomark size={15} /></div>
                <div className="chat-bubble out">{sentText}</div>
                <div className="chat-time">
                  {!justSent && review.status === "auto" && (
                    <span className="chat-meta-spark" aria-hidden="true"></span>
                  )}
                  <span>{replyMeta}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={"chat-composer" + (locked ? " locked" : "")}>
          {locked && (
            <div className="chat-locked-banner">
              <span className="locked-check-icon" aria-hidden="true"></span>
              <span>Already replied to this review. Google allows one reply per review.</span>
            </div>
          )}
          <div className="chat-composer-ui" aria-disabled={locked ? "true" : undefined}>
              <div className="chat-input-wrap">
                {regen && !locked ? (
                  <div className="chat-reply-skel" aria-label="Regenerating reply">
                    <div className="reply-skel__row">
                      <span className="reply-skel__line" style={{ width: "100%", "--grow-delay": "0ms" }}></span>
                    </div>
                    <div className="reply-skel__row">
                      <span className="reply-skel__line" style={{ width: "44%", "--grow-delay": "160ms" }}></span>
                      <span className="reply-skel__line" style={{ width: "48%", "--grow-delay": "320ms" }}></span>
                    </div>
                    <div className="reply-skel__row">
                      <span className="reply-skel__line" style={{ width: "68%", "--grow-delay": "480ms" }}></span>
                    </div>
                  </div>
                ) : (
                  <React.Fragment>
                    <textarea ref={textareaRef} className={"chat-input" + (fresh ? " revealing" : "")} rows="3" placeholder="Write a reply…"
                      value={draft} onChange={(e) => setDraft(e.target.value)} disabled={regen || locked} readOnly={fresh || locked} />
                    {fresh && !locked && (
                      <div className="chat-reveal-overlay reply-reveal" aria-label="Generated reply">
                        <WordReveal text={draft} seed={(review.id || review.name) + "-chat"} />
                      </div>
                    )}
                  </React.Fragment>
                )}
              </div>
              <div className="chat-tools">
                <div className="chat-tools-l">
                  <button className="chat-tool" data-tip="Generate reply" onClick={regenerate} disabled={regen || locked}>
                    <span className="chat-tool-icon tool-generate" aria-hidden="true"></span>
                  </button>
                  <div className="chat-tool-wrap">
                    <button className={"chat-tool" + (fieldsOpen ? " on" : "")} data-tip="Dynamic field" onClick={() => setFieldsOpen((o) => !o)} disabled={regen || locked}>
                      <span className="chat-tool-icon tool-field" aria-hidden="true"></span>
                    </button>
                    {fieldsOpen && !locked && (
                      <React.Fragment>
                        <div className="menu-backdrop" onClick={() => setFieldsOpen(false)}></div>
                        <div className="menu" role="menu" aria-label="Dynamic fields">
                          <div className="menu-label">Dynamic fields</div>
                          {DYNAMIC_FIELDS.map((f) => (
                            <button key={f} className="menu-item" role="menuitem" onClick={() => insertField(f)}>{f}</button>
                          ))}
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                  <button className="chat-tool" data-tip="Template library" disabled={regen || locked}>
                    <span className="chat-tool-icon tool-template" aria-hidden="true"></span>
                  </button>
                </div>
                <button className="btn btn-primary btn-sm" onClick={send} disabled={regen || locked || !draft.trim()}>
                  {review.status === "failed" ? "Retry reply" : "Send reply"}
                </button>
              </div>
          </div>
        </div>
      </div>
    </ScrimWrap>
  );
}

/* ---------------- Settings drawer ---------------- */
function SettingsDrawer({ settings, setSettings, onClose, onSave }) {
  return (
    <ScrimWrap side="right" onClose={onClose}>
      <div className="drawer" role="dialog" aria-modal="true" aria-label="Agent rules">
        <div className="drawer-head">
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.01em" }}>Agent rules</h3>
            <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 4 }}>Changes apply to new reviews.</p>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="Close"><Icon.x /></button>
        </div>
        <div className="drawer-body">
          <SettingsForm settings={settings} setSettings={setSettings} />
        </div>
        <div className="drawer-foot">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={onSave}>Save changes</button>
        </div>
      </div>
    </ScrimWrap>
  );
}

/* ---------------- Onboarding ---------------- */
function Onboarding({ settings, setSettings, onClose, onComplete }) {
  const D = window.RRA_DATA;
  const steps = D.ONBOARDING;
  const [i, setI] = useState(0);
  const [starting, setStarting] = useState(false);
  const [whenChoice, setWhenChoice] = useState("safe");
  const s = settings;
  const set = (patch) => setSettings({ ...s, ...patch });
  const step = steps[i];
  const last = i === steps.length - 1;

  const whenOptions = [
    { key: "safe", t: "Auto-send safe replies", d: "4–5 star reviews send automatically. Lower ratings wait for you." },
    { key: "all", t: "Auto-send everything", d: "All replies send automatically." },
    { key: "draft", t: "Draft only", d: "Nothing sends until you approve it." },
  ];

  function next() {
    if (step.key === "when") {
      const map = {
        safe: { 1: "off", 2: "off", 3: "off", 4: "send", 5: "send" },
        all: { 1: "send", 2: "send", 3: "send", 4: "send", 5: "send" },
        draft: { 1: "draft", 2: "draft", 3: "draft", 4: "draft", 5: "draft" },
      };
      set({ stars: map[whenChoice] });
    }
    if (last) { setStarting(true); setTimeout(() => onComplete(), 1100); return; }
    setI(i + 1);
  }

  return (
    <ScrimWrap side="center" onClose={onClose}>
      <div className="onb" role="dialog" aria-modal="true" aria-label="Set up your review agent">
        <div className="onb-top">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>Set up your review agent</span>
            <button className="x-btn" onClick={onClose} aria-label="Close"><Icon.x /></button>
          </div>
          <div className="onb-steps">
            {steps.map((_, n) => (<div key={n} className={"onb-step" + (n < i ? " done" : n === i ? " cur" : "")}><i></i></div>))}
          </div>
        </div>

        <div className="onb-body">
          {!last && <div className="onb-kicker">{step.kicker}</div>}
          {!last && <h2 className="onb-h" style={{ marginTop: 6 }}>{step.title}</h2>}
          {!last && <p className="onb-p">{step.p}</p>}

          <div style={{ marginTop: 22 }}>
            {step.key === "when" && whenOptions.map((o) => (
              <button key={o.key} className={"onb-opt" + (whenChoice === o.key ? " sel" : "")} onClick={() => setWhenChoice(o.key)}>
                <div className="oo-m"><div className="oo-t">{o.t}</div><div className="oo-s">{o.d}</div></div>
                <span className="oo-radio"></span>
              </button>
            ))}

            {step.key === "tone" && (
              <div className="tone-list">
                {D.TONES.map((t) => (
                  <button key={t.key} className={"tone-row" + (s.tone === t.key ? " sel" : "")} onClick={() => set({ tone: t.key })}>
                    <span className="tone-radio"></span>
                    <span className="tone-m"><span className="tone-t">{t.title}</span><span className="tone-d">{t.desc}</span></span>
                  </button>
                ))}
              </div>
            )}

            {step.key === "rules" && (
              <textarea className="set-area" style={{ minHeight: 120 }} value={s.rules} onChange={(e) => set({ rules: e.target.value })} />
            )}

            {step.key === "locations" && (
              <div className="loc-list">
                {D.LOCATIONS.map((l) => (
                  <div className="loc-row" key={l.id}>
                    <div className="loc-m"><div className="loc-t">{l.name}</div></div>
                    <Switch on={!!s.locations[l.id]} onClick={() => set({ locations: { ...s.locations, [l.id]: !s.locations[l.id] } })} />
                  </div>
                ))}
              </div>
            )}

            {step.key === "done" && (
              <div className="onb-final">
                <div className="of-orb"><Logomark size={26} /><span className="halo"></span></div>
                <div>
                  <h2 className="onb-h">{step.title}</h2>
                  <p className="onb-p" style={{ maxWidth: "38ch", margin: "8px auto 0" }}>{step.p}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="onb-foot">
          <button className="btn btn-ghost btn-sm" onClick={() => (i === 0 ? onClose() : setI(i - 1))} disabled={starting}>
            {i === 0 ? "Cancel" : "Back"}
          </button>
          <button className="btn btn-primary btn-sm" onClick={next} disabled={starting}>
            {starting ? <Icon.refresh className="spin" /> : null}
            {last ? (starting ? "Starting…" : "Start replying automatically") : "Continue"}
          </button>
        </div>
      </div>
    </ScrimWrap>
  );
}

Object.assign(window, { ReviewModal, BulkReplyModal, ReviewChatSheet, SettingsDrawer, Onboarding, SettingsForm, Switch, Seg });
