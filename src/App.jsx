import { useState, useRef, useCallback, useEffect } from "react";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const MOCK_PHOTOS = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=90",
    thumb: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&q=80",
    title: "Golden Hour",
    description: "The light between us, infinite.",
    date: "2024-06-15",
    category: "Moments",
    aspectRatio: "portrait",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800&q=90",
    thumb: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=400&q=80",
    title: "Stolen Glance",
    description: "You looked away. I didn't.",
    date: "2024-07-22",
    category: "Portraits",
    aspectRatio: "landscape",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=90",
    thumb: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80",
    title: "First Snow",
    description: "Everything was quiet. Everything was us.",
    date: "2024-12-03",    
    category: "Seasons",
    aspectRatio: "portrait",
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=800&q=90",
    thumb: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=400&q=80",
    title: "Late Evening",
    description: "City lights, your eyes.",
    date: "2024-09-11",
    category: "Night",
    aspectRatio: "landscape",
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1500672860114-9e913f298978?w=800&q=90",
    thumb: "https://images.unsplash.com/photo-1500672860114-9e913f298978?w=400&q=80",
    title: "Warmth",
    description: "A Sunday that never ended.",
    date: "2024-03-08",
    category: "Moments",
    aspectRatio: "portrait",
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800&q=90",
    thumb: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&q=80",
    title: "Ocean Dusk",
    description: "Salt air and holding hands.",
    date: "2024-08-19",
    category: "Travel",
    aspectRatio: "landscape",
  },
];

const CATEGORIES = ["All", "Moments", "Portraits", "Seasons", "Night", "Travel"];

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 20, stroke = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const SearchIcon = () => <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />;
const GridIcon = () => <Icon path="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />;
const ListIcon = () => <Icon path="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />;
const PlusIcon = () => <Icon path="M12 5v14M5 12h14" />;
const XIcon = () => <Icon path="M18 6L6 18M6 6l12 12" />;
const HeartIcon = ({ filled }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const EditIcon = () => <Icon path="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />;
const TrashIcon = () => <Icon path="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
const ArrowLeftIcon = () => <Icon path="M19 12H5M12 19l-7-7 7-7" />;
const CalendarIcon = () => <Icon path="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" size={16} />;
const TagIcon = () => <Icon path="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" size={16} />;
const UploadIcon = () => <Icon path="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" size={32} stroke={1} />;
const CheckIcon = () => <Icon path="M20 6L9 17l-5-5" />;
const ClockIcon = () => <Icon path="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2" size={16} />;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const formatDate = (d) => {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const groupByMonth = (photos) => {
  const groups = {};
  photos.forEach((p) => {
    const key = new Date(p.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  return Object.entries(groups).sort((a, b) => new Date(b[1][0].date) - new Date(a[1][0].date));
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, visible }) => (
  <div style={{
    position: "fixed", bottom: 90, left: "50%", transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
    opacity: visible ? 1 : 0, transition: "all 0.3s ease",
    background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)",
    color: "#fff", padding: "10px 20px", borderRadius: 40,
    fontSize: 13, fontFamily: "'EB Garamond', serif", letterSpacing: "0.04em",
    border: "1px solid rgba(255,255,255,0.15)", zIndex: 9999,
    pointerEvents: "none", whiteSpace: "nowrap",
  }}>{msg}</div>
);

// ─── UPLOAD OVERLAY ───────────────────────────────────────────────────────────
const UploadOverlay = ({ onClose, onAdd }) => {
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", category: "Moments" });
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const submit = () => {
    if (!preview) return;
    onAdd({
      id: Date.now().toString(),
      url: preview, thumb: preview,
      title: form.title || "Untitled",
      description: form.description || "",
      date: form.date || new Date().toISOString().split("T")[0],
      category: form.category,
      aspectRatio: "portrait",
    });
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(8,8,8,0.97)", display: "flex", flexDirection: "column",
      fontFamily: "'EB Garamond', serif",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 20px 16px" }}>
        <span style={{ color: "#fff", fontSize: 18, letterSpacing: "0.06em", fontStyle: "italic" }}>New Memory</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4 }}><XIcon /></button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
          style={{
            border: `1.5px dashed ${drag ? "rgba(255,220,180,0.6)" : "rgba(255,255,255,0.15)"}`,
            borderRadius: 16, padding: 0, cursor: "pointer",
            background: drag ? "rgba(255,220,180,0.04)" : "rgba(255,255,255,0.02)",
            transition: "all 0.3s", marginBottom: 20, overflow: "hidden",
            minHeight: preview ? "auto" : 180, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {preview ? (
            <img src={preview} alt="" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ textAlign: "center", padding: 32, color: "rgba(255,255,255,0.3)" }}>
              <div style={{ marginBottom: 12, opacity: 0.5 }}><UploadIcon /></div>
              <div style={{ fontSize: 14, letterSpacing: "0.08em" }}>TAP TO UPLOAD</div>
              <div style={{ fontSize: 12, marginTop: 6, opacity: 0.6 }}>or drag your memory here</div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
        </div>

        {/* Form fields */}
        {[
          { key: "title", label: "Title", placeholder: "Name this memory…", type: "text" },
          { key: "description", label: "Caption", placeholder: "A few words about this moment…", type: "text" },
          { key: "date", label: "Date", placeholder: "", type: "date" },
        ].map(({ key, label, placeholder, type }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.12em", marginBottom: 6 }}>{label.toUpperCase()}</div>
            <input
              type={type} placeholder={placeholder} value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 15,
                fontFamily: "'EB Garamond', serif", outline: "none", boxSizing: "border-box",
                colorScheme: "dark",
              }}
            />
          </div>
        ))}

        {/* Category */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.12em", marginBottom: 8 }}>CATEGORY</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.filter(c => c !== "All").map(c => (
              <button key={c} onClick={() => setForm({ ...form, category: c })} style={{
                padding: "8px 14px", borderRadius: 30, fontSize: 13, cursor: "pointer",
                fontFamily: "'EB Garamond', serif", letterSpacing: "0.04em", transition: "all 0.2s",
                background: form.category === c ? "rgba(255,220,180,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${form.category === c ? "rgba(255,220,180,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: form.category === c ? "rgba(255,220,180,0.9)" : "rgba(255,255,255,0.5)",
              }}>{c}</button>
            ))}
          </div>
        </div>

        <button onClick={submit} style={{
          width: "100%", padding: "16px", borderRadius: 14,
          background: preview ? "linear-gradient(135deg, rgba(255,220,180,0.2), rgba(200,160,120,0.15))" : "rgba(255,255,255,0.04)",
          border: `1px solid ${preview ? "rgba(255,220,180,0.3)" : "rgba(255,255,255,0.08)"}`,
          color: preview ? "rgba(255,220,180,0.9)" : "rgba(255,255,255,0.2)",
          fontSize: 16, fontFamily: "'EB Garamond', serif", letterSpacing: "0.08em",
          cursor: preview ? "pointer" : "not-allowed", fontStyle: "italic", transition: "all 0.3s",
        }}>
          Save Memory
        </button>
      </div>
    </div>
  );
};

