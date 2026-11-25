import { Category, COLOR_SWATCH_LIBRARY, Product } from './catalog';

export type Locale = 'en' | 'ckb' | 'ar';

export interface LocaleMeta {
  code: Locale;
  label: string;
  shortLabel: string;
  dir: 'ltr' | 'rtl';
}

export const LOCALES: LocaleMeta[] = [
  { code: 'ckb', label: 'کوردی (سۆرانی)', shortLabel: 'کوردی', dir: 'rtl' },
  { code: 'ar', label: 'العربية', shortLabel: 'عربي', dir: 'rtl' },
  { code: 'en', label: 'English', shortLabel: 'EN', dir: 'ltr' },
];

export const CATEGORY_TRANSLATIONS: Record<string, Record<Locale, string>> = {
  all: {
    en: 'All',
    ckb: 'هەمووی',
    ar: 'الكل',
  },
  seating: {
    en: 'Sofas & Chairs',
    ckb: 'قەنەفە و کورسی',
    ar: 'كنب وكراسي',
  },
  lighting: {
    en: 'Lamps & Lights',
    ckb: 'گڵۆپ و چرا',
    ar: 'مصابيح وإنارة',
  },
  tables: {
    en: 'Tables',
    ckb: 'مێز',
    ar: 'طاولات',
  },
  textiles: {
    en: 'Textiles & Cushions',
    ckb: 'قوماش و سەرین',
    ar: 'أقمشة ووسائد',
  },
  ceramics: {
    en: 'Vases & Ceramics',
    ckb: 'سیرامیک و گوڵدان',
    ar: 'سيراميك ومزهريات',
  },
};

export const BADGE_TRANSLATIONS: Record<string, Record<Locale, string>> = {
  Bestseller: {
    en: 'Signature',
    ckb: 'تایبەت',
    ar: 'مميز',
  },
  New: {
    en: 'New',
    ckb: 'نوێ',
    ar: 'جديد',
  },
  'Low stock': {
    en: 'Limited edition',
    ckb: 'سنووردار',
    ar: 'إصدار محدود',
  },
};

export const FINISH_TRANSLATIONS: Record<string, Record<Locale, string>> = {
  'Oat bouclé': {
    en: 'Oat bouclé',
    ckb: 'بووکلێی کرێمی',
    ar: 'بوكليه شوفان',
  },
  'Moss bouclé': {
    en: 'Moss bouclé',
    ckb: 'بووکلێی قەوزەیی',
    ar: 'بوكليه طحلبي',
  },
  'Clay bouclé': {
    en: 'Clay bouclé',
    ckb: 'بووکلێی خشتی',
    ar: 'بوكليه طيني',
  },
  'Natural linen': {
    en: 'Natural linen',
    ckb: 'کەتانی سروشتی',
    ar: 'كتان طبيعي',
  },
  'Sand linen': {
    en: 'Sand linen',
    ckb: 'کەتانی لمینی',
    ar: 'كتان رملي',
  },
  'Rice paper': {
    en: 'Rice paper',
    ckb: 'کاغەزی برنجی',
    ar: 'ورق أرز',
  },
  'Warm paper': {
    en: 'Warm paper',
    ckb: 'کاغەزی گەرم',
    ar: 'ورق دافئ',
  },
  'Oiled oak': {
    en: 'Oiled oak',
    ckb: 'بەڕووی زەیتکراو',
    ar: 'بلوط مزيت',
  },
  'Smoked oak': {
    en: 'Smoked oak',
    ckb: 'بەڕووی تۆخ',
    ar: 'بلوط مدخن',
  },
  'White oak': {
    en: 'White oak',
    ckb: 'بەڕووی سپی',
    ar: 'بلوط أبيض',
  },
  'Ash grey': {
    en: 'Ash grey',
    ckb: 'خۆڵەمێشی کاڵ',
    ar: 'رمادي فاتح',
  },
  'Oat / forest': {
    en: 'Oat / forest',
    ckb: 'کرێمی / سەوز',
    ar: 'شوفان / غابي',
  },
  'Stone / ink': {
    en: 'Stone / ink',
    ckb: 'بەردین / ڕەش',
    ar: 'حجري / حبري',
  },
  'Speckled sand': {
    en: 'Speckled sand',
    ckb: 'لمی خاڵدار',
    ar: 'رملي منقط',
  },
  Charcoal: {
    en: 'Charcoal',
    ckb: 'ڕەژوویی تۆخ',
    ar: 'فحمي داكن',
  },
  Terracotta: {
    en: 'Terracotta',
    ckb: 'گڵی سوور',
    ar: 'تيراكوتا',
  },
  Bone: {
    en: 'Bone',
    ckb: 'ئێسکی کاڵ',
    ar: 'عاجي فاتح',
  },
  Forest: {
    en: 'Forest',
    ckb: 'سەوزی تۆخ',
    ar: 'أخضر غابي',
  },
  Oat: {
    en: 'Oat',
    ckb: 'کرێمی کاڵ',
    ar: 'شوفان فاتح',
  },
  Rust: {
    en: 'Rust',
    ckb: 'قاوەیی گەرم',
    ar: 'صدأ دافئ',
  },
};

export interface ProductTranslation {
  name: string;
  blurb: string;
  details: string[];
  dimensions: string;
  care: string;
}

