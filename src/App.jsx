import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase";

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Moments", "Portraits", "Seasons", "Night", "Travel", "Together"];

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 20, stroke = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const SearchIcon  = () => <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />;
const GridIcon    = () => <Icon path="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />;
const PlusIcon    = () => <Icon path="M12 5v14M5 12h14" />;
const XIcon       = () => <Icon path="M18 6L6 18M6 6l12 12" />;
const EditIcon    = () => <Icon path="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />;
const TrashIcon   = () => <Icon path="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
const BackIcon    = () => <Icon path="M19 12H5M12 19l-7-7 7-7" />;
const ClockIcon   = () => <Icon path="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2" size={16} />;
const CalIcon     = () => <Icon path="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" size={16} />;
const TagIcon     = () => <Icon path="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" size={16} />;
const UploadIcon  = () => <Icon path="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" size={36} stroke={1} />;
const HeartIcon   = ({ filled }) => (
  <svg width={20} height={20} viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const S = {
  bg:       "#080808",
  surface:  "rgba(255,255,255,0.04)",
  border:   "rgba(255,255,255,0.08)",
  warm:     "rgba(255,220,180,0.9)",
  warmDim:  "rgba(255,220,180,0.45)",
  warmBg:   "rgba(255,220,180,0.12)",
  warmBdr:  "rgba(255,220,180,0.25)",
  text:     "#ffffff",
  muted:    "rgba(255,255,255,0.45)",
  ghost:    "rgba(255,255,255,0.08)",
  red:      "rgba(255,80,80,0.9)",
  redBg:    "rgba(255,60,60,0.12)",
  redBdr:   "rgba(255,60,60,0.25)",
  font:     "'EB Garamond', serif",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });
};