// ─── EDIT OVERLAY ─────────────────────────────────────────────────────────────
const EditOverlay = ({ photo, onClose, onSave }) => {
  const [form, setForm] = useState({ title: photo.title, description: photo.description, date: photo.date, category: photo.category });

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(8,8,8,0.97)", display: "flex", flexDirection: "column",
      fontFamily: "'EB Garamond', serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 20px 16px" }}>
        <span style={{ color: "#fff", fontSize: 18, letterSpacing: "0.06em", fontStyle: "italic" }}>Edit Memory</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4 }}><XIcon /></button>
      </div>

      <img src={photo.thumb} alt="" style={{ width: "100%", height: 200, objectFit: "cover", opacity: 0.5 }} />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {[
          { key: "title", label: "Title", type: "text", placeholder: "Name this memory…" },
          { key: "description", label: "Caption", type: "text", placeholder: "A few words…" },
          { key: "date", label: "Date", type: "date", placeholder: "" },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.12em", marginBottom: 6 }}>{label.toUpperCase()}</div>
            <input type={type} value={form[key]} placeholder={placeholder}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 15,
                fontFamily: "'EB Garamond', serif", outline: "none", boxSizing: "border-box", colorScheme: "dark",
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 24 }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.12em", marginBottom: 8 }}>CATEGORY</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.filter(c => c !== "All").map(c => (
              <button key={c} onClick={() => setForm({ ...form, category: c })} style={{
                padding: "8px 14px", borderRadius: 30, fontSize: 13, cursor: "pointer",
                fontFamily: "'EB Garamond', serif", letterSpacing: "0.04em", transition: "all 0.2s",
                background: form.category === c ? "rgba(255,220,180,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${form.category === c ? "rgba(255,220,180,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: form.category === c ? "rgba(255,220,180,0.9)" : "rgba(255,255,255,0.5)",
              }}>{c}</button>
            ))}
          </div>
        </div>

        <button onClick={() => { onSave({ ...photo, ...form }); onClose(); }} style={{
          width: "100%", padding: "16px", borderRadius: 14,
          background: "linear-gradient(135deg, rgba(255,220,180,0.2), rgba(200,160,120,0.15))",
          border: "1px solid rgba(255,220,180,0.3)",
          color: "rgba(255,220,180,0.9)", fontSize: 16,
          fontFamily: "'EB Garamond', serif", letterSpacing: "0.08em",
          cursor: "pointer", fontStyle: "italic",
        }}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