export const PRODUCT_TRANSLATIONS: Record<string, Record<'ckb' | 'ar', ProductTranslation>> = {
  'lugn-boucle-sofa': {
    ckb: {
      name: 'قەنەفەی بووکلێی لوگن (٣ کەسی)',
      blurb:
        'قەنەفەیەکی چەماوەی سێ کەسی بە قوماشی خوری بووکلێی کرێمی گەرم لەسەر قاچی داری بەڕووی سروشتی پتەو. بە قەبارەیەکی فراوان بۆ پشوودانی ئارام.',
      details: [
        'قوماشی بووکلێی بەلجیکی، 820 g/m²',
        'چوارچێوە و قاچی بەڕووی سروشتی FSC®',
        'پشتیی نەرمی تێکەڵەی ئیسفەنج و پەڕ',
        'دانان لە ژوورەوە بەردەستە',
      ],
      dimensions: 'پانی 228 × قووڵی 96 × بەرزی 78 سم · بەرزی دانیشتن 42 سم',
      care: 'هەفتانە بە فڵچەی نەرم تۆزتەکێن بکە. پەڵە بە پەڕۆی کەتانی شێدار وشک بکەرەوە.',
    },
    ar: {
      name: 'كنبة بوكليه لوغن (3 مقاعد)',
      blurb:
        'كنبة منحنية بثلاثة مقاعد من قماش صوف البوكليه الكريمي الدافئ على أرجل من خشب البلوط المصمت. مصممة بأناقة هادئة لأوقات الاسترخاء.',
      details: [
        'قماش بوكليه بلجيكي فاخر، 820 g/m²',
        'هيكل وأرجل من خشب البلوط المصمت FSC®',
        'حشوة مريحة من الإسفنج عالي الكثافة والريش',
        'تتوفر خدمة التركيب داخل الغرفة',
      ],
      dimensions: 'عرض 228 × عمق 96 × ارتفاع 78 سم · ارتفاع المقعد 42 سم',
      care: 'تُنظف بلطف أسبوعياً بفرشاة المفروشات. تُجفف البقع بالتربيت بقطعة كتان رطبة.',
    },
  },
  'skymning-linen-sofa': {
    ckb: {
      name: 'قەنەفەی کەتان و بەڕووی سکایمنینگ',
      blurb:
        'قەنەفەیەکی قووڵی تەلارسازیی سێ کەسی بە قوماشی کەتانی بەلجیکی ڕەنگ سەوزی زەیتوونی کاڵ، لەسەر بنکەیەکی داری بەڕووی زەیتکراو.',
      details: [
        '١٠٠٪ قوماشی کەتانی سروشتی شۆردراوی بەلجیکی',
        'بنکە و قاچی تەختەی بەڕووی ئەوروپی زەیتکراو',
        'بەرگی گۆشەکان لێدەکرێتەوە بۆ پاککردنەوە',
        'بەستنی دەستیی توندوتۆڵی تەختە',
      ],
      dimensions: 'پانی 236 × قووڵی 98 × بەرزی 80 سم · بەرزی دانیشتن 43 سم',
      care: 'سەرینەکان بە بەردەوامی ڕێکبخەرەوە. بەرگەکان بە وشکەشۆردن پاک بکەرەوە.',
    },
    ar: {
      name: 'كنبة كتان وبلوط سكايمنينغ',
      blurb:
        'كنبة معمارية عميقة بثلاثة مقاعد من الكتان البلجيكي بلون الميرمية الهادئ، ترتكز على قاعدة مكشوفة من خشب البلوط الأوروبي المزيت.',
      details: [
        'تنجيد من الكتان البلجيكي الطبيعي 100%',
        'قاعدة وأرجل من خشب البلوط الأوروبي المزيت',
        'أغطية وسائد قابلة للإزالة والتنظيف الجاف',
        'نجارة يدوية متينة بتعشيق خشبي دقيق',
      ],
      dimensions: 'عرض 236 × عمق 98 × ارتفاع 80 سم · ارتفاع المقعد 43 سم',
      care: 'تُنفش وسائد الريش بانتظام. تُنظف الأغطية القابلة للإزالة بالتنظيف الجاف.',
    },
  },
  'bolle-lounge-chair': {
    ckb: {
      name: 'کورسی پشوودانی بۆڵێ',
      blurb:
        'کورسییەکی نزم و خڕی پشوودان بە قوماشی خوری بووکلێی ئەستوور لەسەر چوار قاچی تەختەی بەڕووی پتەو. هێندە قووڵ و ئارامە دەتوانیت بە تەواوی تێیدا بحەسێیتەوە.',
      details: [
        'قوماشی تێکەڵەی خوری بووکلێ، 780 g/m²',
        'قاچی بەڕووی سروشتی FSC®، زەیتکراو',
        'گۆشەی دانیشتنی جیاکراوە',
        'بە تەواوی بەستراوە و ئامادەیە',
      ],
      dimensions: 'پانی 82 × قووڵی 78 × بەرزی 74 سم · بەرزی دانیشتن 40 سم',
      care: 'هەفتانە بە فڵچەی نەرم پاکی بکەرەوە. پەڵە بە پەڕۆی شێدار وشک بکەرەوە و مەیخشێنە. ساڵی جارێک قاچەکان زەیت بکەرەوە.',
    },
    ar: {
      name: 'كرسي الاسترخاء بولّي',
      blurb:
        'كرسي استرخاء منخفض ومستدير من قماش صوف البوكليه الثقيل على أربعة أرجل من خشب البلوط المصمت. عميق ومريح للجلوس الطويل.',
      details: [
        'مزيج صوف بوكليه فاخر، 780 g/m²',
        'أرجل من خشب البلوط المصمت FSC®',
        'وسادة مقعد قابلة للإزالة',
        'يأتي مجمّعاً بالكامل وجاهزاً',
      ],
      dimensions: 'عرض 82 × عمق 78 × ارتفاع 74 سم · ارتفاع المقعد 40 سم',
      care: 'نظّف بالمكنسة الكهربائية أسبوعياً بفرشاة ناعمة. جفف السوائل بالتربيت دون فرك. أعد تزييت الأرجل مرة سنوياً.',
    },
  },
  'linne-table-lamp': {
    ckb: {
      name: 'گڵۆپی سەرمێزی لینێ',
      blurb:
        'کڵاوەی کەتانی چنراو بە دەست لەسەر بنکەیەکی بەڕووی تاشراو. ڕووناکییەکی گەرم و هێمن دەبەخشێت بۆ ئێوارانێک کە زوو دەست پێ دەکەن.',
      details: [
        'کڵاوەی کەتانی قەدکراو بە دەست',
        'بنکەی تەختەی بەڕووی سروشتی تاشراو',
        'گڵۆپی کەموزۆرکەر E27، ڕووناکی 2700K',
        'وایەری چنراوی درێژی 2 مەتر',
      ],
      dimensions: 'تیرە 30 × بەرزی 52 سم',
      care: 'کڵاوەکە بە فڵچەیەکی وشک تۆزتەکێن بکە. بنکە دارەکە بە پەڕۆیەکی کەمێک شێدار بسڕە.',
    },
    ar: {
      name: 'مصباح الطاولة ليني',
      blurb:
        'مظلة من الكتان المطوي يدوياً فوق قاعدة مخروطة من خشب البلوط. يمنح إضاءة دافئة وهادئة للأمسيات المريحة.',
      details: [
        'مظلة من الكتان المطوي بعناية',
        'قاعدة مخروطة من خشب البلوط المصمت',
        'مصباح E27 قابل للتعتيم بدرجة 2700K',
        'سلك مجدول بطول 2 متر',
      ],
      dimensions: 'قطر 30 × ارتفاع 52 سم',
      care: 'أزل الغبار عن المظلة بفرشاة جافة. امسح القاعدة الخشبية بقطعة قماش رطبة قليلاً.',
    },
  },
  'moln-pendant': {
    ckb: {
      name: 'چرای هەڵواسراوی مۆڵن',
      blurb:
        'پەڵە هەورێک لە کاغەزی ڕیشاڵی برنج کە هەموو ڕووناکییەک دەکاتە درەوشانەوەیەکی نەرم. هێندە سووکە بە یەک قولاپ هەڵدەواسرێت.',
      details: [
        'کاغەزی ڕیشاڵی برنج لەسەر چوارچێوەی پۆڵا',
        'سەرقاپی سەقف لە داری بەڕووی سروشتی',
        'بەرزی شۆڕبوونەوە تا 2.5 مەتر',
        'سۆکێتی E27، تا 40 وات LED',
      ],
      dimensions: 'تیرە 48 × بەرزی 40 سم',
      care: 'دووری بخەرەوە لە شێ. بە هەوای سارد تۆزەکەی لاببە.',
    },
    ar: {
      name: 'ثريا مولن المعلقة',
      blurb:
        'سحابة من ورق ألياف الأرز تحوّل أي مصباح إلى توهج ناعم ودافئ. خفيفة الوزن بحيث يمكن تعليقها من خطاف واحد.',
      details: [
        'ورق ألياف الأرز على هيكل فولاذي',
        'غطاء سقف ومقبض من خشب البلوط',
        'ارتفاع تعليق قابل للتعديل حتى 2.5 متر',
        'مقبس E27، بحد أقصى 40 واط LED',
      ],
      dimensions: 'قطر 48 × ارتفاع 40 سم',
      care: 'يحفظ جافاً. ينظف من الغبار بهواء بارد لطيف.',
    },
  },
  'stubbe-stool': {
    ckb: {
      name: 'تەپڵەکی داری ستوبێ',
      blurb:
        'تەپڵەکێکی سێ قاچی داتاشراو لە یەک پارچە تەختەی بەڕوو. وەک مێزی لاوەکی، ژێر گوڵدان یان کورسی میوان بەکاردێت.',
      details: [
        'تەختەی بەڕووی پتەوی FSC®',
        'ڕووی دانیشتنی داتاشراو بە دەست',
        'بەرگەی 120 کیلۆگرام دەگرێت',
        'دەتوانرێت جووت جووت لەسەر یەک دابنرێن',
      ],
      dimensions: 'تیرە 34 × بەرزی 46 سم',
      care: 'بە پەڕۆی خاوێن بیسڕە. هەر 12 مانگ جارێک زەیتی تایبەتی لێ بدەرەوە.',
    },
    ar: {
      name: 'مقعد ستوبي الخشبي',
      blurb:
        'مقعد ثلاثي الأرجل منحوت من كتلة بلوط واحدة. يعمل كطاولة جانبية أو حامل نباتات أو مقعد إضافي للضيوف.',
      details: [
        'خشب بلوط مصمت معتمد FSC®',
        'مقعد مشكّل يدوياً',
        'يتحمل حتى 120 كجم',
        'قابل للتكديس بشكل مزدوج',
      ],
      dimensions: 'قطر 34 × ارتفاع 46 سم',
      care: 'يمسح بقطعة قماش نظيفة. يعاد تزييته كل 12 شهراً.',
    },
  },
  'rund-side-table': {
    ckb: {
      name: 'مێزی لاوەکی ڕوند',
      blurb:
        'مێزێکی ستوونی تاشراو لە تەختەی بەڕووی چیندار، بە ڕوویەکی فراوان بۆ قاوە، کتێب و دانیشتنی ڕۆژانە.',
      details: [
        'تەختەی بەڕووی سروشتی پتەو',
        'ڕووپۆشی زەیت و مۆمی مات',
        'ژێرەوەی لباد بۆ پاراستنی زەوی',
        'لە ماوەی 5 خولەکدا دەبەسترێت',
      ],
      dimensions: 'تیرە 60 × بەرزی 48 سم',
      care: 'ژێرپیاڵە بۆ کوپی گەرم بەکاربهێنە. ساڵی دوو جار مۆمەکەی نوێ بکەرەوە.',
    },
    ar: {
      name: 'طاولة روند الجانبية',
      blurb:
        'طاولة بقاعدة أسطوانية مخروطة من خشب البلوط المتين، بسطح رحب للقهوة والكتب والاستخدام اليومي.',
      details: [
        'خشب بلوط مصمت متعدد الطبقات',
        'طبقة نهائية من زيت الشمع المطفي',
        'قاعدة مبطنة باللباد لحماية الأرضيات',
        'تركيب سهل خلال 5 دقائق',
      ],
      dimensions: 'قطر 60 × ارتفاع 48 سم',
      care: 'استخدم قواعد للأكواب الساخنة. جدد طبقة الشمع مرتين في السنة.',
    },
  },
  'vagn-wool-throw': {
    ckb: {
      name: 'پەتۆی خوری ڤاگن',
      blurb:
        'خوری بەرخی شانەکراو کە بە هێڵێکی سەوزی دارستان چنراوە و بە ڕیشووەی گرێدراوی دەستی کۆتایی هاتووە.',
      details: [
        '100% خوری سروشتی بەرخ',
        'نەرمکراو لە هەردوو دیوەوە',
        'ڕیشووەی گرێدراو بە دەست',
        'چنراو لە پورتوگال',
      ],
      dimensions: '130 × 180 سم',
      care: 'لە هەوای ئازاددا هەڵیبخە. شۆردنی وشک یان بە دەست بە ئاوی سارد.',
    },
    ar: {
      name: 'بطانية الصوف فاغن',
      blurb:
        'صوف حملان ممشط منسوج بخط أخضر غابي ومزود بأهداب معقودة يدوياً.',
      details: [
        '100% صوف حملان طبيعي',
        'ممشط وناعم من الوجهين',
        'أهداب معقودة يدوياً',
        'منسوج في البرتغال',
      ],
      dimensions: '130 × 180 سم',
      care: 'يُهوّى بين الاستخدامات. تنظيف جاف أو غسيل يدوي بماء بارد.',
    },
  },
  'lera-vase': {
    ckb: {
      name: 'گوڵدانی گڵێنەی لێرا',
      blurb:
        'لەسەر چەرخی گڵێنەسازی بە قوڕی بەردینی خاڵدار دروستکراوە و دیوی دەرەوەی بێ بریقە هێڵدراوەتەوە تا هەستی سروشتی قوڕەکە بمێنێت.',
      details: [
        'قوڕی بەردینی خاڵدار',
        'ناوەوەی ئاوگێڕ و بریقەدارکراو',
        'هەر دانەیەک تایبەتمەندی خۆی هەیە',
        'دروستکراوی دانیمارک',
      ],
      dimensions: 'تیرە 15 × بەرزی 30 سم',
      care: 'بە دەست بیشۆ. بۆ ناو قاپشۆر نابێت.',
    },
    ar: {
      name: 'مزهرية ليرا الخزفية',
      blurb:
        'مشغولة على عجلة الخزف من الحجر الخزفي المنقط مع ترك السطح الخارجي غير مزجج ليحتفظ بملمس الطين الطبيعي.',
      details: [
        'خزف حجري منقط عالي الكثافة',
        'مطلي من الداخل ومقاوم للماء',
        'كل قطعة فريدة بتفاصيلها الدقيقة',
        'صنع في الدنمارك',
      ],
      dimensions: 'قطر 15 × ارتفاع 30 سم',
      care: 'يغسل يدوياً فقط. غير مخصص لغسالة الأطباق.',
    },
  },
  'skal-bowl': {
    ckb: {
      name: 'قاپی پێشکەشکردنی سکۆڵ',
      blurb:
        'قاپێکی پان و نزم لە گڵی تێراکۆتا بە ڕووپۆشێکی ئاوریشمی. گونجاو بۆ سەلاتە و میوە لەسەر مێزی نانخواردن.',
      details: [
        'تێراکۆتا بە ڕووپۆشی ساتانی مات',
        'تەندروست بۆ خۆراک',
        'گونجاو بۆ قاپشۆر',
        'تیرەی 28 سم',
      ],
      dimensions: 'تیرە 28 × بەرزی 11 سم',
      care: 'دەتوانرێت لە قاپشۆردا بشۆردرێت. لە گۆڕانی کتوپڕی پلەی گەرمی بیپارێزە.',
    },
    ar: {
      name: 'وعاء التقديم سكول',
      blurb:
        'وعاء واسع ومنخفض من فخار التيراكوتا بطبقة ساتان ناعمة. مثالي للسلطة والفاكهة على طاولة الطعام.',
      details: [
        'تيراكوتا بطبقة ساتان ناعمة',
        'آمن للطعام',
        'آمن لغسالة الأطباق',
        'قطر 28 سم',
      ],
      dimensions: 'قطر 28 × ارتفاع 11 سم',
      care: 'آمن لغسالة الأطباق. تجنب التغيرات المفاجئة في درجات الحرارة.',
    },
  },
  'kudde-cushion': {
    ckb: {
      name: 'گۆشەی کەتانی کودێ',
      blurb:
        'کەتانی بەلجیکی شۆردراو لەسەر ناواخنی پەڕی سروشتی. لە ڕۆژی یەکەمەوە نەرمە و بە هەر شۆردنێک نەرمتر دەبێت.',
      details: [
        'کەتانی بەلجیکی شۆردراو',
        'ناواخنی پەڕ و تووکی نەرم',
        'زنجیری شاراوە',
        'قەبارە 50 × 50 سم',
      ],
      dimensions: '50 × 50 سم',
      care: 'بەرگەکەی لە پلەی 40°C دەشۆردرێت. بە گەرمی نزم وشکی بکەرەوە.',
    },
    ar: {
      name: 'وسادة الكتان كودي',
      blurb:
        'كتان بلجيكي مغسول بالحجر محشو بالريش والزغب الطبيعي. ناعمة منذ اليوم الأول وتزداد نعومة مع كل غسلة.',
      details: [
        'كتان بلجيكي فاخر مغسول بالحجر',
        'حشوة داخلية من الريش والزغب',
        'سحاب مخفي أنيق',
        'المقاس 50 × 50 سم',
      ],
      dimensions: '50 × 50 سم',
      care: 'يغسل الغطاء في الغسالة على حرارة 40°C. تجفيف بدرجة منخفضة.',
    },
  },
};