const groupByMonth = (photos) => {
  const g = {};
  [...photos].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(p => {
    const k = new Date(p.date).toLocaleDateString("en-US", {
      month: "long", year: "numeric"
    });
    if (!g[k]) g[k] = [];
    g[k].push(p);
  });
  return Object.entries(g);
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, visible }) {
  return (
    <div style={{
      position: "fixed", bottom: 100, left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : 16}px)`,
      opacity: visible ? 1 : 0, transition: "all 0.35s ease",
      background: "rgba(20,20,20,0.92)", backdropFilter: "blur(20px)",
      border: `1px solid ${S.border}`,
      color: S.text, padding: "10px 22px", borderRadius: 40,
      fontSize: 13, fontFamily: S.font, letterSpacing: "0.04em",
      zIndex: 9999, pointerEvents: "none", whiteSpace: "nowrap",
    }}>
      {msg}
    </div>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = "text", placeholder = "", disabled = false }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        color: S.muted, fontSize: 11,
        letterSpacing: "0.14em", marginBottom: 6,
      }}>
        {label.toUpperCase()}
      </div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%",
          background: S.surface,
          border: `1px solid ${S.border}`,
          borderRadius: 10, padding: "12px 14px",
          color: S.text, fontSize: 15,
          fontFamily: S.font, outline: "none",
          boxSizing: "border-box", colorScheme: "dark",
          opacity: disabled ? 0.5 : 1,
        }}
      />
    </div>
  );
}

// ─── CATEGORY PICKER ──────────────────────────────────────────────────────────
function CategoryPicker({ value, onChange, disabled = false }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        color: S.muted, fontSize: 11,
        letterSpacing: "0.14em", marginBottom: 10,
      }}>
        CATEGORY
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {CATEGORIES.filter(c => c !== "All").map(c => (
          <button
            key={c}
            type="button"
            disabled={disabled}
            onClick={() => onChange(c)}
            style={{
              padding: "8px 16px", borderRadius: 30,
              fontSize: 13, cursor: disabled ? "not-allowed" : "pointer",
              fontFamily: S.font, letterSpacing: "0.04em",
              transition: "all 0.2s",
              background: value === c ? S.warmBg : S.surface,
              border: `1px solid ${value === c ? S.warmBdr : S.border}`,
              color: value === c ? S.warm : S.muted,
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── UPLOAD OVERLAY ───────────────────────────────────────────────────────────
function UploadOverlay({ onClose, onAdd, showToast }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState(null);
  const [file, setFile]           = useState(null);
  const [form, setForm]           = useState({
    title: "", description: "",
    date: new Date().toISOString().split("T")[0],
    category: "Moments",
  });
  const fileRef = useRef();

  const pickFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file || uploading) return;
    setUploading(true);

    try {
      // ── 1. Upload to Supabase Storage bucket "photos" ──────────────────────
      const ext      = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

      const { error: storageError } = await supabase.storage
        .from("photos")           // ✅ lowercase — matches your bucket
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (storageError) throw storageError;

      // ── 2. Get public URL ──────────────────────────────────────────────────
      const { data: urlData } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // ── 3. Detect orientation ─────────────────────────────────────────────
      const aspectRatio = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.width >= img.height ? "landscape" : "portrait");
        img.src    = preview;
      });

      // ── 4. Insert row into "memories" table ───────────────────────────────
      // Column names match the DB schema below EXACTLY
      const payload = {
        title:       form.title.trim() || "Untitled",
        description: form.description.trim(),
        date:        form.date,
        category:    form.category,
        url:         publicUrl,
        thumb:       publicUrl,
        aspect_ratio: aspectRatio,
        is_favorite: false,
      };

      await onAdd(payload);
      onClose();

    } catch (err) {
      console.error(err);
      showToast(err.message || "Upload failed — check console");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(6,6,6,0.98)",
      display: "flex", flexDirection: "column",
      fontFamily: S.font,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "52px 20px 16px",
      }}>
        <span style={{ color: S.text, fontSize: 20, fontStyle: "italic", letterSpacing: "0.04em" }}>
          New Memory
        </span>
        <button
          onClick={onClose} disabled={uploading}
          style={{ background: "none", border: "none", color: S.muted, cursor: "pointer", padding: 4 }}
        >
          <XIcon />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 40px" }}>

        {/* Drop zone */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); pickFile(e.dataTransfer.files[0]); }}
          onClick={() => !uploading && fileRef.current.click()}
          style={{
            border: `1.5px dashed ${preview ? S.warmBdr : S.border}`,
            borderRadius: 16, marginBottom: 20,
            overflow: "hidden", cursor: uploading ? "not-allowed" : "pointer",
            background: preview ? "none" : S.surface,
            minHeight: preview ? "auto" : 180,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s",
          }}
        >
          {preview ? (
            <img
              src={preview} alt=""
              style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: S.muted }}>
              <div style={{ marginBottom: 14, opacity: 0.5 }}><UploadIcon /></div>
              <div style={{ fontSize: 14, letterSpacing: "0.1em" }}>TAP TO CHOOSE PHOTO</div>
              <div style={{ fontSize: 12, marginTop: 6, opacity: 0.5 }}>
                High quality — any size
              </div>
            </div>
          )}
          <input
            ref={fileRef} type="file" accept="image/*"
            style={{ display: "none" }}
            onChange={e => pickFile(e.target.files[0])}
          />
        </div>

        <Field label="Title"   value={form.title}       onChange={v => setForm({ ...form, title: v })}       placeholder="Name this memory…"         disabled={uploading} />
        <Field label="Caption" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="A few words about this moment…" disabled={uploading} />
        <Field label="Date"    value={form.date}        onChange={v => setForm({ ...form, date: v })}         type="date"                              disabled={uploading} />

        <CategoryPicker value={form.category} onChange={v => setForm({ ...form, category: v })} disabled={uploading} />

        <button
          onClick={submit}
          disabled={!preview || uploading}
          style={{
            width: "100%", padding: 16, borderRadius: 14,
            background: preview && !uploading ? S.warmBg : S.surface,
            border: `1px solid ${preview && !uploading ? S.warmBdr : S.border}`,
            color: preview && !uploading ? S.warm : S.muted,
            fontSize: 16, fontFamily: S.font, letterSpacing: "0.08em",
            cursor: preview && !uploading ? "pointer" : "not-allowed",
            fontStyle: "italic", transition: "all 0.3s",
          }}
        >
          {uploading ? "Uploading…" : "Save Memory ✦"}
        </button>
      </div>
    </div>
  );
}

// ─── EDIT OVERLAY ─────────────────────────────────────────────────────────────
function EditOverlay({ photo, onClose, onSave }) {
  const [form, setForm] = useState({
    title:       photo.title,
    description: photo.description || "",
    date:        photo.date,
    category:    photo.category,
  });

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(6,6,6,0.98)",
      display: "flex", flexDirection: "column",
      fontFamily: S.font,
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "52px 20px 16px",
      }}>
        <span style={{ color: S.text, fontSize: 20, fontStyle: "italic" }}>Edit Memory</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: S.muted, cursor: "pointer", padding: 4 }}>
          <XIcon />
        </button>
      </div>

      {/* Preview */}
      <img
        src={photo.thumb} alt=""
        style={{ width: "100%", height: 180, objectFit: "cover", opacity: 0.4 }}
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 40px" }}>
        <Field label="Title"   value={form.title}       onChange={v => setForm({ ...form, title: v })}       placeholder="Name this memory…" />
        <Field label="Caption" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="A few words…" />
        <Field label="Date"    value={form.date}        onChange={v => setForm({ ...form, date: v })}         type="date" />
        <CategoryPicker value={form.category} onChange={v => setForm({ ...form, category: v })} />

        <button
          onClick={() => onSave(photo.id, form)}
          style={{
            width: "100%", padding: 16, borderRadius: 14,
            background: S.warmBg, border: `1px solid ${S.warmBdr}`,
            color: S.warm, fontSize: 16, fontFamily: S.font,
            letterSpacing: "0.08em", cursor: "pointer", fontStyle: "italic",
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

// ─── PHOTO CARD ───────────────────────────────────────────────────────────────
function PhotoCard({ photo, onClick, isFav, span = 1 }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      onClick={() => onClick(photo)}
      style={{
        gridColumn: span === 2 ? "span 2" : "span 1",
        borderRadius: 12, overflow: "hidden", cursor: "pointer",
        background: S.surface,
        aspectRatio: photo.aspect_ratio === "landscape" ? "16/10" : "3/4",
        position: "relative",
      }}
    >
      {!loaded && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06))",
        }} />
      )}
      <img
        src={photo.thumb} alt={photo.title}
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          opacity: loaded ? 1 : 0, transition: "opacity 0.6s ease", display: "block",
        }}
      />
      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)",
      }} />
      {/* Favourite heart */}
      {isFav && (
        <div style={{ position: "absolute", top: 8, right: 8, color: "#ff8080" }}>
          <HeartIcon filled />
        </div>
      )}
      {/* Title */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px" }}>
        <div style={{
          color: S.text, fontSize: 13, fontStyle: "italic",
          fontFamily: S.font, letterSpacing: "0.02em", lineHeight: 1.3,
        }}>
          {photo.title}
        </div>
      </div>
    </div>
  );
}

// ─── FULLSCREEN VIEWER ────────────────────────────────────────────────────────
function FullscreenViewer({ photo, photos, onClose, onEdit, onDelete, onToggleFav, favorites }) {
  const [showInfo, setShowInfo]       = useState(false);
  const [confirmDel, setConfirmDel]   = useState(false);
  const [idx, setIdx]                 = useState(() => photos.findIndex(p => p.id === photo.id));
  const touchX = useRef(null);
  const current = photos[idx] || photo;

  const swipeStart = e => { touchX.current = e.touches[0].clientX; };
  const swipeEnd   = e => {
    if (!touchX.current) return;
    const diff = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0 && idx < photos.length - 1) setIdx(i => i + 1);
      if (diff < 0 && idx > 0)                 setIdx(i => i - 1);
    }
    touchX.current = null;
  };

  return (
    <div
      onTouchStart={swipeStart} onTouchEnd={swipeEnd}
      style={{
        position: "fixed", inset: 0, zIndex: 900,
        background: "#050505", display: "flex",
        flexDirection: "column", fontFamily: S.font,
      }}
    >
      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        padding: "52px 16px 40px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
            border: "none", borderRadius: 30, padding: "8px 14px",
            color: S.text, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, fontFamily: S.font,
          }}
        >
          <BackIcon /> Back
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Favourite */}
          <button
            onClick={() => onToggleFav(current.id, favorites.has(current.id))}
            style={{
              background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
              border: "none", borderRadius: 30, padding: "8px 12px",
              color: favorites.has(current.id) ? "#ff8080" : S.text, cursor: "pointer",
            }}
          >
            <HeartIcon filled={favorites.has(current.id)} />
          </button>
          {/* Edit */}
          <button
            onClick={() => onEdit(current)}
            style={{
              background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
              border: "none", borderRadius: 30, padding: "8px 12px",
              color: S.text, cursor: "pointer",
            }}
          >
            <EditIcon />
          </button>
          {/* Delete */}
          <button
            onClick={() => setConfirmDel(true)}
            style={{
              background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
              border: "none", borderRadius: 30, padding: "8px 12px",
              color: "#ff6b6b", cursor: "pointer",
            }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Full image */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <img
          src={current.url} alt={current.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Dots */}
      <div style={{
        position: "absolute",
        bottom: showInfo ? 220 : 90,
        left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 6, transition: "bottom 0.4s ease",
      }}>
        {photos.map((_, i) => (
          <div
            key={i} onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 18 : 6, height: 6, borderRadius: 3,
              background: i === idx ? S.warm : "rgba(255,255,255,0.25)",
              transition: "all 0.3s", cursor: "pointer",
            }}
          />
        ))}
      </div>

      {/* Info drawer */}
      <div
        onClick={() => setShowInfo(s => !s)}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.95) 70%, transparent)",
          padding: "60px 24px 44px",
          transform: `translateY(${showInfo ? 0 : "calc(100% - 90px)"})`,
          transition: "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
          cursor: "pointer",
        }}
      >
        <div style={{
          width: 32, height: 3, borderRadius: 2,
          background: "rgba(255,255,255,0.2)", margin: "0 auto 16px",
        }} />
        <div style={{ fontSize: 24, color: S.text, fontStyle: "italic", marginBottom: 6 }}>
          {current.title}
        </div>
        {current.description && (
          <div style={{ fontSize: 14, color: S.muted, lineHeight: 1.7, marginBottom: 12 }}>
            {current.description}
          </div>
        )}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
            <CalIcon /> {fmt(current.date)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: S.warmDim, fontSize: 12 }}>
            <TagIcon /> {current.category}
          </div>
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDel && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 20,
          background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: 32,
        }}>
          <div style={{ fontSize: 22, color: S.text, fontStyle: "italic", marginBottom: 8 }}>
            Delete this memory?
          </div>
          <div style={{ fontSize: 14, color: S.muted, textAlign: "center", marginBottom: 36 }}>
            This cannot be undone.
          </div>
          <div style={{ display: "flex", gap: 12, width: "100%" }}>
            <button
              onClick={() => setConfirmDel(false)}
              style={{
                flex: 1, padding: 14, borderRadius: 12,
                background: S.surface, border: `1px solid ${S.border}`,
                color: S.text, fontSize: 15, fontFamily: S.font, cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => { onDelete(current.id); onClose(); }}
              style={{
                flex: 1, padding: 14, borderRadius: 12,
                background: S.redBg, border: `1px solid ${S.redBdr}`,
                color: S.red, fontSize: 15, fontFamily: S.font, cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TIMELINE VIEW ────────────────────────────────────────────────────────────
function TimelineView({ photos, onPhotoClick, favorites }) {
  const groups = groupByMonth(photos);
  return (
    <div style={{ paddingBottom: 100 }}>
      {groups.map(([month, items]) => (
        <div key={month} style={{ marginBottom: 32 }}>
          {/* Month header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "0 20px 14px",
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: S.warmDim, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: S.warmDim, letterSpacing: "0.12em", fontFamily: S.font }}>
              {month.toUpperCase()}
            </div>
            <div style={{ flex: 1, height: 1, background: S.border }} />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: S.font }}>
              {items.length}
            </div>
          </div>
          {/* Grid */}
          <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {items.map((p, i) => (
              <PhotoCard
                key={p.id} photo={p}
                onClick={onPhotoClick}
                isFav={favorites.has(p.id)}
                span={i === 0 && items.length % 2 !== 0 ? 2 : 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [photos,       setPhotos]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [view,         setView]         = useState("grid");
  const [activeCategory, setActiveCat] = useState("All");
  const [favsOnly,     setFavsOnly]     = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [showSearch,   setShowSearch]   = useState(false);
  const [selectedPhoto,setSelectedPhoto]= useState(null);
  const [showUpload,   setShowUpload]   = useState(false);
  const [editPhoto,    setEditPhoto]    = useState(null);
  const [favorites,    setFavorites]    = useState(new Set());
  const [toast,        setToast]        = useState({ msg: "", visible: false });
  const toastTimer = useRef(null);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, visible: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  };

  // ── Load all memories from Supabase ───────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("memories")
          .select("*")
          .order("date", { ascending: false });

        if (error) throw error;

        setPhotos(data || []);
        const favSet = new Set((data || []).filter(p => p.is_favorite).map(p => p.id));
        setFavorites(favSet);
      } catch (err) {
        showToast("Could not load archive");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Filter photos ─────────────────────────────────────────────────────────
  const filtered = photos.filter(p => {
    const matchFav  = !favsOnly || favorites.has(p.id);
    const matchCat  = activeCategory === "All" || p.category === activeCategory;
    const q         = searchQuery.toLowerCase();
    const matchSearch = !q ||
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q);
    return matchFav && matchCat && matchSearch;
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAdd = async (payload) => {
    try {
      const { data, error } = await supabase
        .from("memories")
        .insert([payload])
        .select();
      if (error) throw error;
      setPhotos(p => [data[0], ...p]);
      showToast("Memory saved ✦");
    } catch (err) {
      showToast(err.message || "Could not save");
      console.error(err);
    }
  };

  const handleEdit = async (id, fields) => {
    try {
      const { error } = await supabase
        .from("memories")
        .update(fields)
        .eq("id", id);
      if (error) throw error;
      setPhotos(p => p.map(x => x.id === id ? { ...x, ...fields } : x));
      setEditPhoto(null);
      showToast("Memory updated");
    } catch (err) {
      showToast("Could not update");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from("memories")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setPhotos(p => p.filter(x => x.id !== id));
      showToast("Memory deleted");
    } catch (err) {
      showToast("Could not delete");
      console.error(err);
    }
  };

  const handleToggleFav = async (id, isCurrentFav) => {
    try {
      const { error } = await supabase
        .from("memories")
        .update({ is_favorite: !isCurrentFav })
        .eq("id", id);
      if (error) throw error;
      setFavorites(prev => {
        const n = new Set(prev);
        if (n.has(id)) { n.delete(id); showToast("Removed from favourites"); }
        else           { n.add(id);    showToast("Added to favourites ♥"); }
        return n;
      });
    } catch (err) {
      showToast("Could not update favourite");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        body { background: #080808; }
        input:focus  { border-color: rgba(255,220,180,0.35) !important; outline: none; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { display: none; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{
        maxWidth: 430, margin: "0 auto",
        minHeight: "100dvh", background: S.bg,
        fontFamily: S.font, position: "relative",
      }}>

        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <div style={{ padding: "52px 20px 0", background: "linear-gradient(to bottom, #0d0d0d, #080808)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: S.warmDim, marginBottom: 4 }}>
                OUR ARCHIVE
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 400, color: S.text, fontStyle: "italic", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
                Mémoire
              </h1>
            </div>
            <div style={{ display: "flex", gap: 8, paddingTop: 6 }}>
              <button
                onClick={() => { setShowSearch(s => !s); setSearchQuery(""); }}
                style={{
                  background: showSearch ? S.warmBg : S.ghost,
                  border: `1px solid ${showSearch ? S.warmBdr : S.border}`,
                  borderRadius: 30, padding: "8px 10px",
                  color: showSearch ? S.warm : S.muted, cursor: "pointer",
                }}
              >
                <SearchIcon />
              </button>
              <button
                onClick={() => setView(v => v === "grid" ? "timeline" : "grid")}
                style={{
                  background: S.ghost, border: `1px solid ${S.border}`,
                  borderRadius: 30, padding: "8px 10px",
                  color: S.muted, cursor: "pointer",
                }}
              >
                {view === "grid" ? <ClockIcon /> : <GridIcon />}
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, marginTop: 16, marginBottom: 16 }}>
            {[
              { label: "Memories",   val: photos.length },
              { label: "Favourites", val: favorites.size },
              { label: "Chapters",   val: new Set(photos.map(p => p.category)).size },
            ].map(({ label, val }) => (
              <div key={label} style={{
                flex: 1, background: S.surface, borderRadius: 12,
                padding: "10px 12px", border: `1px solid ${S.border}`,
              }}>
                <div style={{ fontSize: 22, color: S.text, fontStyle: "italic" }}>{val}</div>
                <div style={{ fontSize: 10, color: S.muted, letterSpacing: "0.1em", marginTop: 2 }}>
                  {label.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          {/* Search bar */}
          {showSearch && (
            <div style={{ marginBottom: 12, position: "relative" }}>
              <input
                autoFocus
                placeholder="Search memories…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", background: S.surface,
                  border: `1px solid ${S.border}`,
                  borderRadius: 12, padding: "12px 40px 12px 16px",
                  color: S.text, fontSize: 15, fontFamily: S.font,
                  outline: "none", boxSizing: "border-box",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    color: S.muted, cursor: "pointer", padding: 2,
                  }}
                >
                  <XIcon />
                </button>
              )}
            </div>
          )}

          {/* Category filter */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none" }}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => {
                  setActiveCat(c);
                  if (c === "All") setFavsOnly(false);
                }}
                style={{
                  flexShrink: 0, padding: "7px 16px", borderRadius: 30,
                  fontSize: 13, cursor: "pointer", fontFamily: S.font,
                  letterSpacing: "0.04em", transition: "all 0.25s",
                  background: activeCategory === c ? S.warmBg : S.ghost,
                  border: `1px solid ${activeCategory === c ? S.warmBdr : S.border}`,
                  color: activeCategory === c ? S.warm : S.muted,
                  fontWeight: activeCategory === c ? 500 : 400,
                }}
              >
                {c}
              </button>
            ))}
            <button
              onClick={() => setFavsOnly(f => !f)}
              style={{
                flexShrink: 0, padding: "7px 16px", borderRadius: 30,
                fontSize: 13, cursor: "pointer", fontFamily: S.font,
                letterSpacing: "0.04em", transition: "all 0.25s",
                background: favsOnly ? "rgba(255,128,128,0.12)" : S.ghost,
                border: `1px solid ${favsOnly ? "rgba(255,128,128,0.3)" : S.border}`,
                color: favsOnly ? "#ff8080" : S.muted,
              }}
            >
              ♥ Favourites
            </button>
          </div>
        </div>

        {/* ── CONTENT ──────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "80px 0", flexDirection: "column", gap: 16,
          }}>
            <div style={{ width: 1, height: 48, background: `linear-gradient(to bottom, transparent, ${S.warmDim}, transparent)` }} />
            <div style={{ fontSize: 14, color: S.muted, fontStyle: "italic", letterSpacing: "0.06em" }}>
              Loading archive…
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 32px",
            color: S.muted, fontStyle: "italic", fontSize: 16,
          }}>
            {photos.length === 0
              ? "Your archive is empty.\nTap + to add your first memory."
              : "No memories match this filter."}
          </div>
        ) : view === "grid" ? (
          <div
            className="photo-grid"
            style={{ padding: "8px 20px 100px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            {filtered.map((p, i) => (
              <div key={p.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}>
                <PhotoCard
                  photo={p}
                  onClick={setSelectedPhoto}
                  isFav={favorites.has(p.id)}
                  span={i === 0 && filtered.length % 2 !== 0 ? 2 : 1}
                />
              </div>
            ))}
          </div>
        ) : (
          <TimelineView
            photos={filtered}
            onPhotoClick={setSelectedPhoto}
            favorites={favorites}
          />
        )}

        {/* ── BOTTOM NAV ───────────────────────────────────────────────── */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "100%", maxWidth: 430,
          background: "rgba(8,8,8,0.94)", backdropFilter: "blur(20px)",
          borderTop: `1px solid ${S.border}`,
          padding: "12px 24px 28px",
          display: "flex", justifyContent: "center",
          zIndex: 800,
        }}>
          <button
            onClick={() => setShowUpload(true)}
            style={{
              background: "linear-gradient(135deg, rgba(255,220,180,0.18), rgba(200,150,100,0.12))",
              border: `1px solid ${S.warmBdr}`,
              borderRadius: 40, padding: "12px 40px",
              color: S.warm, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 15, fontFamily: S.font,
              fontStyle: "italic", letterSpacing: "0.06em",
            }}
          >
            <PlusIcon /> Add Memory
          </button>
        </div>

        {/* ── OVERLAYS ─────────────────────────────────────────────────── */}
        {showUpload && (
          <UploadOverlay
            onClose={() => setShowUpload(false)}
            onAdd={handleAdd}
            showToast={showToast}
          />
        )}

        {editPhoto && (
          <EditOverlay
            photo={editPhoto}
            onClose={() => setEditPhoto(null)}
            onSave={handleEdit}
          />
        )}

        {selectedPhoto && (
          <FullscreenViewer
            photo={selectedPhoto}
            photos={filtered}
            onClose={() => setSelectedPhoto(null)}
            onEdit={(p) => { setSelectedPhoto(null); setEditPhoto(p); }}
            onDelete={handleDelete}
            onToggleFav={handleToggleFav}
            favorites={favorites}
          />
        )}

        <Toast msg={toast.msg} visible={toast.visible} />
      </div>
    </>
  );
}