// ─── FULLSCREEN VIEWER ────────────────────────────────────────────────────────
const FullscreenViewer = ({ photo, photos, onClose, onEdit, onDelete, onToggleFav, favorites }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(photos.findIndex(p => p.id === photo.id));
  const current = photos[currentIdx];
  const touchStartX = useRef(null);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0 && currentIdx < photos.length - 1) setCurrentIdx(i => i + 1);
      if (diff < 0 && currentIdx > 0) setCurrentIdx(i => i - 1);
    }
    touchStartX.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
      style={{
        position: "fixed", inset: 0, zIndex: 900,
        background: "#050505", display: "flex", flexDirection: "column",
        fontFamily: "'EB Garamond', serif",
      }}>
      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        padding: "20px 16px 40px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "none", borderRadius: 30, padding: "8px 14px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "'EB Garamond', serif" }}>
          <ArrowLeftIcon /> Back
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onToggleFav(current.id)} style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "none", borderRadius: 30, padding: "8px 12px", color: favorites.has(current.id) ? "#ff8080" : "#fff", cursor: "pointer" }}>
            <HeartIcon filled={favorites.has(current.id)} />
          </button>
          <button onClick={() => onEdit(current)} style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "none", borderRadius: 30, padding: "8px 12px", color: "#fff", cursor: "pointer" }}>
            <EditIcon />
          </button>
          <button onClick={() => setConfirmDelete(true)} style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "none", borderRadius: 30, padding: "8px 12px", color: "#ff6b6b", cursor: "pointer" }}>
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Image */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <img src={current.url} alt={current.title} style={{
          width: "100%", height: "100%", objectFit: "cover",
          transition: "opacity 0.3s ease",
        }} />
      </div>

      {/* Dots navigation */}
      <div style={{ position: "absolute", bottom: showInfo ? 200 : 80, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        {photos.map((_, i) => (
          <div key={i} onClick={() => setCurrentIdx(i)} style={{
            width: i === currentIdx ? 18 : 6, height: 6, borderRadius: 3,
            background: i === currentIdx ? "rgba(255,220,180,0.8)" : "rgba(255,255,255,0.25)",
            transition: "all 0.3s", cursor: "pointer",
          }} />
        ))}
      </div>

      {/* Info panel */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.92) 70%, transparent)",
        padding: "60px 24px 36px",
        transform: `translateY(${showInfo ? 0 : "calc(100% - 90px)"})`,
        transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        cursor: "pointer",
      }} onClick={() => setShowInfo(!showInfo)}>
        <div style={{ width: 32, height: 3, background: "rgba(255,255,255,0.2)", borderRadius: 2, margin: "0 auto 16px" }} />
        <div style={{ fontSize: 22, color: "#fff", fontStyle: "italic", letterSpacing: "0.02em", marginBottom: 6 }}>{current.title}</div>
        {current.description && <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 12 }}>{current.description}</div>}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.35)", fontSize: 12, letterSpacing: "0.06em" }}>
            <CalendarIcon />{formatDate(current.date)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,220,180,0.45)", fontSize: 12, letterSpacing: "0.06em" }}>
            <TagIcon />{current.category}
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 20, padding: 32,
        }}>
          <div style={{ fontSize: 20, color: "#fff", fontStyle: "italic", marginBottom: 8 }}>Delete this memory?</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 32 }}>This cannot be undone.</div>
          <div style={{ display: "flex", gap: 12, width: "100%" }}>
            <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: "14px", borderRadius: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 15, fontFamily: "'EB Garamond', serif", cursor: "pointer" }}>Cancel</button>
            <button onClick={() => { onDelete(current.id); onClose(); }} style={{ flex: 1, padding: "14px", borderRadius: 12, background: "rgba(255,60,60,0.15)", border: "1px solid rgba(255,60,60,0.3)", color: "#ff8080", fontSize: 15, fontFamily: "'EB Garamond', serif", cursor: "pointer" }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PHOTO CARD ───────────────────────────────────────────────────────────────
const PhotoCard = ({ photo, onClick, isFav, span = 1 }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div onClick={() => onClick(photo)} style={{
      gridColumn: span === 2 ? "span 2" : "span 1",
      borderRadius: 12, overflow: "hidden", cursor: "pointer",
      background: "rgba(255,255,255,0.03)",
      aspectRatio: photo.aspectRatio === "landscape" ? "16/10" : "3/4",
      position: "relative",
      transform: "translateZ(0)",
    }}>
      {!loaded && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.04)", animation: "pulse 2s ease-in-out infinite" }} />}
      <img
        src={photo.thumb} alt={photo.title}
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          opacity: loaded ? 1 : 0, transition: "opacity 0.6s ease",
          display: "block",
        }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)",
      }} />
      {isFav && (
        <div style={{ position: "absolute", top: 8, right: 8, color: "#ff8080" }}>
          <HeartIcon filled />
        </div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px" }}>
        <div style={{ color: "#fff", fontSize: 13, fontStyle: "italic", fontFamily: "'EB Garamond', serif", letterSpacing: "0.02em", lineHeight: 1.3 }}>{photo.title}</div>
      </div>
    </div>
  );
};