export function localizeCategoryName(
  id: string,
  byId: Record<string, Category>,
  locale: Locale
): string {
  const translated = CATEGORY_TRANSLATIONS[id]?.[locale];
  if (translated) return translated;
  return byId[id]?.name ?? id;
}

export function localizeFinishName(name: string, locale: Locale): string {
  const fromLegacy = FINISH_TRANSLATIONS[name]?.[locale];
  if (fromLegacy) return fromLegacy;
  const trimmed = name.trim();
  const matched = COLOR_SWATCH_LIBRARY.find(
    (s) => s.en === trimmed || s.ckb === trimmed || s.ar === trimmed
  );
  if (matched) return matched[locale];
  return name;
}

export function localizeBadge(badge: string | null | undefined, locale: Locale): string | null {
  if (!badge) return null;
  return BADGE_TRANSLATIONS[badge]?.[locale] ?? badge;
}

export function localizeProduct(product: Product, locale: Locale): Product {
  if (locale === 'en') return product;
  const tr = PRODUCT_TRANSLATIONS[product.id]?.[locale];
  return {
    ...product,
    name: tr?.name ?? product.name,
    blurb: tr?.blurb ?? product.blurb,
    details: tr?.details ?? product.details,
    dimensions: tr?.dimensions ?? product.dimensions,
    care: tr?.care ?? product.care,
    badge: localizeBadge(product.badge, locale),
    finishes: product.finishes.map((f) => ({
      ...f,
      name: localizeFinishName(f.name, locale),
    })),
  };
}

