'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Code2,
  Edit3,
  Eye,
  Image as ImageIcon,
  Images,
  Layers,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Ruler,
  Scissors,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Video,
  Wand2,
  X,
} from 'lucide-react';
import {
  BUILTIN_CATEGORIES,
  COLOR_SWATCH_LIBRARY,
  ColorSwatchGroup,
  formatPrice,
  imgPath,
  Product,
  ProductFinish,
  STARTER_PRODUCTS,
  TINT_BG,
  TINT_KEYS,
  TintKey,
  uniqueProductSlug,
} from '@/lib/catalog';
import {
  demoBackend,
  useAllProducts,
  useCategories,
} from '@/lib/demoBackend';
import { localizeCategoryName, localizeProduct } from '@/lib/i18n';
import { productToSanityDoc } from '@/lib/sanity';
import { useShowroom } from '@/components/providers';
import { StoreShell } from '@/components/store-shell';
import { ProductCard } from '@/components/ui-primitives';
import { Product360Viewer } from '@/components/product-360-viewer';
import { AngleCaptureGuide } from '@/components/angle-capture-guide';
import { RoomHotspotEditor } from '@/components/room-hotspot-editor';
import { ImageAssetPickerModal } from '@/components/image-asset-picker';
import { BackgroundRemoverModal } from '@/components/background-remover-modal';

const STUDIO_IMAGE_PRESETS = [
  { label: 'Lounge Chair', path: imgPath('chair.webp') },
  { label: 'Table Lamp', path: imgPath('lamp.webp') },
  { label: 'Pendant Light', path: imgPath('pendant.webp') },
  { label: 'Oak Stool', path: imgPath('stool.webp') },
  { label: 'Side Table', path: imgPath('table.webp') },
  { label: 'Merino Throw', path: imgPath('throw.webp') },
  { label: 'Stoneware Vase', path: imgPath('vase.webp') },
  { label: 'Turned Bowl', path: imgPath('bowl.webp') },
  { label: 'Linen Cushion', path: imgPath('cushion.webp') },
];

const SCENE_IMAGE_PRESETS = [
  { label: 'None', path: '' },
  { label: 'Chair Room', path: imgPath('best-chair.jpg') },
  { label: 'Lamp Room', path: imgPath('best-lamp.jpg') },
  { label: 'Throw Corner', path: imgPath('best-throw.jpg') },
  { label: 'Architectural Interior', path: imgPath('interior.jpg') },
  { label: 'Joinery Detail', path: imgPath('feature-detail.jpg') },
  { label: 'Living Space', path: imgPath('feature-room.jpg') },
];

const COLOR_GROUP_TABS: { id: 'all' | ColorSwatchGroup; en: string; ckb: string; ar: string }[] = [
  { id: 'all', en: 'All Colors', ckb: 'هەموو ڕەنگەکان', ar: 'جميع الألوان' },
  { id: 'neutral', en: 'Neutrals', ckb: 'ڕەنگە سادەکان', ar: 'الألوان المحايدة' },
  { id: 'wood', en: 'Woods & Leather', ckb: 'دار و چەرم', ar: 'الأخشاب والجلد' },
  { id: 'cool', en: 'Blues & Greens', ckb: 'شین و سەوز', ar: 'الأزرق والأخضر' },
  { id: 'warm', en: 'Warm & Bold', ckb: 'گەرم و تۆخ', ar: 'ألوان دافئة وجريئة' },
  { id: 'metal', en: 'Metallics', ckb: 'کانزا و زێڕ', ar: 'المعادن' },
];

const FEATURE_PRESETS_CKB = [
  'چوارچێوەی دار بەڕووی ئەوروپی ١٠٠٪ سروشتی (FSC®)',
  'پێکەوەبەستنی دارتاشی کلاسیکی بێ بزمار و برغو',
  'قوماشی بووکلێی بەلجیکی خۆڕاگر بەرامبەر داخوران',
  'ڕووپۆشکراو بە زەیتی گیایی مات بۆ پاراستنی ڕەگی دارەکە',
  '١٠ ساڵ گەرەنتی چوارچێوە و دارتاشی',
  'گەیاندنی بێبەرامبەر لە ناو سلێمانی',
];

const FEATURE_PRESETS_EN = [
  'Solid FSC®-certified European oak frame',
  'Traditional mortise-and-tenon joinery',
  'High-resilience Belgian bouclé upholstery',
  'Hand-rubbed matte organic plant oil finish',
  '10-year structural carpentry guarantee',
  'Complimentary white-glove delivery in Sulaymaniyah',
];