// ─── TIMELINE VIEW ────────────────────────────────────────────────────────────
const TimelineView = ({ photos, onPhotoClick, favorites }) => {
  const groups = groupByMonth(photos);
  return (
    <div style={{ paddingBottom: 100 }}>
      {groups.map(([month, groupPhotos]) => (
        <div key={month} style={{ marginBottom: 32 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "0 20px 14px",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,220,180,0.5)", flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: "rgba(255,220,180,0.6)", letterSpacing: "0.1em", fontFamily: "'EB Garamond', serif" }}>{month.toUpperCase()}</div>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>
          <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {groupPhotos.map((p, i) => (
              <PhotoCard key={p.id} photo={p} onClick={onPhotoClick} isFav={favorites.has(p.id)} span={i === 0 && groupPhotos.length % 2 !== 0 ? 2 : 1} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function RomanticGallery() {
  const [photos, setPhotos] = useState(MOCK_PHOTOS);
  const [view, setView] = useState("grid"); // grid | timeline
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [editPhoto, setEditPhoto] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [toast, setToast] = useState({ msg: "", visible: false });
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, visible: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  };

  const filtered = photos.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleFav = (id) => {
    setFavorites(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); showToast("Removed from favourites"); }
      else { n.add(id); showToast("Added to favourites ♥"); }
      return n;
    });
  };

  const handleDelete = (id) => {
    setPhotos(p => p.filter(x => x.id !== id));
    showToast("Memory deleted");
  };

  const handleSaveEdit = (updated) => {
    setPhotos(p => p.map(x => x.id === updated.id ? updated : x));
    showToast("Memory updated");
  };

  const handleAdd = (photo) => {
    setPhotos(p => [photo, ...p]);
    showToast("Memory saved ✦");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { background: #080808; }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        input:focus { border-color: rgba(255,220,180,0.3) !important; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { display: none; }
        .photo-grid > div { animation: fadeIn 0.5s ease both; }
        .photo-grid > div:nth-child(1){animation-delay:0.05s}
        .photo-grid > div:nth-child(2){animation-delay:0.1s}
        .photo-grid > div:nth-child(3){animation-delay:0.15s}
        .photo-grid > div:nth-child(4){animation-delay:0.2s}
        .photo-grid > div:nth-child(5){animation-delay:0.25s}
        .photo-grid > div:nth-child(6){animation-delay:0.3s}
      `}</style>

      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#080808", fontFamily: "'EB Garamond', serif", position: "relative" }}>

        {/* ── HEADER ── */}
        <div style={{
          padding: "52px 20px 0",
          background: "linear-gradient(to bottom, #0d0d0d, #080808)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,220,180,0.45)", marginBottom: 4 }}>OUR ARCHIVE</div>
              <h1 style={{ fontSize: 30, fontWeight: 400, color: "#fff", fontStyle: "italic", letterSpacing: "-0.01em", lineHeight: 1.1 }}>
                Memoire
              </h1>
            </div>
            <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
              <button onClick={() => setShowSearch(s => !s)} style={{
                background: showSearch ? "rgba(255,220,180,0.12)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${showSearch ? "rgba(255,220,180,0.25)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 30, padding: "8px 10px", color: showSearch ? "rgba(255,220,180,0.8)" : "rgba(255,255,255,0.5)", cursor: "pointer",
              }}><SearchIcon /></button>
              <button onClick={() => setView(v => v === "grid" ? "timeline" : "grid")} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 30, padding: "8px 10px", color: "rgba(255,255,255,0.5)", cursor: "pointer",
              }}>
                {view === "grid" ? <ClockIcon /> : <GridIcon />}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 16, marginTop: 16, marginBottom: 16 }}>
            {[
              { label: "Memories", val: photos.length },
              { label: "Favourites", val: favorites.size },
              { label: "Chapters", val: new Set(photos.map(p => p.category)).size },
            ].map(({ label, val }) => (
              <div key={label} style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 20, color: "#fff", fontStyle: "italic" }}>{val}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", marginTop: 1 }}>{label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Search bar */}
          {showSearch && (
            <div style={{ marginBottom: 12, animation: "fadeIn 0.3s ease" }}>
              <input
                type="text" placeholder="Search memories…" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  width: "100%", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                  padding: "12px 16px", color: "#fff", fontSize: 15,
                  fontFamily: "'EB Garamond', serif", outline: "none",
                }}
              />
            </div>
          )}

          {/* Category pills */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none" }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} style={{
                flexShrink: 0, padding: "7px 14px", borderRadius: 30, fontSize: 13,
                cursor: "pointer", fontFamily: "'EB Garamond', serif", fontStyle: c !== "All" ? "italic" : "normal",
                transition: "all 0.25s", letterSpacing: "0.02em",
                background: activeCategory === c ? "rgba(255,220,180,0.12)" : "transparent",
                border: `1px solid ${activeCategory === c ? "rgba(255,220,180,0.35)" : "rgba(255,255,255,0.1)"}`,
                color: activeCategory === c ? "rgba(255,220,180,0.9)" : "rgba(255,255,255,0.4)",
              }}>{c}</button>
            ))}
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 0 }} />
        </div>

        {/* ── GALLERY ── */}
        <div style={{ paddingTop: 16 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 32px", color: "rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>✦</div>
              <div style={{ fontSize: 16, fontStyle: "italic" }}>No memories found</div>
            </div>
          ) : view === "timeline" ? (
            <TimelineView photos={filtered} onPhotoClick={setSelectedPhoto} favorites={favorites} />
          ) : (
            <div className="photo-grid" style={{ padding: "0 20px 100px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {filtered.map((p, i) => (
                <PhotoCard
                  key={p.id} photo={p}
                  onClick={setSelectedPhoto}
                  isFav={favorites.has(p.id)}
                  span={i === 0 ? 2 : 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── FAB ── */}
        <button onClick={() => setShowUpload(true)} style={{
          position: "fixed", bottom: 28, right: "calc(50% - 195px)",
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(255,220,180,0.25), rgba(200,150,100,0.15))",
          border: "1px solid rgba(255,220,180,0.3)",
          color: "rgba(255,220,180,0.9)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,220,180,0.1)",
          backdropFilter: "blur(10px)",
          zIndex: 800,
        }}>
          <PlusIcon />
        </button>

        {/* ── BOTTOM NAV ── */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430,
          background: "rgba(8,8,8,0.92)", backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", padding: "12px 0 20px",
          zIndex: 700,
        }}>
          {[
            { id: "grid", icon: <GridIcon />, label: "Gallery" },
            { id: "timeline", icon: <ClockIcon />, label: "Timeline" },
            { id: "favs", icon: <HeartIcon filled={false} />, label: "Loved" },
          ].map(({ id, icon, label }) => (
            <button key={id} onClick={() => {
              if (id === "favs") { setActiveCategory("All"); setView("grid"); /* show favs */ }
              else setView(id);
            }} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer",
              color: view === id ? "rgba(255,220,180,0.85)" : "rgba(255,255,255,0.25)",
              transition: "color 0.2s",
            }}>
              {icon}
              <span style={{ fontSize: 10, letterSpacing: "0.1em", fontFamily: "'EB Garamond', serif" }}>{label.toUpperCase()}</span>
            </button>
          ))}
        </div>

        {/* ── OVERLAYS ── */}
        {showUpload && <UploadOverlay onClose={() => setShowUpload(false)} onAdd={handleAdd} />}
        {editPhoto && <EditOverlay photo={editPhoto} onClose={() => setEditPhoto(null)} onSave={handleSaveEdit} />}
        {selectedPhoto && (
          <FullscreenViewer
            photo={selectedPhoto} photos={filtered}
            onClose={() => setSelectedPhoto(null)}
            onEdit={(p) => { setSelectedPhoto(null); setEditPhoto(p); }}
            onDelete={handleDelete}
            onToggleFav={toggleFav}
            favorites={favorites}
          />
        )}

        <Toast msg={toast.msg} visible={toast.visible} />
      </div>
    </>
  );
}