export const UI_STRINGS = {
  en: {
    skipToContent: 'Skip to content',
    navCatalog: 'Catalog',
    search: 'Search',
    studio: 'Studio',
    catalogStudio: 'Catalog Studio',
    showroom: 'Showroom',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    footerHeadline: 'Calm objects, made to be experienced in person.',
    footerSub:
      'Solid oak, wool bouclé, and stoneware from small workshops. Visit our showroom galleries to inspect timber grain and fabric swatches in natural light.',
    footerShowroomBtn: 'Sulaymaniyah Showroom',
    footerColCollections: 'Collections',
    footerAllPieces: 'All pieces',
    footerColStudio: 'Workshop & Studio',
    footerManagePieces: 'Manage pieces',
    footerManageCollections: 'Manage collections',
    footerCopyright: 'KVIST Architectural Furniture & Objects',
    footerEdition: 'Showroom & Catalog Edition',
    // Search Modal
    searchPlaceholder: 'Search by piece, oak, bouclé, dimensions, or finish…',
    allCollections: 'All collections',
    noMatchingPieces: 'No matching pieces',
    trySearchingFor: 'Try searching for oak, linen, bouclé, lamp, or table.',
    inspect: 'Inspect',
    // Showroom Modal
    experienceInPerson: 'Experience in person',
    showroomViewing: 'Showroom Viewing',
    ourShowrooms: 'Sulaymaniyah Showroom',
    selectedPieceRef: 'Selected Piece Reference',
    finishLabel: 'Finish',
    copiedRefCode: 'Copied reference code',
    copySpecAndRef: 'Copy spec & reference for showroom visit',
    showroomGalleries: 'Showroom Location',
    loc2City: 'Sulaymaniyah Showroom',
    loc2Address: 'Salim Street · Bakhtiari, Sulaymaniyah',
    loc2Hours: 'Sat–Thu · 10:00–20:00',
    loc2Phone: '+964 770 412 8800',
    openInGoogleMaps: 'Open location in Google Maps',
    swatchNoteStrong: 'See timber & upholstery in natural light.',
    swatchNoteText:
      'Every piece is available to test in our showrooms, with full oak, bouclé, linen, and stoneware swatch boards.',
    requestAppointmentTitle: 'Request a showroom appointment or WhatsApp consultation',
    requestAppointmentSub:
      'We’ll prepare the piece and finish samples before you arrive.',
    requestNoted: 'Showroom request noted',
    requestNotedBody:
      'Our showroom specialist will reach out with finish samples ready for your visit.',
    sendAnotherInquiry: 'Send another inquiry',
    yourNamePlaceholder: 'Your name',
    contactPlaceholder: 'Phone / WhatsApp or email',
    requestViewingBtn: 'Request showroom viewing',
    // Product Card
    inRoom: 'In room',
    studioViewBadge: 'Studio',
    explorePiece: 'Explore piece',
    finishesCountLabel: 'finishes',
    // Home Page
    sealText: 'Wool bouclé · Solid oak ·',
    heroPill: 'Showroom Collection · Click any piece below to preview',
    heroTitle: 'Calm objects for slow homes.',
    heroBody:
      'Solid oak, heavy wool bouclé, and stoneware crafted in small workshops. Preview the entire collection below and experience every piece in our showrooms.',
    exploreCatalog: 'Explore all pieces',
    visitShowroom: 'Visit showroom',
    quickBrowseLabel: 'Collection pieces · Click to preview',
    seeMore: 'See more',
    signaturePiece: 'Collection Preview',
    inspectPiece: 'Inspect piece',
    lightingEyebrow: 'Lighting',
    warmGlow: 'Warm 2700K glow',
    linenAndPaper: 'Linen & rice-paper shades',
    showroomsEyebrow: 'Showrooms',
    openDaysBadge: 'Sat–Thu',
    valuePropDirectPrice: 'Direct workshop pricing · No middleman markup',
    valuePropWarranty: '10-year solid frame warranty',
    valuePropFreeDelivery: 'Free delivery & setup in Sulaymaniyah',
    locationsAndHours: 'Location & viewing hours',
    marqueeItems: [
      'Direct workshop pricing · Fair value',
      'Solid FSC® European oak',
      'Heirloom investment made to last decades',
      '10-year genuine joinery guarantee',
      'Free delivery & installation in Sulaymaniyah',
      'Tested & approved in our Sulaymaniyah showroom',
      'Heavy wool bouclé & Belgian linen',
      'Bespoke craft batches · Direct to you',
    ],
    collectionsEyebrow: 'Collections',
    exploreByCraft: 'Explore by category',
    fullCatalog: 'Full catalog',
    pieceSingular: 'piece',
    piecePlural: 'pieces',
    showroomFloorEyebrow: '',
    featuredPieces: 'Our Products',
    philosophyEyebrow: '01 / Philosophy & Craft',
    manifestoText:
      'Every piece is made to be lived with. Sat on, spilled on, moved house twice and handed down. We build for the long version of home.',
    statWorkshops: 'Craft workshops',
    statOak: '% FSC® solid oak',
    statWarranty: 'year frame warranty',
    vignetteEyebrow: 'Showroom Vignette · Living Space',
    vignetteTitle: 'Proportioned for quiet rooms.',
    materialityEyebrow: 'Materiality',
    materialityTitle: 'Built once, kept for good',
    pillars: [
      {
        suffix: '%',
        title: 'FSC® Solid Oak',
        text: 'Kiln-dried European oak finished with matte hard-wax oil that can be refreshed for decades.',
      },
      {
        suffix: ' g/m²',
        title: 'Heavy Wool Bouclé',
        text: 'Spun from long-staple wool for high abrasion resistance and a warm, tactile hand.',
      },
      {
        suffix: ' years',
        title: 'Joinery Guarantee',
        text: 'Traditional mortise-and-tenon construction guaranteed across every frame and joint.',
      },
      {
        suffix: ' swatches',
        title: 'Showroom Library',
        text: 'Compare timber tones, linen weaves, and unglazed stoneware in person before deciding.',
      },
    ],
    clientNotesEyebrow: 'Architect & Design Notes',
    clientNotesTitle: 'In homes & design studios',
    homeReviews: [
      {
        name: 'Shwan Kareem',
        city: 'Sulaymaniyah · Interior Architect',
        product: 'Bolle Lounge Chair',
        text: 'We tested the Bolle chair in the Sulaymaniyah showroom first. The bouclé is dense and structured, and it still looks new after a year in our living room.',
      },
      {
        name: 'Darya Mahmood',
        city: 'Sulaymaniyah · Residence',
        product: 'Linne Table Lamp',
        text: 'The light it throws through the pleated linen shade is remarkably warm. We turned the overhead lights off in the evening and haven’t needed them since.',
      },
      {
        name: 'Zaid Al-Mansoor',
        city: 'Sulaymaniyah · Architecture Studio',
        product: 'Rund Side Table',
        text: 'Seeing the solid oak grain and matte wax finish in person convinced us immediately. The proportions work effortlessly beside a low sofa.',
      },
    ],
    journalEyebrow: 'The Showroom Journal',
    journalTitle: 'Seasonal editions & exhibitions.',
    journalBody:
      'Receive invitations to showroom openings and notes when new prototypes arrive from our workshops.',
    journalDone: 'You’re on the guest list.',
    journalPlaceholder: 'you@studio.com',
    journalJoining: 'Joining…',
    journalSubscribe: 'Subscribe',
    journalError: 'Please enter a valid email address.',
    // Shop Page
    archPieceSingular: 'architectural piece',
    archPiecePlural: 'architectural pieces',
    searchShopPlaceholder: 'Search oak, bouclé, lamp…',
    inRoomView: 'In-room view',
    studioView: 'Studio view',
    sortFeatured: 'Curated order',
    sortPriceAsc: 'Price: low to high',
    sortPriceDesc: 'Price: high to low',
    sortName: 'Name: A to Z',
    materialLabel: 'Material:',
    matAll: 'All materials',
    matOak: 'Oak & Timber',
    matTextile: 'Wool & Linen',
    matCeramic: 'Clay & Stoneware',
    priceAll: 'Any price',
    priceUnder150: 'Under $150',
    price150To500: '$150 – $500',
    priceOver500: '$500+',
    resetFilters: 'Reset filters',
    noPiecesMatch: 'No pieces match these filters',
    noPiecesSub: 'Try clearing the material or price filter to see all products.',
    showAllPieces: 'Show all products',
    // Product Detail Page
    stageStudio: 'Studio',
    stage360: '360° View',
    stage360Hint: 'Drag to spin · Scroll to zoom',
    stage360PhotoHint: 'Drag horizontally to rotate around all captured angles',
    stage360ModePhotos: 'Real Photos 360°',
    stage360Mode3D: '3D Model',
    stage360Auto: 'Auto-spin',
    stage360Reset: 'Reset angle',
    stage360AngleFront: 'Front',
    stage360AngleSide: 'Side',
    stage360AngleBack: 'Back',
    stage360AngleLeft: 'Left',
    stage360AngleTop: 'Top',
    stage360AngleIso: '3/4 Angle',
    stage360ZoomIn: 'Zoom in',
    stage360ZoomOut: 'Zoom out',
    stage360Direction: 'Reverse spin',
    stageCloseup: 'Close-up',
    stageInRoom: 'In the room',
    stageDimensions: 'Dimensions',
    archElevation: 'Architectural Elevation',
    scaleLabel: 'Scale 1:20 · mm/cm',
    clientNotesCount: 'Architect & showroom notes',
    materialFinish: 'Material Finish',
    onDisplayShowrooms: 'On display in Sulaymaniyah showroom',
    inStudioCount: 'in showroom',
    soldOutLabel: 'Sold out',
    soldOutInColorLabel: 'Sold out in this color',
    availableLabel: 'Available',
    colorStockLabel: 'available in this color',
    seeInShowroomBtn: 'See in Showroom / Inquire',
    specCopied: 'Spec copied',
    copySpec: 'Copy spec',
    dimensionsTitle: 'Dimensions',
    viewSchematic: 'View schematic →',
    constructionTitle: 'Construction & Materials',
    careTitle: 'Care & Maintenance',
    badgeFsc: 'FSC® Certified Timber',
    badgeWarranty: '10-Year Frame Warranty',
    badgeSwatches: 'Bespoke Swatches Available',
    reviewsEyebrow: 'Showroom & Architect Notes',
    qualityStandardsTitle: 'Workshop Inspection Standards',
    qualityMetrics: [
      ['Joinery & Frame Stability', 'Mortise & tenon · 10-yr guarantee'],
      ['Surface & Material Density', 'Natural oil, wool & stoneware'],
      ['Showroom Swatch Verification', 'Available in Sulaymaniyah'],
    ],
    verifiedFeedbackStrong: 'Inspected in person before delivery.',
    verifiedFeedbackText:
      'Every piece is checked for timber grain matching, joinery stability, and upholstery tension at our showroom.',
    pairsWellTitle: 'Pairs well in the room',
    pieceMovedTitle: 'This piece moved corners.',
    pieceMovedSub: 'The link may be old, or the piece has been archived.',
    browseCatalog: 'Browse catalog',
    // Dashboard Shell
    studioOverview: 'Studio Overview',
    piecesNav: 'Pieces',
    collectionsNav: 'Collections',
    catalogCuration: 'Catalog Curation',
    publicShowroom: 'Public Showroom',
    showroomHome: 'Showroom home',
    showroomCatalogMode: 'Showroom Catalog Mode',
    showroomCatalogModeDesc:
      'Curate pieces, upload studio photography, and manage material finishes for your showroom catalog.',
  },
  ckb: {
    skipToContent: 'بازدان بۆ ناوەڕۆک',
    navCatalog: 'کەتەلۆگ',
    search: 'گەڕان',
    studio: 'ستۆدیۆ',
    catalogStudio: 'ستۆدیۆی کەتەلۆگ',
    showroom: 'پێشانگا',
    openMenu: 'کردنەوەی لیست',
    closeMenu: 'داخستنی لیست',
    footerHeadline: 'پارچەی هێمن، دروستکراو بۆ بینین لە نزیکەوە.',
    footerSub:
      'تەختەی بەڕووی پتەو، خوری بووکلێ و گڵێنەی دەستکرد. سەردانی پێشانگاکانمان بکە بۆ بینینی نەخشی دار و نموونەی قوماشەکان لەبەر ڕووناکی سروشتیدا.',
    footerShowroomBtn: 'پێشانگای سلێمانی',
    footerColCollections: 'کۆمەڵەکان',
    footerAllPieces: 'هەموو پارچەکان',
    footerColStudio: 'کارگە و ستۆدیۆ',
    footerManagePieces: 'بەڕێوەبردنی پارچەکان',
    footerManageCollections: 'بەڕێوەبردنی بەشەکان',
    footerCopyright: 'KVIST بۆ مۆبیلیات و دیزاینی ناوماڵ',
    footerEdition: 'وەشانی پێشانگا و کەتەلۆگ',
    // Search Modal
    searchPlaceholder: 'گەڕان بەدوای پارچە، دار بەڕوو، بووکلێ، قەبارە یان ڕەنگ…',
    allCollections: 'هەموو بەشەکان',
    noMatchingPieces: 'هیچ پارچەیەک نەدۆزرایەوە',
    trySearchingFor: 'هەوڵ بدە بگەڕێیت بۆ کورسی، مێز، چرا، بەڕوو یان کەتان.',
    inspect: 'بینین',
    // Showroom Modal
    experienceInPerson: 'لە نزیکەوە بیبینە',
    showroomViewing: 'بینین لە پێشانگا',
    ourShowrooms: 'پێشانگای سلێمانی',
    selectedPieceRef: 'کۆدی پارچەی هەڵبژێردراو',
    finishLabel: 'ڕووپۆش',
    copiedRefCode: 'کۆدی پارچەکە کۆپی کرا',
    copySpecAndRef: 'کۆپیکردنی زانیاری و کۆد بۆ سەردانی پێشانگا',
    showroomGalleries: 'ناونیشانی پێشانگا',
    loc2City: 'پێشانگای سلێمانی',
    loc2Address: 'شەقامی سالم · بەختیاری، سلێمانی',
    loc2Hours: 'شەممە–پێنجشەممە · 10:00–20:00',
    loc2Phone: '+964 770 412 8800',
    openInGoogleMaps: 'کردنەوەی شوێنەکە لە نەخشەی گووگڵ (Google Maps)',
    swatchNoteStrong: 'دار و قوماشەکان لەبەر ڕووناکی سروشتیدا ببینە.',
    swatchNoteText:
      'هەموو پارچەکان و تەواوی نموونەی دار بەڕوو، بووکلێ و کەتان لە پێشانگاکانمان بەردەستن بۆ تاقیکردنەوە لە نزیکەوە.',
    requestAppointmentTitle: 'داواکاری سەردانی پێشانگا یان ڕاوێژکاری واتسئەپ',
    requestAppointmentSub:
      'پێش گەیشتنت، پارچەکە و نموونەی ڕەنگەکانت بۆ ئامادە دەکەین.',
    requestNoted: 'داواکارییەکەت تۆمارکرا',
    requestNotedBody:
      'ڕاوێژکاری پێشانگاکەمان پەیوەندیت پێوە دەکات و نموونەکان ئامادە دەبن بۆ سەردانەکەت.',
    sendAnotherInquiry: 'ناردنی داواکارییەکی تر',
    yourNamePlaceholder: 'ناوی بەڕێزتان',
    contactPlaceholder: 'ژمارەی مۆبایل / واتسئەپ یان ئیمەیڵ',
    requestViewingBtn: 'داواکردنی بینین لە پێشانگا',
    // Product Card
    inRoom: 'لە ژووردا',
    studioViewBadge: 'ستۆدیۆ',
    explorePiece: 'بینینی پارچە',
    finishesCountLabel: 'ڕەنگ و ڕووپۆش',
    // Home Page
    sealText: 'Wool bouclé · Solid oak ·',
    heroPill: 'کۆمەڵەی پێشانگا · کرتە لە هەر پارچەیەک بکە بۆ بینین',
    heroTitle: 'پارچەی هێمن بۆ ماڵە ئارامەکان.',
    heroBody:
      'تەختەی بەڕووی پتەو، خوری بووکلێی ئەستوور و گڵێنەی دەستکرد. لێرەوە هەموو پارچەکانی کەتەلۆگەکە ببینە و لە پێشانگاکانمان لە نزیکەوە تاقیان بکەرەوە.',
    exploreCatalog: 'هەموو پارچەکان ببینە',
    visitShowroom: 'سەردانی پێشانگا',
    quickBrowseLabel: 'پارچەکانی کۆمەڵەکە · کرتە بکە بۆ بینین',
    seeMore: 'زیاتر ببینە',
    signaturePiece: 'نمایشی کۆمەڵە',
    inspectPiece: 'وردەکاری پارچە',
    lightingEyebrow: 'ڕووناکی',
    warmGlow: 'ڕووناکی گەرمی 2700K',
    linenAndPaper: 'کڵاوەی کەتان و کاغەزی برنج',
    showroomsEyebrow: 'پێشانگاکان',
    openDaysBadge: 'شەممە–پێنجشەممە',
    valuePropDirectPrice: 'نرخی ڕاستەوخۆی کارگە · بەبێ دەڵاڵی',
    valuePropWarranty: '١٠ ساڵ گەرەنتی ڕاستەقینەی دارتاشی',
    valuePropFreeDelivery: 'گەیاندن و دانانی بێبەرامبەر لە سلێمانی',
    locationsAndHours: 'ناونیشان و کاتی کارکردن',
    marqueeItems: [
      'نرخی ڕاستەوخۆ و دادپەروەرانەی کارگە',
      'بەهای بەرز و مایەی مانەوە بۆ دەیان ساڵ',
      '١٠ ساڵ گەرەنتی مسۆگەری دارتاشی',
      'گەیاندن و دانانی بێبەرامبەر لە سلێمانی',
      'تەختەی بەڕووی سروشتی FSC®',
      'پشکنینی نموونەکان لە پێشانگای سلێمانی پێش کڕین',
      'خوری بووکلێ و کەتانی بەلجیکی',
      'بەرهەمی دەستڕەنگینی سنوردار و بێ دەڵاڵ',
    ],
    collectionsEyebrow: 'بەشەکان',
    exploreByCraft: 'بەپێی بەشەکان بگەڕێ',
    fullCatalog: 'تەواوی کەتەلۆگ',
    pieceSingular: 'پارچە',
    piecePlural: 'پارچە',
    showroomFloorEyebrow: '',
    featuredPieces: 'بەرهەمەکانمان',
    philosophyEyebrow: '01 / فەلسەفە و پیشەگەری',
    manifestoText:
      'هەموو پارچەیەک بۆ ئەوە دروستکراوە تەمەنێکی لەگەڵدا بەسەر ببەیت. لەسەری دابنیشیت، ماڵی پێ بگوازیتەوە و نەوە دوای نەوە بمێنێتەوە. ئێمە بۆ تەمەنی درێژی ماڵ دروستی دەکەین.',
    statWorkshops: 'کارگەی دەستڕەنگین',
    statOak: '% بەڕووی سروشتی FSC®',
    statWarranty: 'ساڵ گەرەنتی چوارچێوە',
    vignetteEyebrow: 'دیمەنی پێشانگا · ژووری دانیشتن',
    vignetteTitle: 'هاوسەنگکراو بۆ ژوورە ئارامەکان.',
    materialityEyebrow: 'کەرەستە و کوالێتی',
    materialityTitle: 'جارێک دروست دەکرێت، بۆ هەمیشە دەمێنێتەوە',
    pillars: [
      {
        suffix: '%',
        title: 'بەڕووی پتەوی FSC®',
        text: 'تەختەی بەڕووی وشککراو بە ڕووپۆشی زەیت و مۆمی مات کە بۆ دەیان ساڵ نوێ دەکرێتەوە.',
      },
      {
        suffix: ' g/m²',
        title: 'خوری بووکلێی ئەستوور',
        text: 'چنراو لە ڕیشاڵی خوری درێژ بۆ بەرگەگرتنی زۆر و هەستێکی گەرم و نەرم.',
      },
      {
        suffix: ' ساڵ',
        title: 'گەرەنتی دارتاشی',
        text: 'بەستنەوەی ڕەسەنی دارتاشی مسۆگەرکراو لە هەموو چوارچێوە و جومگەکاندا.',
      },
      {
        suffix: ' نموونە',
        title: 'کتێبخانەی نموونەکان',
        text: 'پێش بڕیاردان، ڕەنگەکانی دار، قوماشی کەتان و گڵێنەکان لە نزیکەوە بەراورد بکە.',
      },
    ],
    clientNotesEyebrow: 'تێبینی ئەندازیاران و دیزاینەران',
    clientNotesTitle: 'لە ناو ماڵ و ستۆدیۆکاندا',
    homeReviews: [
      {
        name: 'شوان کەریم',
        city: 'سلێمانی · ئەندازیاری دیکۆرات',
        product: 'کورسی پشوودانی بۆڵێ',
        text: 'سەرەتا کورسی بۆڵێمان لە پێشانگای سلێمانی تاقی کردەوە. قوماشی بووکلێکەی زۆر پڕ و پتەوە و دوای ساڵێک هێشتا وەک ڕۆژی یەکەم وایە.',
      },
      {
        name: 'داریا مەحموود',
        city: 'سلێمانی · ماڵ',
        product: 'گڵۆپی سەرمێزی لینێ',
        text: 'ئەو ڕووناکییەی لە کڵاوە کەتانەکەوە بڵاوی دەکاتەوە زۆر گەرم و ئارامبەخشە. شەوان گڵۆپی سەقفمان کوژاندووەتەوە و هەر بەمە دادەنیشین.',
      },
      {
        name: 'زەید مەنسوور',
        city: 'سلێمانی · ستۆدیۆی تەلارسازی',
        product: 'مێزی لاوەکی ڕوند',
        text: 'بینینی ڕەگی تەختە بەڕووەکە و ڕووپۆشە ماتەکەی لە نزیکەوە یەکسەر دڵنیای کردینەوە. لە تەنیشت قەنەفەی نزمەوە زۆر نایابە.',
      },
    ],
    journalEyebrow: 'نامەبەری پێشانگا',
    journalTitle: 'وەشانە وەرزییەکان و پێشانگاکان.',
    journalBody:
      'بانگهێشتنامەی کردنەوەی پێشانگا و هەواڵی گەیشتنی پارچە نوێیەکان لە کارگەوە بەدەست بهێنە.',
    journalDone: 'ناوت لە لیستی میوانان تۆمارکرا.',
    journalPlaceholder: 'you@studio.com',
    journalJoining: 'تۆمارکردن…',
    journalSubscribe: 'بەشداری بکە',
    journalError: 'تکایە ئیمەیڵێکی دروست بنووسە.',
    // Shop Page
    archPieceSingular: 'پارچەی دیزاینکراو',
    archPiecePlural: 'پارچەی دیزاینکراو',
    searchShopPlaceholder: 'گەڕان بۆ بەڕوو، بووکلێ، گڵۆپ…',
    inRoomView: 'دیمەنی ناو ژوور',
    studioView: 'دیمەنی ستۆدیۆ',
    sortFeatured: 'ڕیزبەندی پێشانگا',
    sortPriceAsc: 'نرخ: کەمەوە بۆ زۆر',
    sortPriceDesc: 'نرخ: زۆرەوە بۆ کەم',
    sortName: 'ناو: ئەلفبێیی',
    materialLabel: 'کەرەستە:',
    matAll: 'هەموو کەرەستەکان',
    matOak: 'دار بەڕوو و تەختە',
    matTextile: 'خوری و کەتان',
    matCeramic: 'قوڕ و سیرامیک',
    priceAll: 'هەموو نرخێک',
    priceUnder150: 'کەمتر لە $150',
    price150To500: '$150 – $500',
    priceOver500: 'زیاتر لە $500',
    resetFilters: 'سڕینەوەی پاڵێوەرەکان',
    noPiecesMatch: 'هیچ پارچەیەک لەگەڵ ئەم هەڵبژاردنانە ناگونجێت',
    noPiecesSub: 'پاڵێوەری کەرەستە یان نرخ لاببە بۆ بینینی هەموو بەرهەمەکان.',
    showAllPieces: 'پیشاندانی هەموو بەرهەمەکان',
    // Product Detail Page
    stageStudio: 'ستۆدیۆ',
    stage360: '٣٦٠° بینین',
    stage360Hint: 'ڕابکێشە بۆ سووڕانەوە · سکڕۆڵ بکە بۆ نزیکبوونەوە',
    stage360PhotoHint: 'بە ئاراستەی ڕاست یان چەپ ڕابکێشە بۆ سووڕانەوەی تەواو لە گۆشە وێنەگیراوەکاندا',
    stage360ModePhotos: 'وێنەی ڕاستەقینە ٣٦٠°',
    stage360Mode3D: 'مۆدێلی 3D',
    stage360Auto: 'سووڕانەوەی خۆکار',
    stage360Reset: 'ڕێکخستنەوەی گۆشە',
    stage360AngleFront: 'پێشەوە',
    stage360AngleSide: 'لای ڕاست',
    stage360AngleBack: 'پشتەوە',
    stage360AngleLeft: 'لای چەپ',
    stage360AngleTop: 'سەرەوە',
    stage360AngleIso: '٣/٤ گۆشە',
    stage360ZoomIn: 'نزیککردنەوە',
    stage360ZoomOut: 'دوورخستنەوە',
    stage360Direction: 'پێچەوانەکردنەوەی سووڕانەوە',
    stageCloseup: 'لە نزیکەوە',
    stageInRoom: 'لە ناو ژووردا',
    stageDimensions: 'پێوانەکان',
    archElevation: 'نەخشەی ئەندازیاری',
    scaleLabel: 'پێوەر 1:20 · ملم/سم',
    clientNotesCount: 'تێبینی ئەندازیاران و پێشانگا',
    materialFinish: 'جۆری ڕووپۆش و ڕەنگ',
    onDisplayShowrooms: 'نمایشکراوە لە پێشانگای سلێمانی',
    inStudioCount: 'لە پێشانگا',
    soldOutLabel: 'نەماوە',
    soldOutInColorLabel: 'لەم ڕەنگەدا نەماوە',
    availableLabel: 'بەردەستە',
    colorStockLabel: 'دانە لەم ڕەنگە بەردەستە',
    seeInShowroomBtn: 'بینین لە پێشانگا / پرسیارکردن',
    specCopied: 'زانیاری کۆپی کرا',
    copySpec: 'کۆپیکردنی زانیاری',
    dimensionsTitle: 'قەبارە و پێوانەکان',
    viewSchematic: 'بینینی نەخشەی پێوانە ←',
    constructionTitle: 'پێکهاتە و کەرەستەکان',
    careTitle: 'پاراستن و خاوێنکردنەوە',
    badgeFsc: 'تەختەی بەڕووی بڕوانامەدار FSC®',
    badgeWarranty: '10 ساڵ گەرەنتی چوارچێوە',
    badgeSwatches: 'نموونەی قوماش و دار بەردەستە',
    reviewsEyebrow: 'تێبینی پێشانگا و ئەندازیاران',
    qualityStandardsTitle: 'پێوەرەکانی پشکنین و کوالێتی کارگە',
    qualityMetrics: [
      ['پتەوی جومگە و چوارچێوە', 'دارتاشی ڕەسەن · 10 ساڵ گەرەنتی'],
      ['چڕی کەرەستە و ڕووپۆش', 'زەیتی سروشتی، خوری بووکلێ و بەڕوو'],
      ['پشکنینی نموونە لە پێشانگا', 'بەردەستە لە پێشانگای سلێمانی'],
    ],
    verifiedFeedbackStrong: 'پشکنینی تەواو پێش ڕادەستکردن.',
    verifiedFeedbackText:
      'هەموو پارچەیەک لە پێشانگاکەمان لە ڕووی هاوتاچوونی نەخشی دار، پتەوی جومگەکان و قوماشەکەیەوە دەپشکنرێت.',
    pairsWellTitle: 'لەگەڵ ئەم پارچانەدا دەگونجێت',
    pieceMovedTitle: 'ئەم پارچەیە شوێنی گۆڕدراوە.',
    pieceMovedSub: 'لەوانەیە بەستەرەکە کۆن بێت یان پارچەکە گوازرابێتەوە.',
    browseCatalog: 'گەڕانەوە بۆ کەتەلۆگ',
    // Dashboard Shell
    studioOverview: 'پوختەی ستۆدیۆ',
    piecesNav: 'پارچەکان',
    collectionsNav: 'بەشەکان',
    catalogCuration: 'بەڕێوەبردنی کەتەلۆگ',
    publicShowroom: 'پێشانگای گشتی',
    showroomHome: 'پەڕەی سەرەکی پێشانگا',
    showroomCatalogMode: 'دۆخی کەتەلۆگی پێشانگا',
    showroomCatalogModeDesc:
      'ڕێکخستنی پارچەکان، بارکردنی وێنەی ستۆدیۆ و بەڕێوەبردنی ڕەنگ و کەرەستەکان بۆ کەتەلۆگی پێشانگاکەت.',
  },
  ar: {
    skipToContent: 'تخطي إلى المحتوى',
    navCatalog: 'الكتالوج',
    search: 'بحث',
    studio: 'الاستوديو',
    catalogStudio: 'استوديو الكتالوج',
    showroom: 'صالة العرض',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
    footerHeadline: 'قطع هادئة، صُنعت لتُختبر عن قرب.',
    footerSub:
      'خشب البلوط المصمت، وصوف البوكليه، والخزف الحجري من ورش حرفية متخصصة. تفضل بزيارة صالات عرضنا لمعاينة عروق الخشب وعينات الأقمشة تحت الضوء الطبيعي.',
    footerShowroomBtn: 'صالة عرض السليمانية',
    footerColCollections: 'المجموعات',
    footerAllPieces: 'جميع القطع',
    footerColStudio: 'الورشة والاستوديو',
    footerManagePieces: 'إدارة القطع',
    footerManageCollections: 'إدارة المجموعات',
    footerCopyright: 'KVIST للأثاث والتصميم المعماري',
    footerEdition: 'إصدار صالة العرض والكتالوج',
    // Search Modal
    searchPlaceholder: 'ابحث حسب القطعة، خشب البلوط، البوكليه، الأبعاد أو اللون…',
    allCollections: 'جميع المجموعات',
    noMatchingPieces: 'لا توجد قطع مطابقة',
    trySearchingFor: 'جرّب البحث عن كرسي، طاولة، مصباح، بلوط أو كتان.',
    inspect: 'معاينة',
    // Showroom Modal
    experienceInPerson: 'اختبرها على الطبيعة',
    showroomViewing: 'معاينة في صالة العرض',
    ourShowrooms: 'صالة عرض السليمانية',
    selectedPieceRef: 'مرجع القطعة المختارة',
    finishLabel: 'الخامة',
    copiedRefCode: 'تم نسخ الرمز المرجعي',
    copySpecAndRef: 'نسخ المواصفات والرمز لزيارة صالة العرض',
    showroomGalleries: 'عنوان صالة العرض',
    loc2City: 'صالة عرض السليمانية',
    loc2Address: 'شارع سالم · بختياري، السليمانية',
    loc2Hours: 'السبت–الخميس · 10:00–20:00',
    loc2Phone: '+964 770 412 8800',
    openInGoogleMaps: 'فتح الموقع في خرائط جوجل (Google Maps)',
    swatchNoteStrong: 'عاين الأخشاب والأقمشة تحت الإضاءة الطبيعية.',
    swatchNoteText:
      'جميع القطع ولوحات عينات البلوط والبوكليه والكتان والخزف متوفرة للتجربة المباشرة في صالات عرضنا.',
    requestAppointmentTitle: 'احجز موعداً في صالة العرض أو استشارة عبر واتساب',
    requestAppointmentSub:
      'سنقوم بتجهيز القطعة وعينات الخامات قبل وصولك.',
    requestNoted: 'تم تسجيل طلب الزيارة',
    requestNotedBody:
      'سيتواصل معك مستشار صالة العرض مع تجهيز عينات الخامات لزيارتك.',
    sendAnotherInquiry: 'إرسال استفسار آخر',
    yourNamePlaceholder: 'الاسم الكامل',
    contactPlaceholder: 'رقم الهاتف / واتساب أو البريد الإلكتروني',
    requestViewingBtn: 'طلب معاينة في صالة العرض',
    // Product Card
    inRoom: 'في الغرفة',
    studioViewBadge: 'استوديو',
    explorePiece: 'استكشف القطعة',
    finishesCountLabel: 'خامات وألوان',
    // Home Page
    sealText: 'Wool bouclé · Solid oak ·',
    heroPill: 'مجموعة صالة العرض · اختر أي قطعة بالأسفل لمعاينتها',
    heroTitle: 'قطع هادئة لبيوت مطمئنة.',
    heroBody:
      'خشب البلوط المصمت، وصوف البوكليه الثقيل، والخزف المشغول في ورش صغيرة. استعرض جميع قطع المجموعة أدناه وتفضل بتجربتها مباشرة في صالات عرضنا.',
    exploreCatalog: 'استعرض جميع القطع',
    visitShowroom: 'زيارة صالة العرض',
    quickBrowseLabel: 'قطع المجموعة · اختر للمعاينة',
    seeMore: 'عرض المزيد',
    signaturePiece: 'معاينة المجموعة',
    inspectPiece: 'معاينة القطعة',
    lightingEyebrow: 'الإضاءة',
    warmGlow: 'إضاءة دافئة 2700K',
    linenAndPaper: 'مظلات من الكتان وورق الأرز',
    showroomsEyebrow: 'صالات العرض',
    openDaysBadge: 'السبت–الخميس',
    valuePropDirectPrice: 'أسعار مباشرة من الورشة · بدون وساطة',
    valuePropWarranty: 'ضمان هيكل ونجارة لمدة ١٠ سنوات',
    valuePropFreeDelivery: 'توصيل وتركيب مجاني في السليمانية',
    locationsAndHours: 'العنوان وساعات العمل',
    marqueeItems: [
      'أسعار عادلة ومباشرة من ورش الحرفيين',
      'قيمة حقيقية واستثمار يدوم لسنوات طوال',
      'ضمان نجارة متين لمدة ١٠ سنوات',
      'توصيل وتركيب مجاني في السليمانية',
      'خشب بلوط أوروبي مصمت FSC®',
      'معاينة مباشرة في صالة عرض السليمانية',
      'صوف بوكليه فاخر وكتان بلجيكي',
      'صناعة متقنة ومباشرة بدون هوامش وساطة',
    ],
    collectionsEyebrow: 'الأقسام',
    exploreByCraft: 'تصفح حسب القسم',
    fullCatalog: 'الكتالوج الكامل',
    pieceSingular: 'قطعة',
    piecePlural: 'قطع',
    showroomFloorEyebrow: '',
    featuredPieces: 'منتجاتنا',
    philosophyEyebrow: '01 / الفلسفة والحرفة',
    manifestoText:
      'صُنعت كل قطعة لتعيش معك طويلاً. للجلوس اليومي، وللانتقال من بيت إلى آخر، ولتُورث عبر الأجيال. نحن نبني من أجل العمر الطويل للمنزل.',
    statWorkshops: 'ورشة حرفية',
    statOak: '% خشب بلوط FSC®',
    statWarranty: 'سنوات ضمان للهيكل',
    vignetteEyebrow: 'مشهد من صالة العرض · غرفة المعيشة',
    vignetteTitle: 'أبعاد متوازنة للغرف الهادئة.',
    materialityEyebrow: 'الخامات والجودة',
    materialityTitle: 'تُبنى مرة واحدة، وتبقى للأبد',
    pillars: [
      {
        suffix: '%',
        title: 'خشب بلوط مصمت FSC®',
        text: 'خشب بلوط أوروبي مجفف بالأفران ومشطب بزيت الشمع المطفي القابل للتجديد لعقود.',
      },
      {
        suffix: ' g/m²',
        title: 'صوف بوكليه ثقيل',
        text: 'منسوج من ألياف الصوف الطويلة لمقاومة التآكل وملمس دافئ وغني.',
      },
      {
        suffix: ' سنوات',
        title: 'ضمان تعشيق الأخشاب',
        text: 'نجارة تقليدية متينة مضمونة في كل إطار ومفصل.',
      },
      {
        suffix: ' عينة',
        title: 'مكتبة عينات المعرض',
        text: 'قارن درجات الأخشاب وأنسجة الكتان والخزف غير المزجج عن قرب قبل الاختيار.',
      },
    ],
    clientNotesEyebrow: 'انطباعات المهندسين والمصممين',
    clientNotesTitle: 'في المنازل واستوديوهات التصميم',
    homeReviews: [
      {
        name: 'شوان كريم',
        city: 'السليمانية · مهندس ديكور',
        product: 'كرسي الاسترخاء بولّي',
        text: 'قمنا بتجربة كرسي بولّي في صالة عرض السليمانية أولاً. قماش البوكليه كثيف ومتماسك، ولا يزال يبدو جديداً تماماً بعد عام في غرفة المعيشة.',
      },
      {
        name: 'داريا محمود',
        city: 'السليمانية · منزل خاص',
        product: 'مصباح الطاولة ليني',
        text: 'الضوء الذي ينبعث عبر مظلة الكتان المطوية دافئ بشكل مذهل. استغنينا عن الإضاءة السقفية المسائية منذ اقتنائه.',
      },
      {
        name: 'زيد المنصور',
        city: 'السليمانية · استوديو معماري',
        product: 'طاولة روند الجانبية',
        text: 'رؤية عروق خشب البلوط المصمت والطبقة المطفية على الطبيعة أقنعتنا فوراً. أبعادها مثالية بجانب الأرائك المنخفضة.',
      },
    ],
    journalEyebrow: 'نشرة صالة العرض',
    journalTitle: 'الإصدارات الموسمية والمعارض.',
    journalBody:
      'احصل على دعوات افتتاح المعارض وإشعارات وصول القطع النموذجية الجديدة من ورشنا.',
    journalDone: 'تمت إضافتك إلى قائمة الضيوف.',
    journalPlaceholder: 'you@studio.com',
    journalJoining: 'جارٍ التسجيل…',
    journalSubscribe: 'اشتراك',
    journalError: 'يرجى إدخال بريد إلكتروني صحيح.',
    // Shop Page
    archPieceSingular: 'قطعة معمارية',
    archPiecePlural: 'قطع معمارية',
    searchShopPlaceholder: 'ابحث عن بلوط، بوكليه، مصباح…',
    inRoomView: 'عرض داخل الغرفة',
    studioView: 'عرض الاستوديو',
    sortFeatured: 'ترتيب صالة العرض',
    sortPriceAsc: 'السعر: من الأقل للأعلى',
    sortPriceDesc: 'السعر: من الأعلى للأقل',
    sortName: 'الاسم: أ – ي',
    materialLabel: 'الخامة:',
    matAll: 'جميع الخامات',
    matOak: 'البلوط والأخشاب',
    matTextile: 'الصوف والكتان',
    matCeramic: 'الطين والخزف',
    priceAll: 'أي سعر',
    priceUnder150: 'أقل من $150',
    price150To500: '$150 – $500',
    priceOver500: 'أكثر من $500',
    resetFilters: 'إعادة ضبط الفلاتر',
    noPiecesMatch: 'لا توجد قطع تطابق هذه الفلاتر',
    noPiecesSub: 'جرّب مسح فلتر الخامة أو السعر لرؤية جميع المنتجات.',
    showAllPieces: 'عرض جميع المنتجات',
    // Product Detail Page
    stageStudio: 'الاستوديو',
    stage360: 'رؤية 360°',
    stage360Hint: 'اسحب للتدوير · حرّك للتقريب',
    stage360PhotoHint: 'اسحب يميناً أو يساراً للدوران عبر جميع الزوايا المصورة',
    stage360ModePhotos: 'صور حقيقية 360°',
    stage360Mode3D: 'نموذج 3D',
    stage360Auto: 'دوران تلقائي',
    stage360Reset: 'إعادة ضبط',
    stage360AngleFront: 'أمامي',
    stage360AngleSide: 'يمين',
    stage360AngleBack: 'خلفي',
    stage360AngleLeft: 'يسار',
    stage360AngleTop: 'علوي',
    stage360AngleIso: 'زاوية 45°',
    stage360ZoomIn: 'تكبير',
    stage360ZoomOut: 'تصغير',
    stage360Direction: 'عكس اتجاه الدوران',
    stageCloseup: 'تفاصيل عن قرب',
    stageInRoom: 'في الغرفة',
    stageDimensions: 'الأبعاد والمخطط',
    archElevation: 'المسقط المعماري',
    scaleLabel: 'مقياس 1:20 · ملم/سم',
    clientNotesCount: 'ملاحظات المهندسين والمعرض',
    materialFinish: 'الخامة واللون',
    onDisplayShowrooms: 'معروض في صالة عرض السليمانية',
    inStudioCount: 'في صالة العرض',
    soldOutLabel: 'نفدت الكمية',
    soldOutInColorLabel: 'غير متوفر بهذا اللون',
    availableLabel: 'متوفر',
    colorStockLabel: 'متوفر من هذا اللون',
    seeInShowroomBtn: 'معاينة في صالة العرض / استفسار',
    specCopied: 'تم نسخ المواصفات',
    copySpec: 'نسخ المواصفات',
    dimensionsTitle: 'الأبعاد والمقاسات',
    viewSchematic: 'عرض المخطط الهندسي ←',
    constructionTitle: 'البنية والخامات',
    careTitle: 'العناية والصيانة',
    badgeFsc: 'أخشاب معتمدة FSC®',
    badgeWarranty: 'ضمان هيكل لمدة 10 سنوات',
    badgeSwatches: 'عينات خامات متوفرة',
    reviewsEyebrow: 'ملاحظات صالة العرض والمهندسين',
    qualityStandardsTitle: 'معايير الفحص والجودة في الورشة',
    qualityMetrics: [
      ['ثبات المفاصل والهيكل الخشبي', 'تعشيق تقليدي · ضمان 10 سنوات'],
      ['كثافة الخامة والتشطيب', 'زيت طبيعي، صوف بوكليه وبلوط مصمت'],
      ['تطابق العينات في صالة العرض', 'متوفر للمعاينة في السليمانية'],
    ],
    verifiedFeedbackStrong: 'فحص كامل للقطعة قبل التسليم.',
    verifiedFeedbackText:
      'يتم فحص كل قطعة في صالة العرض من حيث تناسق عروق الخشب، وثبات المفاصل، وشد القماش.',
    pairsWellTitle: 'قطع تتناغم معها في الغرفة',
    pieceMovedTitle: 'هذه القطعة انتقلت إلى زاوية أخرى.',
    pieceMovedSub: 'قد يكون الرابط قديماً أو تم أرشفة القطعة.',
    browseCatalog: 'تصفح الكتالوج',
    // Dashboard Shell
    studioOverview: 'نظرة عامة على الاستوديو',
    piecesNav: 'القطع',
    collectionsNav: 'المجموعات',
    catalogCuration: 'إدارة الكتالوج',
    publicShowroom: 'صالة العرض العامة',
    showroomHome: 'الصفحة الرئيسية للمعرض',
    showroomCatalogMode: 'وضع كتالوج صالة العرض',
    showroomCatalogModeDesc:
      'نسّق القطع، وارفع صور الاستوديو، وأدر عينات الألوان والخامات الخاصة بكتالوج صالة العرض.',
  },
} as const;