function AddProductWorkshop() {
  const { locale, dir } = useShowroom();
  const { products: allProducts } = useAllProducts();
  const { categories, byId: categoriesById } = useCategories();
  const isRtl = dir === 'rtl';
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  // Workspace tab: Product Builder vs Room Hotspot Editor
  const [workspaceTab, setWorkspaceTab] = useState<'product' | 'room'>('product');

  // Editing existing product state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Core Identity Fields
  const [name, setName] = useState('کورسی پشوودانی ئارام · Aram Lounge');
  const [customSlug, setCustomSlug] = useState('');
  const [category, setCategory] = useState('seating');
  const [price, setPrice] = useState('640');
  const [stock, setStock] = useState('6');
  const [badge, setBadge] = useState(
    locale === 'ckb' ? 'دروستکراوی نوێ' : locale === 'ar' ? 'إصدار جديد' : 'New Release'
  );
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [position, setPosition] = useState('1');

  // Visuals & 360 Fields
  const [image, setImage] = useState(STUDIO_IMAGE_PRESETS[0].path);
  const [scene, setScene] = useState(SCENE_IMAGE_PRESETS[1].path);
  const [tint, setTint] = useState<TintKey>('sand');
  const [view360Type, setView360Type] = useState<'auto' | 'chair' | 'table' | 'lamp' | 'vase'>('chair');
  const [frames360, setFrames360] = useState<string[]>([]);
  const [targetAngles, setTargetAngles] = useState<8 | 12 | 16 | 24>(12);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [onionSkin, setOnionSkin] = useState(true);
  const [uploadingFrames, setUploadingFrames] = useState(false);
  const [assetPickerTarget, setAssetPickerTarget] = useState<'main' | 'scene' | '360' | null>(null);
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [bgRemoverSource, setBgRemoverSource] = useState<File | string | null>(null);

  // Finishes & Swatches
  const [colorGroupFilter, setColorGroupFilter] = useState<'all' | ColorSwatchGroup>('all');
  const [finishes, setFinishes] = useState<ProductFinish[]>([
    { name: locale === 'ckb' ? 'بەڕووی سروشتی' : locale === 'ar' ? 'بلوط طبيعي' : 'Natural Oak', color: '#d8c4a4' },
    { name: locale === 'ckb' ? 'عاجی بووکلێ' : locale === 'ar' ? 'عاجي بوكليه' : 'Bouclé Ivory', color: '#e9e3d7' },
    { name: locale === 'ckb' ? 'گوێزی تۆخ' : locale === 'ar' ? 'جوز مدخن' : 'Smoked Walnut', color: '#6e4a2c' },
  ]);

  // Editorial Blurb
  const [blurb, setBlurb] = useState(
    locale === 'ckb'
      ? 'کورسییەکی نزم و ئارام بە چوارچێوەی دار بەڕووی پتەو و کوشنی بووکلێی نەرم. بۆ گۆشەی خوێندنەوە و ژووری دانیشتنی هێمن دیزاین کراوە.'
      : locale === 'ar'
      ? 'كرسي استرخاء منخفض بهيكل من خشب البلوط الصلب ووسائد بوكليه ناعمة. مصمم لزوايا القراءة وغرف المعيشة الهادئة.'
      : 'A low-slung architectural lounge chair crafted from solid European oak and tactile bouclé upholstery. Proportioned for calm living spaces.'
  );

  // Dimensions & Extended Specifications
  const [dimensions, setDimensions] = useState('W 78 × D 84 × H 73 cm · Seat H 40 cm');
  const [material, setMaterial] = useState(
    locale === 'ckb'
      ? '١٠٠٪ دار بەڕووی سروشتی FSC® و قوماشی بووکلێ'
      : '100% FSC® Solid European Oak & Belgian Bouclé'
  );
  const [weight, setWeight] = useState('18.5 kg');
  const [warranty, setWarranty] = useState(
    locale === 'ckb' ? '١٠ ساڵ گەرەنتی چوارچێوە و دارتاشی' : '10-Year Structural Frame Warranty'
  );
  const [leadTime, setLeadTime] = useState(
    locale === 'ckb'
      ? 'نمایشکراوە لە پێشانگای سلێمانی · گەیاندنی بێبەرامبەر'
      : 'On display in Sulaymaniyah Showroom · Free local delivery'
  );
  const [care, setCare] = useState(
    locale === 'ckb'
      ? 'بە پەڕۆیەکی نەرم و کەمێک شێدار خاوێنی بکەرەوە. ساڵانە جارێک زەیتی سروشتی لە دارەکە بدە.'
      : 'Wipe with a soft damp lint-free cloth. Re-oil solid oak surfaces once a year.'
  );

  // Construction Highlights (Bullet points)
  const [details, setDetails] = useState<string[]>([
    locale === 'ckb'
      ? 'چوارچێوەی دار بەڕووی ئەوروپی ١٠٠٪ سروشتی (FSC®)'
      : 'Solid FSC®-certified European oak frame',
    locale === 'ckb'
      ? 'پێکەوەبەستنی دارتاشی کلاسیکی بێ بزمار و برغو'
      : 'Traditional mortise-and-tenon joinery',
    locale === 'ckb'
      ? 'قوماشی بووکلێی بەلجیکی خۆڕاگر بەرامبەر داخوران'
      : 'High-resilience Belgian bouclé upholstery',
  ]);
  const [newDetailText, setNewDetailText] = useState('');

  // Custom Key-Value Specifications
  const [customSpecs, setCustomSpecs] = useState<{ label: string; value: string }[]>([
    {
      label: locale === 'ckb' ? 'بەرزی دانیشتن' : 'Seat Height',
      value: '40 cm',
    },
    {
      label: locale === 'ckb' ? 'شوێنی دروستکردن' : 'Workshop Origin',
      value: locale === 'ckb' ? 'کارگەی دەستڕەنگین · سلێمانی' : 'Artisan Workshop · Sulaymaniyah',
    },
  ]);

  // Inline Category Creation
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Preview Tab & Feedback States
  const [previewTab, setPreviewTab] = useState<'card' | '360' | 'specs' | 'sanity'>('card');
  const [saving, setSaving] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<{ text: string; tone: 'ok' | 'err' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringStarter, setRestoringStarter] = useState(false);

  const mainImageInputRef = useRef<HTMLInputElement | null>(null);
  const sceneImageInputRef = useRef<HTMLInputElement | null>(null);
  const multiFrameInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraCaptureRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const formTopRef = useRef<HTMLDivElement | null>(null);
  const previewCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const showNotice = (text: string, tone: 'ok' | 'err' = 'ok') => {
    setBannerMsg({ text, tone });
    setTimeout(() => {
      setBannerMsg((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Build live preview Product object
  const previewProduct: Product = useMemo(() => {
    const existingIds = allProducts.map((p) => p.id).filter((id) => id !== editingId);
    const computedId =
      editingId ||
      (customSlug.trim()
        ? uniqueProductSlug(customSlug.trim(), existingIds)
        : uniqueProductSlug(name || 'new-piece', existingIds));

    return {
      id: computedId,
      name: name.trim() || 'Untitled Piece',
      category: category || 'seating',
      price: Math.max(1, Number(price) || 0),
      rating: 5,
      reviews: 12,
      tint,
      image: image || STUDIO_IMAGE_PRESETS[0].path,
      scene: scene.trim() || null,
      stock: Math.max(0, Number(stock) || 0),
      badge: badge.trim() || null,
      blurb: blurb.trim() || 'Architectural piece crafted for calm homes.',
      finishes:
        finishes.filter((f) => f.name.trim()).length > 0
          ? finishes.filter((f) => f.name.trim())
          : [{ name: 'Natural Oak', color: '#d8c4a4' }],
      details: details.map((d) => d.trim()).filter(Boolean),
      dimensions: dimensions.trim() || '80 × 80 × 75 cm',
      care: care.trim() || 'Wipe clean with a soft damp cloth.',
      status,
      position: Math.max(1, Number(position) || allProducts.length + 1),
      view360Type,
      frames360: frames360.length > 0 ? frames360 : undefined,
      material: material.trim() || undefined,
      weight: weight.trim() || undefined,
      warranty: warranty.trim() || undefined,
      leadTime: leadTime.trim() || undefined,
      customSpecs: customSpecs.filter((s) => s.label.trim() && s.value.trim()),
    };
  }, [
    allProducts,
    editingId,
    customSlug,
    name,
    category,
    price,
    tint,
    image,
    scene,
    stock,
    badge,
    blurb,
    finishes,
    details,
    dimensions,
    care,
    status,
    position,
    view360Type,
    frames360,
    material,
    weight,
    warranty,
    leadTime,
    customSpecs,
  ]);

  const sanityJsonPreview = useMemo(
    () => JSON.stringify(productToSanityDoc(previewProduct), null, 2),
    [previewProduct]
  );

  // Upload image file handler
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'main' | 'scene'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (target === 'main' && autoRemoveBg) {
        setBgRemoverSource(file);
        return;
      }
      const dataUrl =
        target === 'scene'
          ? await demoBackend.uploadRoomSceneImage(file)
          : await demoBackend.uploadProductImage(file);
      if (target === 'main') setImage(dataUrl);
      else setScene(dataUrl);
      showNotice(
        locale === 'ckb'
          ? 'وێنەکە بە سەرکەوتوویی بارکرا'
          : locale === 'ar'
          ? 'تم رفع الصورة بنجاح'
          : 'Image uploaded successfully'
      );
    } catch {
      showNotice('Could not process image file', 'err');
    } finally {
      e.target.value = '';
    }
  };

  // Stop live camera stream
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  };

  // Start guided 360° live camera
  const startCamera = async () => {
    setCameraError(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        locale === 'ckb'
          ? 'کامێرای ڕاستەوخۆ لەم وێبگەڕەدا بەردەست نییە. دوگمەی «کامێرای مۆبایل» یان «بارکردنی کۆمەڵە وێنە» بەکاربهێنە.'
          : locale === 'ar'
          ? 'الكاميرا المباشرة غير مدعومة في هذا المتصفح. استخدم زر كاميرا الهاتف أو رفع الصور.'
          : 'Live webcam is unavailable in this browser/iframe. Use "Phone Camera" or "Upload Multi-Angle Photos" instead.'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setCameraError(
        locale === 'ckb'
          ? 'ڕێگەپێدانی کامێرا نەدرا یان بلۆک کراوە. دەتوانیت بە دوگمەی «بارکردنی کۆمەڵە وێنە» وێنەکانی گۆشەکان هەڵبژێریت.'
          : locale === 'ar'
          ? 'تم رفض إذن الكاميرا. يمكنك التقاط الصور بهاتفك ثم رفعها دفعة واحدة.'
          : 'Camera permission blocked or unavailable. You can take photos with your phone camera or upload multiple angle photos at once.'
      );
    }
  };

  // Capture current frame from live video feed
  const captureAngleFromVideo = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const maxDim = 720;
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    const w = Math.max(1, Math.round(video.videoWidth * scale));
    const h = Math.max(1, Math.round(video.videoHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/webp', 0.74);

    let insertedIdx = -1;
    setFrames360((prev) => {
      insertedIdx = prev.length;
      const next = [...prev, dataUrl];
      if (next.length >= 2) {
        setPreviewTab('360');
      }
      return next;
    });

    // Background upload to Sanity Assets CDN when configured so 360 frames stay lightweight
    const slugHint = (customSlug || name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 24);
    demoBackend
      .uploadDataUrlToSanity(dataUrl, `${slugHint}-360-${Date.now()}.webp`)
      .then((cdnUrl) => {
        if (cdnUrl && cdnUrl !== dataUrl) {
          setFrames360((prev) =>
            prev.map((item, idx) =>
              item === dataUrl || idx === insertedIdx ? cdnUrl : item
            )
          );
        }
      })
      .catch(() => {});
  };

  // Batch upload multiple angle photos (or single phone native camera capture)
  const handleBatchFrameUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploadingFrames(true);
    try {
      const sortedFiles = Array.from(fileList).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );

      const processed: string[] = [];
      for (const file of sortedFiles) {
        const frameUrl = await demoBackend.upload360Frame(file);
        processed.push(frameUrl);
      }

      if (processed.length > 0) {
        setFrames360((prev) => {
          const next = [...prev, ...processed];
          if (next.length >= 2) {
            setPreviewTab('360');
          }
          return next;
        });
        showNotice(
          locale === 'ckb'
            ? `${processed.length} وێنەی گۆشە زیاد کرا بۆ سووڕانەوەی ٣٦٠°!`
            : locale === 'ar'
            ? `تمت إضافة ${processed.length} زاوية لعرض 360°!`
            : `Added ${processed.length} angle photos to 360° turntable!`
        );
      }
    } catch {
      showNotice('Could not process one or more angle photos', 'err');
    } finally {
      setUploadingFrames(false);
      e.target.value = '';
    }
  };

  const moveFrame = (index: number, delta: -1 | 1) => {
    setFrames360((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  // Save / Create / Update Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showNotice(
        locale === 'ckb' ? 'تکایە ناوی بەرهەم بنووسە' : 'Please enter a product name',
        'err'
      );
      return;
    }
    if (!price || Number(price) <= 0) {
      showNotice(
        locale === 'ckb' ? 'تکایە نرخێکی دروست بنووسە' : 'Please enter a valid price',
        'err'
      );
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await demoBackend.updateProduct(editingId, previewProduct);
        showNotice(
          locale === 'ckb'
            ? `گۆڕانکارییەکانی "${previewProduct.name}" پاشەکەوت کران!`
            : `Updated "${previewProduct.name}" in catalog!`
        );
      } else {
        await demoBackend.createProduct(previewProduct);
        showNotice(
          locale === 'ckb'
            ? `بەرهەمی "${previewProduct.name}" زیاد کرا بۆ پێشانگا!`
            : `Added "${previewProduct.name}" to the storefront catalog!`
        );
      }
      setEditingId(null);
    } catch (err) {
      const code = (err as { code?: string; message?: string })?.code || (err instanceof Error ? err.message : '');
      if (code === 'storage/quota-exceeded') {
        showNotice(
          locale === 'ckb'
            ? 'قەبارەی بیرگەی کاتی وێبگەڕەکە پڕبوو (بەهۆی زۆری وێنەکانی ٣٦٠°). چەند وێنەیەک یان بەرهەمی کۆن کەم بکەرەوە یان Sanity ببەستەرەوە.'
            : locale === 'ar'
            ? 'امتلأت مساحة التخزين المؤقتة في المتصفح بسبب كثرة صور 360°. قلّل عدد الزوايا أو اربط Sanity.'
            : 'Browser preview storage is full (too many 360° frames stored locally). Use fewer angles (e.g. 8–12) or connect Sanity for unlimited cloud media.',
          'err'
        );
      } else {
        showNotice(err instanceof Error ? err.message : 'Failed to save product', 'err');
      }
    } finally {
      setSaving(false);
    }
  };

  // Load a product into the form for editing
  const handleLoadForEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setCustomSlug(p.id);
    setCategory(p.category);
    setPrice(String(p.price));
    setStock(String(p.stock));
    setBadge(p.badge ?? '');
    setStatus(p.status);
    setPosition(String(p.position ?? 1));
    setImage(p.image);
    setScene(p.scene ?? '');
    setTint(p.tint);
    setView360Type(p.view360Type ?? 'auto');
    setFrames360(Array.isArray(p.frames360) ? [...p.frames360] : []);
    setFinishes(
      p.finishes.length > 0
        ? p.finishes.map((f) => ({ ...f }))
        : [{ name: 'Natural Oak', color: '#d8c4a4' }]
    );
    setBlurb(p.blurb);
    setDimensions(p.dimensions);
    setMaterial(p.material ?? '');
    setWeight(p.weight ?? '');
    setWarranty(p.warranty ?? '');
    setLeadTime(p.leadTime ?? '');
    setCare(p.care);
    setDetails([...p.details]);
    setCustomSpecs(p.customSpecs ? p.customSpecs.map((s) => ({ ...s })) : []);
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Reset form to blank
  const handleResetBlank = () => {
    setEditingId(null);
    setName('');
    setCustomSlug('');
    setCategory(categories[0]?.id || 'seating');
    setPrice('');
    setStock('5');
    setBadge('');
    setStatus('active');
    setPosition(String(allProducts.length + 1));
    setImage(STUDIO_IMAGE_PRESETS[0].path);
    setScene('');
    setTint('stone');
    setView360Type('auto');
    setFrames360([]);
    setFinishes([{ name: locale === 'ckb' ? 'بەڕووی سروشتی' : 'Natural Oak', color: '#d8c4a4' }]);
    setBlurb('');
    setDimensions('');
    setMaterial('');
    setWeight('');
    setWarranty('');
    setLeadTime('');
    setCare('');
    setDetails([]);
    setCustomSpecs([]);
  };

  // Fill with another rich sample product for instant testing
  const handleFillSample = () => {
    const samples = [
      {
        name: locale === 'ckb' ? 'مێزی نانخواردنی سۆلی · Soli Table' : 'Soli Architectural Dining Table',
        category: 'tables',
        price: '1290',
        stock: '4',
        badge: locale === 'ckb' ? 'بەرهەمی تایبەت' : 'Signature Piece',
        image: imgPath('table.webp'),
        scene: imgPath('interior.jpg'),
        tint: 'stone' as TintKey,
        view360Type: 'table' as const,
        blurb:
          locale === 'ckb'
            ? 'مێزێکی فراوان لە تەختەی دار بەڕووی ئەستوور بە لێواری خڕکراو و بنکەیەکی ئەندازیاری پتەو. گونجاوە بۆ کۆبوونەوەی خێزانی و ستۆدیۆکان.'
            : 'An architectural table crafted from thick solid oak planks with softly chamfered edges and a grounded fluted column base.',
        dimensions: 'L 220 × W 95 × H 75 cm · Top thickness 4 cm',
        material: locale === 'ckb' ? '١٠٠٪ دار بەڕووی ئەوروپی FSC®' : '100% FSC® Solid European Oak',
        weight: '64 kg',
        warranty: locale === 'ckb' ? '١٠ ساڵ گەرەنتی دارتاشی' : '10-Year Carpentry Guarantee',
        leadTime: locale === 'ckb' ? 'بەردەستە لە پێشانگای سلێمانی' : 'Ready in Sulaymaniyah Showroom',
        care: locale === 'ckb' ? 'بە پەڕۆی شێدار پاکی بکەرەوە و ساڵانە زەیتی لێ بدە.' : 'Wipe with damp cloth; oil annually.',
      },
      {
        name: locale === 'ckb' ? 'چرای سەرمێزی نۆرد · Nord Lamp' : 'Nord Turned Brass & Linen Lamp',
        category: 'lighting',
        price: '320',
        stock: '9',
        badge: locale === 'ckb' ? 'ڕووناکی گەرم' : 'Warm Glow',
        image: imgPath('lamp.webp'),
        scene: imgPath('best-lamp.jpg'),
        tint: 'butter' as TintKey,
        view360Type: 'lamp' as const,
        blurb:
          locale === 'ckb'
            ? 'گڵۆپێکی هێمن بە کڵاوەی کەتانی خاو و بنکەی مس و دار. ڕووناکییەکی نەرم و بێ درەوشانەوەی بێزارکەر بڵاو دەکاتەوە.'
            : 'A calm table lamp pairing a raw unbleached linen shade with a turned solid brass stem for warm evening illumination.',
        dimensions: 'Ø 34 × H 48 cm · Cord 2.2 m braided',
        material: locale === 'ckb' ? 'کەتانی سروشتی و مسی فڵچەکراو' : 'Unbleached Linen & Brushed Brass',
        weight: '3.8 kg',
        warranty: locale === 'ckb' ? '٥ ساڵ گەرەنتی کارەبایی' : '5-Year Lighting Warranty',
        leadTime: locale === 'ckb' ? 'ئامادەیە بۆ وەرگرتن لە پێشانگا' : 'Available for immediate pickup',
        care: locale === 'ckb' ? 'بە فڵچەی وشک تۆزەکەی لاببە.' : 'Dust gently with a dry soft brush.',
      },
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    setEditingId(null);
    setName(pick.name);
    setCustomSlug('');
    setCategory(pick.category);
    setPrice(pick.price);
    setStock(pick.stock);
    setBadge(pick.badge);
    setImage(pick.image);
    setScene(pick.scene);
    setTint(pick.tint);
    setView360Type(pick.view360Type);
    setFrames360([]);
    setBlurb(pick.blurb);
    setDimensions(pick.dimensions);
    setMaterial(pick.material);
    setWeight(pick.weight);
    setWarranty(pick.warranty);
    setLeadTime(pick.leadTime);
    setCare(pick.care);
    showNotice(
      locale === 'ckb'
        ? 'نموونەی بەرهەم پڕکرایەوە — کرتە لە زیادکردنی بەرهەم بکە!'
        : 'Sample product filled — click Add Product to save!'
    );
  };

  // Delete product
  const handleDeleteProduct = async (product: Product) => {
    setDeletingId(product.id);
    try {
      await demoBackend.deleteProduct(product.id);
      if (editingId === product.id) {
        handleResetBlank();
      }
      showNotice(
        locale === 'ckb'
          ? `بەرهەمی "${product.name}" سڕایەوە.`
          : `Deleted "${product.name}" from catalog.`
      );
    } catch {
      showNotice('Could not delete product', 'err');
    } finally {
      setDeletingId(null);
    }
  };

  // Live stock adjustment (- / + / mark sold out)
  const handleAdjustStock = async (product: Product, nextStock: number) => {
    const clamped = Math.max(0, nextStock);
    try {
      await demoBackend.updateProduct(product.id, { stock: clamped });
      if (editingId === product.id) {
        setStock(String(clamped));
      }
      showNotice(
        clamped === 0
          ? locale === 'ckb'
            ? `"${product.name}" وەک نەماو (0) دیاریکرا.`
            : locale === 'ar'
            ? `تم تعيين "${product.name}" كـ نفدت الكمية (0).`
            : `Marked "${product.name}" as Sold out (0 available).`
          : locale === 'ckb'
          ? `ژمارەی بەردەستی "${product.name}" کرا بە ${clamped}.`
          : locale === 'ar'
          ? `تم تحديث الكمية المتوفرة لـ "${product.name}" إلى ${clamped}.`
          : `Updated available count for "${product.name}" to ${clamped}.`
      );
    } catch {
      showNotice('Could not update stock count', 'err');
    }
  };

  // Toggle "sold out in this color" for a specific finish in 1 click
  const handleToggleFinishSoldOut = async (product: Product, finishIdx: number) => {
    const nextFinishes = product.finishes.map((f, idx) => {
      if (idx !== finishIdx) return f;
      const nowSoldOut = !(Boolean(f.soldOut) || f.stock === 0);
      return {
        ...f,
        soldOut: nowSoldOut,
        ...(nowSoldOut
          ? {}
          : typeof f.stock === 'number' && f.stock === 0
          ? { stock: Math.max(1, product.stock || 4) }
          : {}),
      };
    });
    const toggled = nextFinishes[finishIdx];
    try {
      await demoBackend.updateProduct(product.id, { finishes: nextFinishes });
      if (editingId === product.id) {
        setFinishes(nextFinishes);
      }
      showNotice(
        toggled?.soldOut
          ? locale === 'ckb'
            ? `ڕەنگی "${toggled.name}" لە "${product.name}" وەک نەماو دیاریکرا.`
            : locale === 'ar'
            ? `تم تعيين اللون "${toggled.name}" في "${product.name}" كـ غير متوفر.`
            : `Marked "${toggled.name}" on "${product.name}" as Sold out.`
          : locale === 'ckb'
          ? `ڕەنگی "${toggled?.name}" لە "${product.name}" کرایەوە بە بەردەست.`
          : locale === 'ar'
          ? `تم تفعيل توفر اللون "${toggled?.name}" في "${product.name}".`
          : `Marked "${toggled?.name}" on "${product.name}" as Available.`
      );
    } catch {
      showNotice('Could not update color availability', 'err');
    }
  };

  // Create new category inline
  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    const id = uniqueProductSlug(newCatName, categories.map((c) => c.id));
    try {
      await demoBackend.createCategory({
        id,
        name: newCatName.trim(),
        position: categories.length + 1,
      });
      setCategory(id);
      setNewCatName('');
      setAddingCat(false);
      showNotice(
        locale === 'ckb'
          ? `بەشی "${newCatName}" زیاد کرا!`
          : `Category "${newCatName}" created!`
      );
    } catch {
      showNotice('Category already exists', 'err');
    }
  };

  // Restore starter catalog if deleted
  const missingStarterCount = useMemo(() => {
    const existingIds = new Set(allProducts.map((p) => p.id));
    return STARTER_PRODUCTS.filter((p) => !existingIds.has(p.id)).length;
  }, [allProducts]);

  const handleRestoreStarters = async () => {
    setRestoringStarter(true);
    try {
      await demoBackend.importStarterCatalog();
      showNotice(
        locale === 'ckb'
          ? 'هەموو بەرهەمە سەرەتاییەکان گەڕێندرانەوە!'
          : 'Restored starter catalog products!'
      );
    } finally {
      setRestoringStarter(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [allProducts, searchQuery]);

  const featurePresets = locale === 'ckb' ? FEATURE_PRESETS_CKB : FEATURE_PRESETS_EN;

  return (
    <div ref={formTopRef} className="mx-auto max-w-[1440px] px-3 pt-24 pb-20 sm:px-6 sm:pt-28">
      {/* Top Bar & Navigation */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/#collection-grid"
          className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-[13px] font-medium text-ink shadow-xs ring-1 ring-line transition-colors hover:bg-sand"
        >
          <BackArrow className="size-4" />
          <span>
            {locale === 'ckb'
              ? 'گەڕانەوە بۆ پەڕەی سەرەکی (بەرهەمەکانمان)'
              : locale === 'ar'
              ? 'العودة إلى الصفحة الرئيسية'
              : 'Back to Landing Page (Our Products)'}
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleFillSample}
            className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3.5 py-2 text-[12.5px] font-medium text-ink transition-colors hover:bg-ink hover:text-canvas"
          >
            <Wand2 className="size-3.5 text-accent" />
            <span>
              {locale === 'ckb'
                ? 'پڕکردنەوەی نموونەی ئامادە'
                : locale === 'ar'
                ? 'تعبئة نموذج جاهز'
                : 'Fill Sample Product'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleResetBlank}
            className="inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-[12.5px] font-medium text-ink-soft ring-1 ring-line transition-colors hover:text-ink"
          >
            <RotateCcw className="size-3.5" />
            <span>
              {locale === 'ckb' ? 'فۆرمی بەتاڵ' : locale === 'ar' ? 'تفريغ النموذج' : 'Clear Form'}
            </span>
          </button>

          {missingStarterCount > 0 && (
            <button
              type="button"
              onClick={handleRestoreStarters}
              disabled={restoringStarter}
              className="inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 text-[12.5px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-sand"
            >
              <Sparkles className="size-3.5 text-accent" />
              <span>
                {locale === 'ckb'
                  ? `گەڕاندنەوەی ${missingStarterCount} بەرهەمی سڕاوە`
                  : `Restore ${missingStarterCount} Starter Pieces`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Header Tile */}
      <div className="tile mb-6 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
              <Sparkles className="size-3.5 text-accent" />
              {locale === 'ckb'
                ? 'تاقیکردنەوەی زیادکردن و سڕینەوەی بەرهەم پێش بەستنەوەی Sanity'
                : locale === 'ar'
                ? 'اختبار إضافة وحذف المنتجات والمواصفات قبل ربط Sanity'
                : 'Product & Specification Builder · Pre-Sanity Verification'}
            </span>
            <h1 className="display mt-3 text-[clamp(1.75rem,3.2vw,2.75rem)] font-semibold tracking-tight text-ink">
              {editingId
                ? locale === 'ckb'
                  ? `دەستکاریکردنی: ${name}`
                  : `Editing Product: ${name}`
                : locale === 'ckb'
                ? 'زیادکردنی بەرهەمی نوێ و هەموو تایبەتمەندییەکان'
                : locale === 'ar'
                ? 'إضافة منتج جديد وكافة المواصفات'
                : 'Add New Product & Complete Specifications'}
            </h1>
            <p className="mt-1.5 max-w-3xl text-[14px] text-ink-soft">
              {locale === 'ckb'
                ? 'لێرەدا هەموو خانە و تایبەتمەندییەکانی بەرهەم تاقی بکەرەوە (ناو، نرخ، وێنە، مۆدێلی ٣٦٠ پلە، ڕەنگەکان، قەبارە، گەرەنتی و خاڵەکانی دروستکردن). هەر بەرهەمێک زیاد بکەیت یان بیسڕیتەوە ڕاستەوخۆ لە پەڕەی سەرەکی دەردەکەوێت.'
                : 'Test adding, editing, and deleting products with every architectural specification, finish swatch, 360° model shape, and care detail. Changes appear immediately on the landing page.'}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-canvas p-4 ring-1 ring-line">
            <div className="text-center px-2">
              <p className="font-display text-2xl font-semibold text-ink">{allProducts.length}</p>
              <p className="text-[11px] text-ink-soft">
                {locale === 'ckb' ? 'کۆی بەرهەمەکان' : 'Total Products'}
              </p>
            </div>
            <div className="h-8 w-px bg-line" />
            <div className="text-center px-2">
              <p className="font-display text-2xl font-semibold text-ok">
                {allProducts.filter((p) => p.status === 'active').length}
              </p>
              <p className="text-[11px] text-ink-soft">
                {locale === 'ckb' ? 'چالاک لە ماڵپەڕ' : 'Live on Site'}
              </p>
            </div>
          </div>
        </div>

        {/* Studio Mode Switcher: Product Builder vs Room Hotspot Image Builder */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => setWorkspaceTab('product')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all ${
              workspaceTab === 'product'
                ? 'bg-ink text-canvas shadow-tile'
                : 'bg-canvas text-ink-soft ring-1 ring-line hover:text-ink'
            }`}
          >
            <Layers className="size-4" />
            <span>
              {locale === 'ckb'
                ? 'دروستکردن و دەستکاری بەرهەم + ٣٦٠°'
                : locale === 'ar'
                ? 'إضافة وتعديل المنتجات + 360°'
                : 'Product & 360° Builder'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceTab('room')}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all ${
              workspaceTab === 'room'
                ? 'bg-ink text-canvas shadow-tile'
                : 'bg-canvas text-ink-soft ring-1 ring-line hover:text-ink'
            }`}
          >
            <MapPin className="size-4 text-accent" />
            <span>
              {locale === 'ckb'
                ? 'وێنەی ژوور و خاڵە زیندووەکان (Hotspot Dots)'
                : locale === 'ar'
                ? 'صورة الغرفة والنقاط التفاعلية (Hotspots)'
                : 'Room Photo & Hotspot Dots'}
            </span>
          </button>
        </div>
      </div>

      {workspaceTab === 'room' ? (
        <RoomHotspotEditor />
      ) : (
        <>

      {/* Floating Notification Banner */}
      <AnimatePresence>
        {bannerMsg && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`mb-6 flex items-center justify-between rounded-2xl px-5 py-3.5 text-[13.5px] font-medium shadow-lift ${
              bannerMsg.tone === 'ok'
                ? 'bg-ink text-canvas'
                : 'bg-danger text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Check className="size-4 text-accent" />
              <span>{bannerMsg.text}</span>
            </div>
            <Link
              href={`/product/${previewProduct.id}`}
              className="rounded-full bg-card/15 px-3 py-1 text-[12px] text-canvas hover:bg-card/25"
            >
              {locale === 'ckb' ? 'بینینی پەڕەی بەرهەم ←' : 'View Product Page →'}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Two-Column Builder */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left 7 Cols: Complete Specification Form */}
        <form onSubmit={handleSaveProduct} className="space-y-6 lg:col-span-7">
          {/* 1. Core Identity & Pricing */}
          <div className="tile space-y-5 p-6 sm:p-7">
            <div className="flex items-center justify-between border-b border-line pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[12px] font-semibold text-canvas">
                  1
                </span>
                <h2 className="font-display text-lg font-semibold text-ink">
                  {locale === 'ckb'
                    ? 'زانیاری سەرەکی و نرخ'
                    : locale === 'ar'
                    ? 'المعلومات الأساسية والسعر'
                    : 'Basic Identity, Category & Pricing'}
                </h2>
              </div>
              <span className="font-mono text-[11px] text-ink-soft">
                ID: {previewProduct.id}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb' ? 'ناوی بەرهەم *' : 'Product Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    locale === 'ckb'
                      ? 'بۆ نموونە: کورسی پشوودانی بۆڵێ'
                      : 'e.g. Böllé Lounge Chair'
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-4 text-[14px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                />
              </div>

              {/* Category selector + inline new category */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[12.5px] font-medium text-ink">
                    {locale === 'ckb' ? 'بەشی بەرهەم (Category) *' : 'Category *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setAddingCat((v) => !v)}
                    className="text-[11.5px] font-medium text-accent hover:underline"
                  >
                    {addingCat
                      ? locale === 'ckb'
                        ? 'پاشگەزبوونەوە'
                        : 'Cancel'
                      : locale === 'ckb'
                      ? '+ بەشی نوێ'
                      : '+ New Category'}
                  </button>
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-[13.5px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {localizeCategoryName(cat.id, categoriesById, locale)} ({cat.id})
                    </option>
                  ))}
                </select>
                {addingCat && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder={locale === 'ckb' ? 'ناوی بەشی نوێ...' : 'New category name...'}
                      className="h-9 flex-1 rounded-lg border border-line bg-canvas px-3 text-[12.5px]"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="rounded-lg bg-ink px-3 text-[12px] font-medium text-canvas"
                    >
                      {locale === 'ckb' ? 'زیادکردن' : 'Add'}
                    </button>
                  </div>
                )}
              </div>

              {/* Price USD */}
              <div>
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb' ? 'نرخ بە دۆلار ($ USD) *' : 'Price ($ USD) *'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="680"
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-4 font-mono text-[14px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                />
              </div>

              {/* Showroom Stock */}
              <div>
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb'
                    ? 'ژمارەی بەردەست لە پێشانگای سلێمانی *'
                    : 'Showroom Stock Count *'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="6"
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-4 font-mono text-[14px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                />
              </div>

              {/* Badge / Highlight Tag */}
              <div>
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb' ? 'باج / نیشانەی سەر کارد' : 'Badge / Highlight Tag'}
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder={
                    locale === 'ckb' ? 'پڕفرۆشترین، نوێ، تایبەت...' : 'Bestseller, New, Limited...'
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-[13.5px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {(locale === 'ckb'
                    ? ['پڕفرۆشترین', 'بەرهەمی نوێ', 'کاری دەست', 'تایبەت']
                    : ['Bestseller', 'New Arrival', 'Handcrafted', 'Limited']
                  ).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBadge(preset)}
                      className="rounded-full bg-canvas px-2.5 py-0.5 text-[11px] text-ink-soft ring-1 ring-line hover:bg-sand hover:text-ink"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Slug & Display Order */}
              <div>
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb' ? 'لینکی بەرهەم (URL Slug)' : 'Product URL Slug'}
                </label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  disabled={Boolean(editingId)}
                  dir="ltr"
                  placeholder={previewProduct.id}
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-3.5 font-mono text-[12.5px] text-ink focus:border-ink focus:bg-card focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb' ? 'ڕیزبەندی نمایش (Order)' : 'Display Order / Position'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-3.5 font-mono text-[13.5px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                />
              </div>

              {/* Status Toggle */}
              <div className="sm:col-span-2">
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb' ? 'بارودۆخی نمایش لە ماڵپەڕ' : 'Storefront Visibility Status'}
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-[13px] font-medium transition-all ${
                      status === 'active'
                        ? 'border-ink bg-ink text-canvas shadow-xs'
                        : 'border-line bg-canvas text-ink-soft hover:text-ink'
                    }`}
                  >
                    <span className="size-2 rounded-full bg-ok" />
                    {locale === 'ckb'
                      ? 'چالاک (ڕاستەوخۆ لە ماڵپەڕ دیارە)'
                      : 'Active (Live on Website)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-[13px] font-medium transition-all ${
                      status === 'draft'
                        ? 'border-ink bg-ink text-canvas shadow-xs'
                        : 'border-line bg-canvas text-ink-soft hover:text-ink'
                    }`}
                  >
                    <span className="size-2 rounded-full bg-warn" />
                    {locale === 'ckb' ? 'ڕەشنووس (شاراوە)' : 'Draft (Hidden Preview)'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Images, Card Backdrop Tint & 360° Model Shape */}
          <div className="tile space-y-5 p-6 sm:p-7">
            <div className="flex items-center justify-between border-b border-line pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[12px] font-semibold text-canvas">
                  2
                </span>
                <h2 className="font-display text-lg font-semibold text-ink">
                  {locale === 'ckb'
                    ? 'وێنەی بەرهەم، وێنەی ناو ژوور و مۆدێلی ٣٦٠°'
                    : locale === 'ar'
                    ? 'الصور ولون الخلفية ونموذج 360°'
                    : 'Studio Image, Room Scene & 360° Turntable Model'}
                </h2>
              </div>
              <ImageIcon className="size-4 text-ink-soft" />
            </div>

            {/* Studio Product Image */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-[12.5px] font-medium text-ink">
                  {locale === 'ckb'
                    ? 'وێنەی سەرەکی بەرهەم (Studio Image) *'
                    : 'Primary Studio Product Image *'}
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBgRemoverSource(image)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11.5px] font-semibold text-white shadow-xs hover:bg-ink"
                  >
                    <Scissors className="size-3.5" />
                    <span>
                      {locale === 'ckb'
                        ? 'لابردنی باکگراوند ($0 AI)'
                        : locale === 'ar'
                        ? 'إزالة الخلفية ($0 AI)'
                        : 'Remove Background ($0 AI)'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssetPickerTarget('main')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[11.5px] font-medium text-canvas hover:bg-accent"
                  >
                    <Cloud className="size-3.5" />
                    <span>
                      {locale === 'ckb'
                        ? 'بەستنەوەی وێنەی Sanity'
                        : locale === 'ar'
                        ? 'ربط أصل Sanity'
                        : 'Connect Sanity Asset'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => mainImageInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1 text-[11.5px] font-medium text-ink hover:bg-ink hover:text-canvas"
                  >
                    <Upload className="size-3.5" />
                    <span>
                      {locale === 'ckb'
                        ? 'بارکردنی وێنە لە مۆبایل / کۆمپیوتەر'
                        : 'Upload Custom Photo'}
                    </span>
                  </button>
                </div>
                <input
                  ref={mainImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'main')}
                  className="hidden"
                />
              </div>

              <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full bg-canvas px-3 py-1 text-[11.5px] text-ink-soft ring-1 ring-line">
                <input
                  type="checkbox"
                  checked={autoRemoveBg}
                  onChange={(e) => setAutoRemoveBg(e.target.checked)}
                  className="size-3.5 rounded accent-ink"
                />
                <span>
                  {locale === 'ckb'
                    ? 'لابردنی خۆکارانەی باکگراوند لە کاتی بارکردنی وێنەی بەرهەمدا (تەنها مۆبیلیات دەهێڵێتەوە)'
                    : locale === 'ar'
                    ? 'إزالة الخلفية تلقائياً فور رفع صورة المنتج (يُبقي الأثاث فقط)'
                    : 'Auto-remove background immediately on upload (keeps only the sofa/object · $0)'}
                </span>
              </label>

              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://cdn.sanity.io/images/... or /images/chair.webp"
                className="mt-2 h-10 w-full rounded-xl border border-line bg-canvas px-3.5 font-mono text-[12px] text-ink focus:border-ink focus:bg-card focus:outline-none"
              />

              <div className="mt-2.5 grid grid-cols-5 gap-2 sm:grid-cols-9">
                {STUDIO_IMAGE_PRESETS.map((preset) => {
                  const active = image === preset.path;
                  return (
                    <button
                      key={preset.path}
                      type="button"
                      onClick={() => setImage(preset.path)}
                      title={preset.label}
                      className={`aspect-square overflow-hidden rounded-xl border p-1.5 transition-all ${
                        active
                          ? 'border-ink bg-sand ring-2 ring-ink/20'
                          : 'border-line bg-canvas hover:border-ink/40'
                      }`}
                    >
                      <img
                        src={preset.path}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="size-full object-contain"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* In-the-Room Lifestyle Scene Image */}
            <div className="border-t border-line pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-[12.5px] font-medium text-ink">
                  {locale === 'ckb'
                    ? 'وێنەی ناو ژوور (In-the-Room Scene Photo)'
                    : 'In-the-Room Lifestyle Scene Photo'}
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAssetPickerTarget('scene')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1 text-[11.5px] font-medium text-ink hover:bg-ink hover:text-canvas"
                  >
                    <Cloud className="size-3.5" />
                    <span>
                      {locale === 'ckb'
                        ? 'بەستنەوەی وێنەی Sanity'
                        : locale === 'ar'
                        ? 'ربط أصل Sanity'
                        : 'Connect Sanity Asset'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => sceneImageInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-[11.5px] font-medium text-ink ring-1 ring-line hover:bg-sand"
                  >
                    <Upload className="size-3.5" />
                    <span>
                      {locale === 'ckb' ? 'بارکردنی وێنەی ژوور' : 'Upload Room Scene'}
                    </span>
                  </button>
                </div>
                <input
                  ref={sceneImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'scene')}
                  className="hidden"
                />
              </div>

              <input
                type="text"
                value={scene}
                onChange={(e) => setScene(e.target.value)}
                placeholder="https://cdn.sanity.io/images/... or /images/best-chair.jpg"
                className="mt-2 h-9 w-full rounded-xl border border-line bg-canvas px-3.5 font-mono text-[11.5px] text-ink focus:border-ink focus:bg-card focus:outline-none"
              />

              <div className="mt-2.5 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {SCENE_IMAGE_PRESETS.map((preset) => {
                  const active = scene === preset.path;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setScene(preset.path)}
                      className={`flex h-12 items-center justify-center overflow-hidden rounded-xl border text-[11px] font-medium transition-all ${
                        active
                          ? 'border-ink ring-2 ring-ink/20'
                          : 'border-line bg-canvas opacity-80 hover:opacity-100'
                      }`}
                    >
                      {preset.path ? (
                        <img
                          src={preset.path}
                          alt={preset.label}
                          referrerPolicy="no-referrer"
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="text-ink-soft">
                          {locale === 'ckb' ? 'بێ وێنە' : 'None'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Backdrop Tint & 360° Shape */}
            <div className="grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
              <div>
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb' ? 'ڕەنگی باکگراوندی کارد (Backdrop Tint)' : 'Card Backdrop Tint'}
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TINT_KEYS.map((tk) => (
                    <button
                      key={tk}
                      type="button"
                      onClick={() => setTint(tk)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium capitalize transition-all ${
                        TINT_BG[tk]
                      } ${
                        tint === tk
                          ? 'border-ink ring-2 ring-ink/20'
                          : 'border-line opacity-80 hover:opacity-100'
                      }`}
                    >
                      {tint === tk && <Check className="size-3.5 text-ink" />}
                      <span>{tk}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb'
                    ? 'شێوەی مۆدێلی سێ ڕەهەندی ٣٦٠° (360° 3D Shape)'
                    : '360° 3D Turntable Geometry'}
                </label>
                <select
                  value={view360Type}
                  onChange={(e) =>
                    setView360Type(e.target.value as 'auto' | 'chair' | 'table' | 'lamp' | 'vase')
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-[13px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                >
                  <option value="auto">
                    {locale === 'ckb' ? 'خۆکار بەپێی بەش (Auto-detect)' : 'Auto-detect from Category'}
                  </option>
                  <option value="chair">
                    {locale === 'ckb'
                      ? 'قەنەفە و کورسی پشوودان (Chair / Sofa)'
                      : 'Lounge Chair / Sofa (Sculpted Cushions)'}
                  </option>
                  <option value="table">
                    {locale === 'ckb'
                      ? 'مێزی دارتاشی (Architectural Table)'
                      : 'Architectural Table (Pedestal & Top)'}
                  </option>
                  <option value="lamp">
                    {locale === 'ckb'
                      ? 'گڵۆپ و چرا (Lamp & Shade)'
                      : 'Lighting / Lamp (Turned Shade & Warm Glow)'}
                  </option>
                  <option value="vase">
                    {locale === 'ckb'
                      ? 'سیرامیک و گوڵدان (Sculpted Ceramic)'
                      : 'Ceramic Vase / Object (Lathed Vessel)'}
                  </option>
                </select>
              </div>
            </div>

            {/* 360° Multi-Angle Camera Capture & Photo Sequence Builder */}
            <div className="space-y-4 border-t border-line pt-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Camera className="size-4 text-accent" />
                    <h3 className="font-display text-[15.5px] font-semibold text-ink">
                      {locale === 'ckb'
                        ? 'وێنەگرتن و دروستکردنی ٣٦٠° لە هەموو گۆشەکانەوە (Photo 360° Studio)'
                        : locale === 'ar'
                        ? 'التقاط صور من كل الزوايا لإنشاء عرض 360° حقيقي'
                        : 'Capture All Angles → Auto-Build Real Photo 360° Spin'}
                    </h3>
                  </div>
                  <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-ink-soft">
                    {locale === 'ckb'
                      ? 'پارچە مۆبیلیاتەکە لە ناوەڕاستدا دابنێ و بە دەوریدا وێنەی هەموو گۆشەکان بگرە (یان چەند وێنەیەک پێکەوە باربکە). سیستەمەکە خۆکارانە دەیانکاتە سووڕانەوەی ٣٦٠ پلە لەسەر پەڕەی بەرهەمەکە.'
                      : locale === 'ar'
                      ? 'ضع القطعة في المنتصف والتقط صوراً حولها بزوايا متساوية (0°، 30°، 60°...) أو ارفع الصور دفعة واحدة، وسيقوم النظام بتحويلها تلقائياً إلى عرض 360° تفاعلي.'
                      : 'Stand the furniture piece in one spot and capture photos step-by-step around all angles (or batch-upload your angle photos). The system stitches them automatically into a draggable 360° turntable.'}
                  </p>
                </div>

                {/* Target Angle Count Selector */}
                <div className="flex items-center gap-1.5 rounded-full bg-canvas p-1 ring-1 ring-line">
                  <span className="px-2 text-[11px] font-medium text-ink-soft">
                    {locale === 'ckb' ? 'ژمارەی گۆشە:' : 'Angles:'}
                  </span>
                  {([8, 12, 16, 24] as const).map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setTargetAngles(cnt)}
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium transition-colors ${
                        targetAngles === cnt
                          ? 'bg-ink text-canvas'
                          : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Visual Camera Angle Map & Live Example Viewport */}
              <AngleCaptureGuide
                locale={locale}
                targetAngles={targetAngles}
                capturedCount={frames360.length}
                view360Type={view360Type}
                category={category}
                finishColor={finishes[0]?.color ?? '#d8c4a4'}
                onGenerateDemoFrames={(demoFrames) => {
                  setFrames360(demoFrames);
                  setPreviewTab('360');
                  previewCardRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                  });
                  showNotice(
                    locale === 'ckb'
                      ? `${demoFrames.length} گۆشەی نموونەیی دروست کران — ئێستا لە لای ڕاست ٣٦٠° تاقی بکەرەوە!`
                      : locale === 'ar'
                      ? `تم توليد ${demoFrames.length} زاوية تجريبية — جرّب التدوير الآن!`
                      : `Generated ${demoFrames.length}-angle sample sequence — drag the 360° preview now!`
                  );
                }}
              />

              {/* Capture & Batch Upload Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {!cameraOpen ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[12.5px] font-medium text-canvas shadow-xs transition-colors hover:bg-accent"
                  >
                    <Video className="size-3.5" />
                    <span>
                      {locale === 'ckb'
                        ? 'کردنەوەی کامێرای ڕێنماییکراوی ٣٦٠°'
                        : locale === 'ar'
                        ? 'فتح الكاميرا الموجهة 360°'
                        : 'Open Guided 360° Camera'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="inline-flex items-center gap-2 rounded-full bg-danger px-4 py-2 text-[12.5px] font-medium text-white shadow-xs"
                  >
                    <X className="size-3.5" />
                    <span>{locale === 'ckb' ? 'داخستنی کامێرا' : 'Close Camera'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => nativeCameraCaptureRef.current?.click()}
                  disabled={uploadingFrames}
                  className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3.5 py-2 text-[12.5px] font-medium text-ink transition-colors hover:bg-ink hover:text-canvas disabled:opacity-50"
                >
                  <Camera className="size-3.5" />
                  <span>
                    {locale === 'ckb'
                      ? 'گرتن بە کامێرای مۆبایل'
                      : locale === 'ar'
                      ? 'التقاط بكاميرا الهاتف'
                      : 'Take Angle (Phone Camera)'}
                  </span>
                </button>
                <input
                  ref={nativeCameraCaptureRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleBatchFrameUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => multiFrameInputRef.current?.click()}
                  disabled={uploadingFrames}
                  className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-2 text-[12.5px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-sand disabled:opacity-50"
                >
                  <Images className="size-3.5" />
                  <span>
                    {uploadingFrames
                      ? locale === 'ckb'
                        ? 'بارکردن...'
                        : 'Processing...'
                      : locale === 'ckb'
                      ? 'بارکردنی چەند وێنەیەک پێکەوە'
                      : locale === 'ar'
                      ? 'رفع عدة صور معاً'
                      : 'Batch Upload Angle Photos'}
                  </span>
                </button>
                <input
                  ref={multiFrameInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBatchFrameUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => setAssetPickerTarget('360')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-2 text-[12.5px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-sand"
                >
                  <Cloud className="size-3.5" />
                  <span>
                    {locale === 'ckb'
                      ? 'هەڵبژاردن لە Sanity'
                      : locale === 'ar'
                      ? 'اختيار من Sanity'
                      : 'Connect Sanity Assets'}
                  </span>
                </button>

                {/* Angle Progress Pill */}
                <span
                  dir="ltr"
                  className={`ms-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-semibold ${
                    frames360.length >= 2
                      ? 'bg-ok/15 text-ok'
                      : 'bg-canvas text-ink-soft ring-1 ring-line'
                  }`}
                >
                  {frames360.length}/{targetAngles} angles ·{' '}
                  {Math.min(
                    360,
                    Math.round((frames360.length / targetAngles) * 360)
                  )}
                  °
                </span>
              </div>

              {cameraError && (
                <div className="rounded-xl border border-warn/40 bg-warn/10 px-4 py-2.5 text-[12px] text-ink">
                  {cameraError}
                </div>
              )}

              {/* Live Guided Camera Viewfinder */}
              {cameraOpen && (
                <div className="relative overflow-hidden rounded-2xl border border-line bg-ink">
                  <div className="relative aspect-square max-h-[420px] w-full">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="size-full object-cover"
                    />

                    {/* Onion-Skin Alignment Overlay from previous shot */}
                    {onionSkin && frames360.length > 0 && (
                      <img
                        src={frames360[frames360.length - 1]}
                        alt="Previous angle ghost alignment"
                        className="pointer-events-none absolute inset-0 size-full object-contain opacity-30"
                      />
                    )}

                    {/* Center Crosshair Guide */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="size-48 rounded-full border border-dashed border-white/40" />
                      <div className="absolute h-6 w-px bg-white/60" />
                      <div className="absolute h-px w-6 bg-white/60" />
                    </div>

                    {/* Top Camera HUD */}
                    <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                      <span
                        dir="ltr"
                        className="rounded-full bg-ink/80 px-3 py-1 font-mono text-[11.5px] font-semibold text-canvas backdrop-blur"
                      >
                        Next Angle: #{frames360.length + 1} ·{' '}
                        {Math.round(((frames360.length % targetAngles) / targetAngles) * 360)}° (Step{' '}
                        {Math.round(360 / targetAngles)}°)
                      </span>

                      <button
                        type="button"
                        onClick={() => setOnionSkin((v) => !v)}
                        className={`rounded-full px-3 py-1 text-[11px] font-medium backdrop-blur ${
                          onionSkin
                            ? 'bg-accent text-ink'
                            : 'bg-ink/70 text-canvas'
                        }`}
                      >
                        {locale === 'ckb'
                          ? onionSkin
                            ? 'ڕێنمای سێبەر: چالاک'
                            : 'ڕێنمای سێبەر: ناچالاک'
                          : `Ghost Overlay: ${onionSkin ? 'On' : 'Off'}`}
                      </button>
                    </div>

                    {/* Shutter Capture Bar */}
                    <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3 px-4">
                      <button
                        type="button"
                        onClick={captureAngleFromVideo}
                        className="inline-flex items-center gap-2 rounded-full bg-card px-6 py-2.5 text-[13px] font-semibold text-ink shadow-lift transition-transform active:scale-95 hover:bg-sand"
                      >
                        <Camera className="size-4 text-accent" />
                        <span>
                          {locale === 'ckb'
                            ? `گرتنی گۆشەی #${frames360.length + 1}`
                            : `Capture Angle #${frames360.length + 1}`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Captured / Uploaded Frames Strip & Sequence Controls */}
              {frames360.length > 0 && (
                <div className="space-y-3 rounded-2xl bg-canvas p-4 ring-1 ring-line">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-ink">
                      {locale === 'ckb'
                        ? `وێنە تۆمارکراوەکان (${frames360.length} گۆشە) · ڕیزبەندی لە چەپەوە بۆ ڕاست`
                        : `${frames360.length} Angle Frames Ready · Order Around Piece`}
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {frames360.length >= 2 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setFrames360((prev) => [...prev].reverse())
                            }
                            className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[11px] font-medium text-ink ring-1 ring-line hover:bg-sand"
                          >
                            <ArrowLeftRight className="size-3" />
                            <span>
                              {locale === 'ckb' ? 'پێچەوانەکردنی ڕیزبەند' : 'Reverse Order'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewTab('360');
                              previewCardRef.current?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                              });
                            }}
                            className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-[11px] font-medium text-canvas hover:bg-accent"
                          >
                            <RotateCcw className="size-3" />
                            <span>
                              {locale === 'ckb'
                                ? 'تاقیکردنەوەی ٣٦٠° ←'
                                : 'Preview 360° Spin →'}
                            </span>
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setFrames360([])}
                        className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2.5 py-1 text-[11px] font-medium text-danger hover:bg-danger hover:text-white"
                      >
                        <Trash2 className="size-3" />
                        <span>{locale === 'ckb' ? 'سڕینەوەی هەموو' : 'Clear All'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {frames360.map((frameSrc, idx) => {
                      const angleDeg = Math.round((idx / frames360.length) * 360);
                      const isMainCover = image === frameSrc;
                      return (
                        <div
                          key={`${idx}-${frameSrc.slice(0, 28)}`}
                          className="group relative overflow-hidden rounded-xl border border-line bg-card p-1.5"
                        >
                          <div className="relative aspect-square overflow-hidden rounded-lg bg-canvas">
                            <img
                              src={frameSrc}
                              alt={`Angle ${angleDeg}°`}
                              referrerPolicy="no-referrer"
                              className="size-full object-contain"
                            />
                            <span
                              dir="ltr"
                              className="absolute start-1 top-1 rounded bg-ink/80 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-canvas"
                            >
                              #{idx + 1} · {angleDeg}°
                            </span>
                          </div>

                          <div className="mt-1 flex items-center justify-between gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveFrame(idx, -1)}
                              title="Move earlier"
                              className="grid size-6 place-items-center rounded text-ink-soft hover:bg-canvas hover:text-ink disabled:opacity-30"
                            >
                              <ChevronLeft className="size-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setImage(frameSrc);
                                showNotice(
                                  locale === 'ckb'
                                    ? 'ئەم گۆشەیە وەک وێنەی سەرەکی دیاری کرا'
                                    : 'Set as primary studio photo'
                                );
                              }}
                              title="Use as Main Studio Image"
                              className={`grid size-6 place-items-center rounded transition-colors ${
                                isMainCover
                                  ? 'bg-accent/25 text-ink'
                                  : 'text-ink-soft hover:bg-canvas hover:text-ink'
                              }`}
                            >
                              <Star className="size-3" />
                            </button>

                            <button
                              type="button"
                              disabled={idx === frames360.length - 1}
                              onClick={() => moveFrame(idx, 1)}
                              title="Move later"
                              className="grid size-6 place-items-center rounded text-ink-soft hover:bg-canvas hover:text-ink disabled:opacity-30"
                            >
                              <ChevronRight className="size-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFrames360((prev) => prev.filter((_, i) => i !== idx))
                              }
                              title="Remove frame"
                              className="grid size-6 place-items-center rounded text-ink-soft hover:bg-danger/10 hover:text-danger"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Material Finishes & Color Swatches */}
          <div className="tile space-y-4 p-6 sm:p-7">
            <div className="flex items-center justify-between border-b border-line pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[12px] font-semibold text-canvas">
                  3
                </span>
                <h2 className="font-display text-lg font-semibold text-ink">
                  {locale === 'ckb'
                    ? 'ڕەنگەکان و جۆری ڕووپۆش (Finishes & Color Swatches)'
                    : 'Material Finishes & Color Swatches'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFinishes((prev) => [...prev, { name: '', color: '#c8955a' }])
                }
                className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-[12px] font-medium text-canvas hover:bg-accent"
              >
                <Plus className="size-3.5" />
                <span>{locale === 'ckb' ? 'زیادکردنی ڕەنگ' : 'Add Finish'}</span>
              </button>
            </div>

            {/* Full Color & Finish Palette Library */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11.5px] text-ink-soft">
                  {locale === 'ckb'
                    ? 'هەموو ڕەنگ و جۆرەکانی دار، قوماش، چەرم و کانزا — کرتە بکە بۆ زیادکردنی خێرا یان کۆدی ڕەنگەکە بگۆڕە:'
                    : locale === 'ar'
                    ? 'اختر من جميع الألوان والخامات (أو حدد أي لون مخصص من لوحة الألوان):'
                    : 'All colors & finishes (Neutrals, Woods, Blues, Greens, Warm Accents, Metals) — click to add or customize any hex:'}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {COLOR_GROUP_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setColorGroupFilter(tab.id)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      colorGroupFilter === tab.id
                        ? 'bg-ink text-canvas'
                        : 'bg-canvas text-ink-soft ring-1 ring-line hover:text-ink'
                    }`}
                  >
                    {tab[locale]}
                  </button>
                ))}
              </div>

              <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-2xl bg-canvas/70 p-2.5 ring-1 ring-line">
                {COLOR_SWATCH_LIBRARY.filter(
                  (sw) => colorGroupFilter === 'all' || sw.group === colorGroupFilter
                ).map((sw) => (
                  <button
                    key={`${sw.en}-${sw.color}`}
                    type="button"
                    onClick={() =>
                      setFinishes((prev) => [
                        ...prev,
                        {
                          name: sw[locale],
                          color: sw.color,
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[11px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-sand"
                  >
                    <span
                      className="size-3.5 shrink-0 rounded-full ring-1 ring-ink/25"
                      style={{ backgroundColor: sw.color }}
                    />
                    <span>{sw[locale]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {finishes.map((fin, idx) => {
                const isFinSoldOut = Boolean(fin.soldOut) || fin.stock === 0;
                const safePickerColor = /^#[0-9a-f]{6}$/i.test(fin.color)
                  ? fin.color
                  : '#d8c4a4';
                return (
                  <div
                    key={idx}
                    className={`flex flex-wrap items-center gap-2 rounded-2xl border p-2 transition-colors ${
                      isFinSoldOut
                        ? 'border-danger/35 bg-danger/5'
                        : 'border-line bg-canvas/50'
                    }`}
                  >
                    <input
                      type="color"
                      value={safePickerColor}
                      title={
                        locale === 'ckb'
                          ? 'هەموو ڕەنگەکانی سپێکتەرم هەڵبژێرە'
                          : 'Pick any custom spectrum color'
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setFinishes((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, color: val } : item))
                        );
                      }}
                      className="h-9 w-11 shrink-0 cursor-pointer rounded-xl border border-line bg-canvas p-1"
                    />
                    <input
                      type="text"
                      value={fin.color}
                      dir="ltr"
                      maxLength={7}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFinishes((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, color: val } : item))
                        );
                      }}
                      placeholder="#d8c4a4"
                      title="Hex Color Code"
                      className="h-9 w-20 shrink-0 rounded-xl border border-line bg-card px-2 text-center font-mono text-[11.5px] text-ink focus:border-ink focus:outline-none"
                    />
                    <input
                      type="text"
                      value={fin.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFinishes((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                        );
                      }}
                      placeholder={
                        locale === 'ckb'
                          ? 'ناوی ڕەنگ یان کەرەستە (بۆ نموونە: شینی نیلی، سوور، بەڕووی سروشتی)'
                          : locale === 'ar'
                          ? 'اسم اللون أو الخامة (مثال: أزرق داكن، أبيض، بلوط)'
                          : 'Color / finish name (e.g. Midnight Navy, Pure White, Natural Oak)'
                      }
                      className="h-9 min-w-[140px] flex-1 rounded-xl border border-line bg-card px-3 text-[13px] text-ink focus:border-ink focus:outline-none"
                    />

                    {/* Optional per-color stock count */}
                    <input
                      type="number"
                      min="0"
                      value={typeof fin.stock === 'number' ? fin.stock : ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setFinishes((prev) =>
                          prev.map((item, i) => {
                            if (i !== idx) return item;
                            if (raw === '') {
                              const { stock: _removed, ...rest } = item;
                              void _removed;
                              return rest;
                            }
                            const num = Math.max(0, Number(raw) || 0);
                            return { ...item, stock: num, soldOut: num === 0 };
                          })
                        );
                      }}
                      title={
                        locale === 'ckb'
                          ? 'ژمارەی بەردەست بۆ ئەم ڕەنگە (ئارەزوومەندانە)'
                          : 'Available qty for this color (optional)'
                      }
                      placeholder={locale === 'ckb' ? 'ژمارە' : 'Qty'}
                      className="h-9 w-16 rounded-xl border border-line bg-card px-2 text-center font-mono text-[12px] text-ink focus:border-ink focus:outline-none"
                    />

                    {/* Per-color Available / Sold Out Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setFinishes((prev) =>
                          prev.map((item, i) => {
                            if (i !== idx) return item;
                            const nextSoldOut = !(Boolean(item.soldOut) || item.stock === 0);
                            return {
                              ...item,
                              soldOut: nextSoldOut,
                              ...(!nextSoldOut && item.stock === 0 ? { stock: undefined } : {}),
                            };
                          })
                        )
                      }
                      className={`h-9 rounded-xl px-3 text-[11.5px] font-semibold transition-colors ${
                        isFinSoldOut
                          ? 'bg-danger text-white hover:bg-danger/90'
                          : 'bg-ok/15 text-ok hover:bg-ok/25'
                      }`}
                    >
                      {isFinSoldOut
                        ? locale === 'ckb'
                          ? 'لەم ڕەنگەدا نەماوە'
                          : locale === 'ar'
                          ? 'نفد هذا اللون'
                          : 'Sold out'
                        : locale === 'ckb'
                        ? 'بەردەستە'
                        : locale === 'ar'
                        ? 'متوفر'
                        : 'Available'}
                    </button>

                    {finishes.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setFinishes((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="grid size-9 place-items-center rounded-xl text-ink-soft hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Editorial Story & Description */}
          <div className="tile space-y-4 p-6 sm:p-7">
            <div className="flex items-center justify-between border-b border-line pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[12px] font-semibold text-canvas">
                  4
                </span>
                <h2 className="font-display text-lg font-semibold text-ink">
                  {locale === 'ckb'
                    ? 'چیرۆک و وەسفی بەرهەم (Description & Story)'
                    : 'Editorial Story & Description'}
                </h2>
              </div>
            </div>

            <div>
              <label className="block text-[12.5px] font-medium text-ink">
                {locale === 'ckb'
                  ? 'وەسفی بەرهەم لە پەڕەی وردەکاری *'
                  : 'Product Overview / Editorial Blurb *'}
              </label>
              <textarea
                rows={3}
                required
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                placeholder={
                  locale === 'ckb'
                    ? 'باسی کەرەستە، شێوازی دروستکردن و هەستی بەرهەمەکە لە ناو ماڵدا بکە...'
                    : 'Describe the proportions, materials, and how the piece settles into a calm home...'
                }
                className="mt-1.5 w-full rounded-xl border border-line bg-canvas p-3.5 text-[14px] leading-relaxed text-ink focus:border-ink focus:bg-card focus:outline-none"
              />
            </div>
          </div>

          {/* 5. Complete Architectural Specifications, Features & Care */}
          <div className="tile space-y-5 p-6 sm:p-7">
            <div className="flex items-center justify-between border-b border-line pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[12px] font-semibold text-canvas">
                  5
                </span>
                <h2 className="font-display text-lg font-semibold text-ink">
                  {locale === 'ckb'
                    ? 'پێوانەکان، تایبەتمەندییەکان و پاراستن (All Specifications)'
                    : 'Dimensions, Construction Features & Specifications'}
                </h2>
              </div>
              <Ruler className="size-4 text-ink-soft" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb'
                    ? 'قەبارە و پێوانەکان (Dimensions: پانی × قووڵی × بەرزی)'
                    : 'Dimensions (Width × Depth × Height)'}
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="W 78 × D 84 × H 73 cm · Seat H 40 cm"
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-4 font-mono text-[13.5px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb' ? 'کەرەستەی سەرەکی (Primary Material)' : 'Primary Material'}
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder={
                    locale === 'ckb'
                      ? '١٠٠٪ دار بەڕووی سروشتی FSC®'
                      : '100% FSC® Solid European Oak'
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-[13.5px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb' ? 'کێشی بەرهەم (Weight)' : 'Weight'}
                </label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="18.5 kg"
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-3.5 font-mono text-[13.5px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb' ? 'گەرەنتی (Warranty)' : 'Warranty'}
                </label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  placeholder={
                    locale === 'ckb'
                      ? '١٠ ساڵ گەرەنتی چوارچێوە'
                      : '10-Year Frame Warranty'
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-[13.5px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb'
                    ? 'ئامادەبوون و گەیاندن (Availability & Delivery)'
                    : 'Availability & Delivery'}
                </label>
                <input
                  type="text"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                  placeholder={
                    locale === 'ckb'
                      ? 'بەردەستە لە پێشانگای سلێمانی · گەیاندنی بێبەرامبەر'
                      : 'On display in Sulaymaniyah · Free delivery'
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-3.5 text-[13.5px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                />
              </div>
            </div>

            {/* Construction & Feature Bullet Points */}
            <div className="border-t border-line pt-4">
              <div className="flex items-center justify-between">
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb'
                    ? 'خاڵە گرنگەکانی دروستکردن و تایبەتمەندییەکان (Features & Highlights)'
                    : 'Construction & Feature Highlights'}
                </label>
              </div>

              {/* Quick preset feature chips */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {featurePresets.map((fp) => (
                  <button
                    key={fp}
                    type="button"
                    onClick={() => {
                      if (!details.includes(fp)) {
                        setDetails((prev) => [...prev, fp]);
                      }
                    }}
                    className="rounded-full bg-canvas px-2.5 py-1 text-[11px] text-ink-soft ring-1 ring-line transition-colors hover:bg-sand hover:text-ink"
                  >
                    + {fp}
                  </button>
                ))}
              </div>

              <div className="mt-3 space-y-2">
                {details.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="size-2 shrink-0 rounded-full bg-ink" />
                    <input
                      type="text"
                      value={line}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDetails((prev) => prev.map((d, i) => (i === idx ? val : d)));
                      }}
                      className="h-9 flex-1 rounded-xl border border-line bg-canvas px-3 text-[13px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDetails((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="grid size-9 place-items-center rounded-xl text-ink-soft hover:bg-canvas hover:text-danger"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newDetailText}
                    onChange={(e) => setNewDetailText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newDetailText.trim()) {
                          setDetails((prev) => [...prev, newDetailText.trim()]);
                          setNewDetailText('');
                        }
                      }
                    }}
                    placeholder={
                      locale === 'ckb'
                        ? 'تایبەتمەندییەکی نوێ بنووسە و کرتە لە زیادکردن بکە...'
                        : 'Write a new feature highlight and click Add...'
                    }
                    className="h-10 flex-1 rounded-xl border border-line bg-canvas px-3.5 text-[13px] text-ink focus:border-ink focus:bg-card focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newDetailText.trim()) {
                        setDetails((prev) => [...prev, newDetailText.trim()]);
                        setNewDetailText('');
                      }
                    }}
                    className="rounded-xl bg-sand px-4 text-[12.5px] font-medium text-ink hover:bg-ink hover:text-canvas"
                  >
                    {locale === 'ckb' ? '+ زیادکردن' : '+ Add Line'}
                  </button>
                </div>
              </div>
            </div>

            {/* Extra Custom Specification Key-Value Pairs */}
            <div className="border-t border-line pt-4">
              <div className="flex items-center justify-between">
                <label className="block text-[12.5px] font-medium text-ink">
                  {locale === 'ckb'
                    ? 'تایبەتمەندی زیادەی تایبەت (Custom Specification Rows)'
                    : 'Additional Custom Specifications (Label + Value)'}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setCustomSpecs((prev) => [...prev, { label: '', value: '' }])
                  }
                  className="text-[11.5px] font-medium text-accent hover:underline"
                >
                  {locale === 'ckb' ? '+ زیادکردنی خانەی نوێ' : '+ Add Spec Row'}
                </button>
              </div>

              <div className="mt-2.5 space-y-2">
                {customSpecs.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomSpecs((prev) =>
                          prev.map((s, i) => (i === idx ? { ...s, label: val } : s))
                        );
                      }}
                      placeholder={locale === 'ckb' ? 'ناونیشان (مەسەلەن: بەرزی دانیشتن)' : 'Label (e.g. Seat Height)'}
                      className="h-9 w-2/5 rounded-xl border border-line bg-canvas px-3 text-[12.5px] text-ink"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomSpecs((prev) =>
                          prev.map((s, i) => (i === idx ? { ...s, value: val } : s))
                        );
                      }}
                      placeholder={locale === 'ckb' ? 'بەها (مەسەلەن: 40 سم)' : 'Value (e.g. 40 cm)'}
                      className="h-9 flex-1 rounded-xl border border-line bg-canvas px-3 text-[12.5px] text-ink"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setCustomSpecs((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="grid size-9 place-items-center rounded-xl text-ink-soft hover:text-danger"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Care & Longevity */}
            <div className="border-t border-line pt-4">
              <label className="block text-[12.5px] font-medium text-ink">
                {locale === 'ckb'
                  ? 'ڕێنمایی پاراستن و خاوێنکردنەوە (Care & Maintenance)'
                  : 'Care & Maintenance Instructions'}
              </label>
              <textarea
                rows={2}
                value={care}
                onChange={(e) => setCare(e.target.value)}
                placeholder={
                  locale === 'ckb'
                    ? 'چۆنیەتی خاوێنکردنەوە و پاراستنی دار و قوماشەکە...'
                    : 'Wipe with a soft damp cloth. Re-oil solid timber annually...'
                }
                className="mt-1.5 w-full rounded-xl border border-line bg-canvas p-3 text-[13.5px] text-ink focus:border-ink focus:bg-card focus:outline-none"
              />
            </div>

            {/* Submit Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              {editingId ? (
                <button
                  type="button"
                  onClick={handleResetBlank}
                  className="rounded-full border border-line px-5 py-3 text-[13px] font-medium text-ink-soft hover:border-ink hover:text-ink"
                >
                  {locale === 'ckb' ? 'پاشگەزبوونەوە لە دەستکاری' : 'Cancel Edit'}
                </button>
              ) : (
                <span className="text-[12px] text-ink-soft">
                  {locale === 'ckb'
                    ? 'هەموو گۆڕانکارییەکان ڕاستەوخۆ لە پەڕەی سەرەکی دەردەکەون'
                    : 'All fields are ready for Sanity CMS schema'}
                </span>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-[14px] font-semibold text-canvas shadow-lift transition-transform active:scale-98 hover:bg-accent disabled:opacity-50"
              >
                <Plus className="size-4" />
                <span>
                  {saving
                    ? locale === 'ckb'
                      ? 'پاشەکەوت دەکرێت...'
                      : 'Saving...'
                    : editingId
                    ? locale === 'ckb'
                      ? 'پاشەکەوتکردنی گۆڕانکارییەکان'
                      : 'Save Product Changes'
                    : locale === 'ckb'
                    ? 'زیادکردنی بەرهەم بۆ ماڵپەڕ'
                    : 'Add Product to Catalog'}
                </span>
              </button>
            </div>
          </div>
        </form>

        {/* Right 5 Cols: Sticky Live Preview & Sanity Document Inspector */}
        <div ref={previewCardRef} className="space-y-5 lg:sticky lg:top-24 lg:col-span-5">
          <div className="tile overflow-hidden p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3.5">
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">
                  {locale === 'ckb' ? 'پێشبینینی زیندوو' : 'Live Interactive Preview'}
                </p>
                <h3 className="font-display text-base font-semibold text-ink">
                  {previewProduct.name}
                </h3>
              </div>

              {/* Preview Mode Tabs */}
              <div className="flex rounded-full bg-canvas p-1 ring-1 ring-line">
                {(
                  [
                    ['card', locale === 'ckb' ? 'کارد' : 'Card', Layers],
                    ['360', '360°', RotateCcw],
                    ['specs', locale === 'ckb' ? 'زانیاری' : 'Specs', Ruler],
                    ['sanity', 'Sanity', Code2],
                  ] as const
                ).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPreviewTab(id)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                      previewTab === id
                        ? 'bg-ink text-canvas'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <Icon className="size-3" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              {previewTab === 'card' && (
                <div className="mx-auto max-w-xs">
                  <ProductCard product={previewProduct} />
                </div>
              )}

              {previewTab === '360' && (
                <div
                  className={`relative aspect-square w-full overflow-hidden rounded-3xl ${
                    TINT_BG[previewProduct.tint]
                  }`}
                >
                  <Product360Viewer
                    product={previewProduct}
                    activeFinishColor={previewProduct.finishes[0]?.color ?? '#d8c4a4'}
                    activeFinishName={previewProduct.finishes[0]?.name}
                  />
                </div>
              )}

              {previewTab === 'specs' && (
                <div className="space-y-3 rounded-2xl bg-canvas p-4 text-[13px]">
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <span className="font-semibold text-ink">{previewProduct.name}</span>
                    <span dir="ltr" className="font-display text-lg font-semibold text-ink">
                      {formatPrice(previewProduct.price)}
                    </span>
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-ink-soft">
                    {previewProduct.blurb}
                  </p>
                  <div className="rounded-xl bg-card p-3 space-y-1.5">
                    <p className="font-mono text-[11px] uppercase text-ink-soft">
                      {locale === 'ckb' ? 'پێوانەکان' : 'Dimensions'}
                    </p>
                    <p className="font-mono text-[12.5px] font-medium text-ink">
                      {previewProduct.dimensions}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    {previewProduct.material && (
                      <div className="rounded-xl bg-card p-2.5">
                        <span className="block text-[10.5px] text-ink-soft">
                          {locale === 'ckb' ? 'کەرەستە' : 'Material'}
                        </span>
                        <span className="font-medium text-ink">{previewProduct.material}</span>
                      </div>
                    )}
                    {previewProduct.weight && (
                      <div className="rounded-xl bg-card p-2.5">
                        <span className="block text-[10.5px] text-ink-soft">
                          {locale === 'ckb' ? 'کێش' : 'Weight'}
                        </span>
                        <span className="font-mono font-medium text-ink">{previewProduct.weight}</span>
                      </div>
                    )}
                    {previewProduct.warranty && (
                      <div className="rounded-xl bg-card p-2.5">
                        <span className="block text-[10.5px] text-ink-soft">
                          {locale === 'ckb' ? 'گەرەنتی' : 'Warranty'}
                        </span>
                        <span className="font-medium text-ink">{previewProduct.warranty}</span>
                      </div>
                    )}
                    {previewProduct.leadTime && (
                      <div className="rounded-xl bg-card p-2.5">
                        <span className="block text-[10.5px] text-ink-soft">
                          {locale === 'ckb' ? 'گەیاندن' : 'Delivery'}
                        </span>
                        <span className="font-medium text-ink">{previewProduct.leadTime}</span>
                      </div>
                    )}
                  </div>
                  {previewProduct.details.length > 0 && (
                    <div className="rounded-xl bg-card p-3">
                      <p className="mb-1.5 font-mono text-[10.5px] uppercase text-ink-soft">
                        {locale === 'ckb' ? 'خاڵەکانی دروستکردن' : 'Highlights'}
                      </p>
                      <ul className="space-y-1 text-[12px] text-ink-soft">
                        {previewProduct.details.map((d, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {previewTab === 'sanity' && (
                <div>
                  <p className="mb-2 text-[11.5px] text-ink-soft">
                    {locale === 'ckb'
                      ? 'ئەمە کۆدی دۆکیومێنتی Sanity یە کە بۆ ئەم بەرهەمە دروست دەکرێت:'
                      : 'Exact Sanity CMS document payload generated by this form:'}
                  </p>
                  <pre
                    dir="ltr"
                    className="max-h-[420px] overflow-auto rounded-2xl bg-ink p-4 font-mono text-[11px] leading-relaxed text-canvas"
                  >
                    {sanityJsonPreview}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Existing Products Manager (Edit & Delete Any Product) */}
      <div className="tile mt-12 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
              {locale === 'ckb' ? 'بەڕێوەبردنی کەتەلۆگ' : 'Catalog Inventory Manager'}
            </p>
            <h2 className="display mt-1 text-2xl font-semibold text-ink">
              {locale === 'ckb'
                ? `هەموو بەرهەمەکان (${allProducts.length}) · دەستکاری و سڕینەوە`
                : `All Products (${allProducts.length}) · Edit & Delete`}
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locale === 'ckb' ? 'گەڕان لە ناو بەرهەمەکان...' : 'Search products...'
              }
              className="h-10 w-full rounded-full border border-line bg-canvas ps-10 pe-4 text-[13px] text-ink focus:border-ink focus:bg-card focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((rawProd) => {
            const locProd = localizeProduct(rawProd, locale);
            const catLabel = localizeCategoryName(rawProd.category, categoriesById, locale);
            const isBeingEdited = editingId === rawProd.id;

            return (
              <div
                key={rawProd.id}
                className={`flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                  isBeingEdited
                    ? 'border-ink bg-sand/50 ring-2 ring-ink/15'
                    : 'border-line bg-canvas/70 hover:border-ink/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <Link
                    href={`/product/${rawProd.id}`}
                    className={`grid size-18 shrink-0 place-items-center overflow-hidden rounded-2xl p-2 ${
                      TINT_BG[rawProd.tint] ?? 'bg-stone'
                    }`}
                  >
                    <img
                      src={rawProd.image}
                      alt={locProd.name}
                      referrerPolicy="no-referrer"
                      className="size-full object-contain"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-[10.5px] uppercase text-ink-soft">
                        {catLabel}
                      </span>
                      <span
                        dir="ltr"
                        className="shrink-0 font-display text-[15px] font-semibold text-ink"
                      >
                        {formatPrice(rawProd.price)}
                      </span>
                    </div>

                    <Link
                      href={`/product/${rawProd.id}`}
                      className="mt-0.5 block truncate text-[15px] font-semibold text-ink hover:underline"
                    >
                      {locProd.name}
                    </Link>

                    <p className="mt-1 truncate font-mono text-[11px] text-ink-soft">
                      {locProd.dimensions}
                    </p>

                    <div className="mt-2.5 space-y-2">
                      {/* Quick Stock Count Stepper & Sold Out Toggle */}
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-2.5 py-1.5 ring-1 ring-line">
                        <span
                          className={`text-[11px] font-semibold ${
                            rawProd.stock <= 0 ? 'text-danger' : 'text-ink-soft'
                          }`}
                        >
                          {rawProd.stock <= 0
                            ? locale === 'ckb'
                              ? 'نەماوە (0)'
                              : locale === 'ar'
                              ? 'نفد (0)'
                              : 'Sold out (0)'
                            : `${rawProd.stock} ${
                                locale === 'ckb'
                                  ? 'بەردەستە'
                                  : locale === 'ar'
                                  ? 'متوفر'
                                  : 'available'
                              }`}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(rawProd, rawProd.stock - 1)}
                            disabled={rawProd.stock <= 0}
                            title={
                              locale === 'ckb'
                                ? 'کەمکردنەوەی ژمارەی بەردەست (-1)'
                                : 'Decrease available count (-1)'
                            }
                            aria-label="Decrease stock"
                            className="grid size-6 place-items-center rounded-full bg-canvas text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-canvas disabled:opacity-35"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span
                            dir="ltr"
                            className="min-w-[20px] text-center font-mono text-[11.5px] font-semibold text-ink"
                          >
                            {rawProd.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(rawProd, rawProd.stock + 1)}
                            title={
                              locale === 'ckb'
                                ? 'زیادکردنی ژمارەی بەردەست (+1)'
                                : 'Increase available count (+1)'
                            }
                            aria-label="Increase stock"
                            className="grid size-6 place-items-center rounded-full bg-canvas text-ink ring-1 ring-line transition-colors hover:bg-ink hover:text-canvas"
                          >
                            <Plus className="size-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleAdjustStock(rawProd, rawProd.stock <= 0 ? 5 : 0)
                            }
                            className={`ms-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                              rawProd.stock <= 0
                                ? 'bg-ok/15 text-ok hover:bg-ok hover:text-white'
                                : 'bg-danger/10 text-danger hover:bg-danger hover:text-white'
                            }`}
                          >
                            {rawProd.stock <= 0
                              ? locale === 'ckb'
                                ? 'گەڕاندنەوە'
                                : 'Restock'
                              : locale === 'ckb'
                              ? 'نەماوە (0)'
                              : 'Set Sold Out'}
                          </button>
                        </div>
                      </div>

                      {/* Clickable Per-Color Availability Toggles */}
                      {rawProd.finishes.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          {rawProd.finishes.map((f, i) => {
                            const isColorOut = Boolean(f.soldOut) || f.stock === 0;
                            const locName = locProd.finishes[i]?.name || f.name;
                            return (
                              <button
                                key={`${f.name}-${i}`}
                                type="button"
                                onClick={() => handleToggleFinishSoldOut(rawProd, i)}
                                title={
                                  isColorOut
                                    ? `${locName} — ${
                                        locale === 'ckb'
                                          ? 'کرتە بکە بۆ بەردەستکردن'
                                          : 'Click to mark available'
                                      }`
                                    : `${locName} — ${
                                        locale === 'ckb'
                                          ? 'کرتە بکە بۆ نەماوە لەم ڕەنگەدا'
                                          : 'Click to mark sold out in this color'
                                      }`
                                }
                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium transition-colors ${
                                  isColorOut
                                    ? 'bg-danger/10 text-danger line-through ring-1 ring-danger/30 hover:bg-danger/20'
                                    : 'bg-card text-ink-soft ring-1 ring-line hover:border-ink hover:text-ink'
                                }`}
                              >
                                <span
                                  className={`size-2.5 rounded-full ring-1 ring-ink/20 ${
                                    isColorOut ? 'opacity-45' : ''
                                  }`}
                                  style={{ backgroundColor: f.color }}
                                />
                                <span>{locName}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-line/70 pt-3">
                  <Link
                    href={`/product/${rawProd.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-[11.5px] font-medium text-ink ring-1 ring-line hover:bg-sand"
                  >
                    <Eye className="size-3.5" />
                    <span>{locale === 'ckb' ? 'بینینی پەڕە' : 'View Page'}</span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleLoadForEdit(rawProd)}
                      className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-[11.5px] font-medium text-ink ring-1 ring-line hover:bg-ink hover:text-canvas"
                    >
                      <Edit3 className="size-3.5" />
                      <span>{locale === 'ckb' ? 'دەستکاری' : 'Edit'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(rawProd)}
                      disabled={deletingId === rawProd.id}
                      className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-3 py-1.5 text-[11.5px] font-medium text-danger transition-colors hover:bg-danger hover:text-white disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />
                      <span>
                        {deletingId === rawProd.id
                          ? '...'
                          : locale === 'ckb'
                          ? 'سڕینەوە'
                          : 'Delete'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
        </>
      )}

      <ImageAssetPickerModal
        open={assetPickerTarget !== null}
        onClose={() => setAssetPickerTarget(null)}
        multiple={assetPickerTarget === '360'}
        currentUrl={
          assetPickerTarget === 'main'
            ? image
            : assetPickerTarget === 'scene'
            ? scene
            : ''
        }
        title={
          assetPickerTarget === 'main'
            ? locale === 'ckb'
              ? 'بەستنەوەی وێنەی سەرەکی بەرهەم'
              : 'Connect Primary Studio Product Image'
            : assetPickerTarget === 'scene'
            ? locale === 'ckb'
              ? 'بەستنەوەی وێنەی ناو ژوور'
              : 'Connect In-the-Room Scene Image'
            : locale === 'ckb'
            ? 'بەستنەوەی وێنەکانی گۆشەی ٣٦٠°'
            : 'Connect 360° Multi-Angle Image Assets'
        }
        onSelectSingle={(url) => {
          if (assetPickerTarget === 'main') {
            setImage(url);
            showNotice('Primary studio image asset connected');
          } else if (assetPickerTarget === 'scene') {
            setScene(url);
            showNotice('Room scene image asset connected');
          }
        }}
        onSelectMultiple={(urls) => {
          if (urls.length > 0) {
            setFrames360((prev) => {
              const next = [...prev, ...urls];
              if (next.length >= 2) {
                setPreviewTab('360');
              }
              return next;
            });
            showNotice(`Connected ${urls.length} image assets to 360° turntable`);
          }
        }}
      />

      <BackgroundRemoverModal
        open={bgRemoverSource !== null}
        source={bgRemoverSource}
        filenameHint={customSlug || name || 'product'}
        canOfferKeepScene
        onClose={() => setBgRemoverSource(null)}
        onApply={({ cutoutUrl, originalSceneUrl }) => {
          setImage(cutoutUrl);
          if (originalSceneUrl) {
            setScene(originalSceneUrl);
          }
          showNotice(
            locale === 'ckb'
              ? 'باکگراوند بە سەرکەوتوویی لابرا و تەنها بەرهەمەکە مایەوە!'
              : locale === 'ar'
              ? 'تمت إزالة الخلفية والاحتفاظ بالأثاث فقط!'
              : 'Background removed — clean cutout applied to studio image!'
          );
        }}
      />
    </div>
  );
}

export default function AddProductPage() {
  return (
    <StoreShell>
      <AddProductWorkshop />
    </StoreShell>
  );
}
