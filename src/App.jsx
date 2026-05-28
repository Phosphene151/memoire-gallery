import { useState, useRef, useCallback, useEffect } from "react";
// Import your real Supabase client
import { supabase } from "./supabase";

const CATEGORIES = ["All", "Moments", "Portraits", "Seasons", "Night", "Travel", "Together"];

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
  if (!d) return "";
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
const UploadOverlay = ({ onClose, onAdd, showToast }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", date: new Date().toISOString().split("T")[0], category: "Moments" });
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!selectedFile || uploading) return;
    setUploading(true);

    try {
      // 1. Upload file to Supabase Storage Bucket ('memories')
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      const { error: storageError } = await supabase.storage
        .from('memories')
        .upload(fileName, selectedFile);

      if (storageError) throw storageError;

      // 2. Get the clean public URL of the asset
      const { data: urlData } = supabase.storage
        .from('memories')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // 3. Determine if photo is landscape/portrait roughly to keep grid beautiful
      let aspectRatio = "portrait";
      const img = new Image();
      img.src = preview;
      if (img.width > img.height) aspectRatio = "landscape";

      // 4. Send structured package upward to handleAdd
      await onAdd({
        title: form.title || "Untitled",
        description: form.description || "",
        date: form.date,
        category: form.category,
        url: publicUrl,
        thumb: publicUrl,
        aspectRatio: aspectRatio
      });

      onClose();
    } catch (err) {
      showToast(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(8,8,8,0.97)", display: "flex", flexDirection: "column",
      fontFamily: "'EB Garamond', serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 20px 16px" }}>
        <span style={{ color: "#fff", fontSize: 18, letterSpacing: "0.06em", fontStyle: "italic" }}>New Memory</span>
        <button onClick={onClose} disabled={uploading} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4 }}><XIcon /></button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !uploading && fileRef.current.click()}
          style={{
            border: `1.5px dashed rgba(255,255,255,0.15)`,
            borderRadius: 16, padding: 0, cursor: uploading ? "not-allowed" : "pointer",
            background: "rgba(255,255,255,0.02)",
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
              <div style={{ fontSize: 12, marginTop: 6, opacity: 0.6 }}>Choose your romantic memory</div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
        </div>

        {[
          { key: "title", label: "Title", placeholder: "Name this memory…", type: "text" },
          { key: "description", label: "Caption", placeholder: "A few words about this moment…", type: "text" },
          { key: "date", label: "Date", placeholder: "", type: "date" },
        ].map(({ key, label, placeholder, type }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.12em", marginBottom: 6 }}>{label.toUpperCase()}</div>
            <input
              type={type} placeholder={placeholder} value={form[key]} disabled={uploading}
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

        <div style={{ marginBottom: 24 }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.12em", marginBottom: 8 }}>CATEGORY</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.filter(c => c !== "All").map(c => (
              <button key={c} type="button" onClick={() => !uploading && setForm({ ...form, category: c })} style={{
                padding: "8px 14px", borderRadius: 30, fontSize: 13, cursor: "pointer",
                fontFamily: "'EB Garamond', serif", letterSpacing: "0.04em", transition: "all 0.2s",
                background: form.category === c ? "rgba(255,220,180,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${form.category === c ? "rgba(255,220,180,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: form.category === c ? "rgba(255,220,180,0.9)" : "rgba(255,255,255,0.5)",
              }}>{c}</button>
            ))}
          </div>
        </div>

        <button onClick={submit} disabled={!preview || uploading} style={{
          width: "100%", padding: "16px", borderRadius: 14,
          background: preview ? "linear-gradient(135deg, rgba(255,220,180,0.2), rgba(200,160,120,0.15))" : "rgba(255,255,255,0.04)",
          border: `1px solid ${preview ? "rgba(255,220,180,0.3)" : "rgba(255,255,255,0.08)"}`,
          color: preview ? "rgba(255,220,180,0.9)" : "rgba(255,255,255,0.2)",
          fontSize: 16, fontFamily: "'EB Garamond', serif", letterSpacing: "0.08em",
          cursor: (preview && !uploading) ? "pointer" : "not-allowed", fontStyle: "italic", transition: "all 0.3s",
        }}>
          {uploading ? "Saving and Storing Asset..." : "Save Memory"}
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

        <div style={{ margin: "0 0 24px" }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.12em", marginBottom: 8 }}>CATEGORY</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.filter(c => c !== "All").map(c => (
              <button key={c} type="button" onClick={() => setForm({ ...form, category: c })} style={{
                padding: "8px 14px", borderRadius: 30, fontSize: 13, cursor: "pointer",
                fontFamily: "'EB Garamond', serif", letterSpacing: "0.04em", transition: "all 0.2s",
                background: form.category === c ? "rgba(255,220,180,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${form.category === c ? "rgba(255,220,180,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: form.category === c ? "rgba(255,220,180,0.9)" : "rgba(255,255,255,0.5)",
              }}>{c}</button>
            ))}
          </div>
        </div>

        <button onClick={() => onSave(photo.id, form)} style={{
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
  const [currentIdx, setCurrentIdx] = useState(() => {
    const idx = photos.findIndex(p => p.id === photo.id);
    return idx !== -1 ? idx : 0;
  });
  
  const touchStartX = useRef(null);
  const current = photos[currentIdx];

  if (!current) return null;

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
          <button onClick={() => onToggleFav(current.id, favorites.has(current.id))} style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "none", borderRadius: 30, padding: "8px 12px", color: favorites.has(current.id) ? "#ff8080" : "#fff", cursor: "pointer" }}>
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

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <img src={current.url} alt={current.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      <div style={{ position: "absolute", bottom: showInfo ? 200 : 80, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        {photos.map((_, i) => (
          <div key={i} onClick={() => setCurrentIdx(i)} style={{
            width: i === currentIdx ? 18 : 6, height: 6, borderRadius: 3,
            background: i === currentIdx ? "rgba(255,220,180,0.8)" : "rgba(255,255,255,0.25)",
            transition: "all 0.3s", cursor: "pointer",
          }} />
        ))}
      </div>

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
      {!loaded && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.04)" }} />}
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px 14px" }}>
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
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
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

  // Fetch initial memories from Supabase Database
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const { data, error } = await supabase
          .from('memories')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        if (data) {
          setPhotos(data);
          // Set favorites mapping from database state
          const favSet = new Set(data.filter(p => p.is_favorite).map(p => p.id));
          setFavorites(favSet);
        }
      } catch (err) {
        showToast("Error loading archive");
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, []);

  const filtered = photos.filter((p) => {
    const matchFavs = !showFavoritesOnly || favorites.has(p.id);
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFavs && matchCat && matchSearch;
  });
