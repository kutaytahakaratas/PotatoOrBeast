/**
 * Commentary Engine - Gamer Jargon Module
 * 
 * Provides entertaining, personality-rich commentary based on benchmark scores.
 * Each category has multiple tiers with 5+ unique comments for variety.
 * 
 * Categories:
 * 1. GPU (Görsel Güç) - Based on 3D Performance score
 * 2. CPU (Beyin Gücü) - Based on JavaScript Speed score
 * 3. Historical (Gelişim) - Comparison with previous scores
 * 4. Bottleneck (Suçlu Kim?) - System imbalance detection
 */

// ============================================================
// GPU COMMENTARY - Based on 3D Performance Score
// ============================================================

const GPU_COMMENTS = {
  // 0 - 50,000: Patates Tier
  potato: [
    '🥔 Bu bir tost makinesi mi? Ekmeği kızarttık ama FPS alamadık.',
    '📽️ Slayt gösterisi bittiyse bilgisayarı kapatabiliriz.',
    '🎨 Piksel sanatını çok seviyorsun galiba.',
    '🐌 Böyle hızla Mevlana\'nın semazenine yetişemeyiz.',
    '💀 GPU dua ediyor: "Beni rahat bırakın artık!"',
    '📺 Kaç FPS? Yeter ki PowerPoint açılsın.',
    '🧱 Minecraft bile bu sistemde ter döker.',
  ],

  // 50,000 - 150,000: Giriş Seviyesi
  entry: [
    '🎮 CS2 oynatır ama Cyberpunk deneme, bilgisayar ağlar.',
    '💼 Ofis işleri için harika, oyun için... eh işte.',
    '🚗 Fiat Egea gibi. İş görür, hava atmaz.',
    '📊 Excel\'de grafik çizerken GPU mutlu oldu.',
    '🎯 Valorant idare eder, Fortnite zorlar.',
    '🌱 Her başlangıç zordur. Bu da öyle.',
    '🎪 Sirkte gösterecek kadar performans yok, ama deniyoruz.',
  ],

  // 150,000 - 300,000: Orta Segment
  mid: [
    '⚖️ Tam bir Fiyat/Performans canavarı. Ne eksik ne fazla.',
    '🏃 High ayarlarda akıyoruz, Ultra için zorlama.',
    '🎯 Altın orta yol! Dengeli sistem.',
    '🔥 Isındık ama yanmadık. Güzel pozisyon.',
    '🎮 Çoğu oyunu 60 FPS\'de döndürür, endişelenme.',
    '💪 Kaslar var, şampiyon değil ama formda.',
    '🚀 Kalkışa hazırız, sadece roket yakıtı biraz az.',
  ],

  // 300,000 - 500,000: High-End (RTX 4060 buraya düşer)
  high: [
    '🚀 Bu makine uçuyor! Kemerlerini bağla.',
    '🌪️ Fan sesi mi o, yoksa jet motoru mu? Mükemmel güç.',
    '📊 FPS sayacını bozduk, tebrikler.',
    '👑 High-End kulübüne hoş geldin, kral!',
    '🎮 Ultra ayarlar? Hayır, "DAHA FAZLA!" diyoruz.',
    '🔥 Ekran kartı ateş püskürtüyor, itfaiyeyi ara.',
    '💎 Fiyat/Performans değil, direkt PERFORMANS.',
    '⚡ Elektrik sayacı dönerken biz FPS sayıyoruz.',
  ],

  // 500,000+: God Tier
  god: [
    '🛸 NASA\'dan mı çaldın bu bilgisayarı?',
    '💸 Elektrik faturası kabarık gelecek ama buna değer.',
    '🌌 Gerçek hayat bu kadar akıcı değil.',
    '👽 Uzaylı teknolojisi tespit edildi. NSA yolda.',
    '🏆 Benchmark\'ı değil, rekoru kırdık.',
    '🎮 4K 144Hz? Sen 8K 240Hz düşünmeye başla.',
    '🔮 Gelecekten mi geldin? Bu güç normal değil.',
    '💀 Diğer bilgisayarlar seninkine öykünüyor.',
    '🌋 Vulkan bile bu kadar render edemez.',
  ],
};

// ============================================================
// CPU COMMENTARY - Based on JavaScript Speed Score
// ============================================================

const CPU_COMMENTS = {
  // 0 - 30,000: Matematik Zayıf
  weak: [
    '🧮 Matematiği zayıf, hesap makinesi taşıması lazım.',
    '🐢 İşlemci düşünürken çay demle, bekle.',
    '📚 Ders çalışması gereken bir CPU.',
    '😴 İşlemci uyukluyuor, kahve ver.',
    '🔢 1+1\'i bile zor hesaplıyor gibi.',
    '⏳ Kum saati dönmekten yoruldu.',
    '🧠 Beyin fırtınası değil, beyin çisintisi.',
  ],

  // 30,000 - 80,000: Ortalama
  average: [
    '📊 Ortalama bir öğrenci. Geçer not alır.',
    '🎯 Ne Einstein ne de... neyse, idare eder.',
    '💼 Günlük işler için yeterli, zeka yarışması için değil.',
    '🏃 Koşuyor ama sprint atmıyor.',
    '⚖️ Dengeli ama heyecansız.',
    '🔧 Mekanik saat gibi: işini yapar, hızlı değil.',
    '📈 Grafikler çizer ama yavaşça.',
  ],

  // 80,000 - 150,000: İyi
  good: [
    '🧠 Zeki çocuk! Sınıfın başarılısı.',
    '⚡ Hızlı düşünüyor, hızlı hesaplıyor.',
    '🎓 Üniversite sınavında derece yapar.',
    '💪 Güçlü işlemci, güçlü irade.',
    '🔬 Bilim insanı potansiyeli var.',
    '🚀 Multi-threading\'de fena değil.',
    '📱 Chrome sekmelerini kaldırır, merak etme.',
  ],

  // 150,000 - 250,000: Harika
  great: [
    '🧬 Einstein yanında stajyer olabilir.',
    '🌟 Süper bilgisayar mı bu?',
    '🏆 İşlemci olimpiyatlarında altın madalya.',
    '⚛️ Atom parçalayacak güçte hesaplama.',
    '🔥 Termal macun eriyor, o kadar hızlı.',
    '💎 Silikon vadisinin gururu.',
    '🧮 Pi sayısını 1 milyon basamağa kadar ezberler.',
  ],

  // 250,000+: Tanrı Seviyesi
  genius: [
    '🧠 Einstein yanında halt etmiş.',
    '🛸 Yapay zeka bile bu hıza imreniyor.',
    '🌌 Evrenin sırlarını hesaplıyor.',
    '👑 İşlemci tanrısı! Diz çök!',
    '💀 Diğer CPU\'lar: "Abi yapma..."',
    '🔮 Gelecek tahminleri bile yapabilir bu hızla.',
    '⚡ Işık hızına sadece bir adım.',
    '🏛️ MIT bu işlemciyi incelemek istiyor.',
  ],
};

// ============================================================
// HISTORICAL COMPARISON COMMENTARY
// ============================================================

const COMPARISON_COMMENTS = {
  // Significant Increase (> 15%)
  majorIncrease: [
    '📈 Ooo, driver güncellemesi yaramış!',
    '💪 Bilgisayar spora gitmiş, kas yapmış.',
    '🚀 Houston, kalkış başarılı! Performans uçuşta.',
    '🎉 Ne yaptın da bu kadar hızlandı?',
    '🔧 Optimizasyon ustası! Bravo.',
    '⚡ Turbo modunu mu açtın?',
    '🏆 Rekor kırdın! Alkış.',
  ],

  // Moderate Increase (5-15%)
  minorIncrease: [
    '📊 Güzel ilerleme! Yavaş yavaş büyüyoruz.',
    '👍 Geçen seferden iyi, devam!',
    '🌱 Büyüme var, tohum filizleniyor.',
    '✨ Küçük ama güzel bir artış.',
    '🎯 Doğru yoldasın.',
    '📈 Grafik yukarı bakıyor.',
  ],

  // Stable (-5% to +5%)
  stable: [
    '⚖️ İstikrar abidesi. Ne uzamış ne kısalmış.',
    '🎯 Tutarlılık önemli, değişim yok.',
    '🔒 Sistem kaya gibi sağlam.',
    '📊 Değişmeyen performans = güvenilir sistem.',
    '🧘 Zen modunda: sakin ve kararlı.',
    '💎 Aynı kalite, aynı güven.',
  ],

  // Moderate Decrease (-5% to -15%)
  minorDecrease: [
    '↘️ Hafif düşüş var, panik yok.',
    '🤔 Arka planda bir şey mi çalışıyor?',
    '📉 Biraz yorgun görünüyorsun.',
    '🌡️ Termal mi? Fanları kontrol et.',
    '💭 Windows Update yine mi çalıştı?',
    '🔍 Ufak bir kayıp, sorun değil.',
  ],

  // Major Decrease (> -15%)
  majorDecrease: [
    '💀 Bilgisayarına virüs mü bulaştı? Geçen sefer daha iyiydin.',
    '🌐 Arka plandaki Chrome sekmelerini kapat!',
    '🔥 Termal throttling mi var? Fanlar çalışıyor mu?',
    '⚠️ Ciddi düşüş! Sistem kontrolü şart.',
    '😰 Ne oldu sana böyle? Geçmiş olsun.',
    '🛠️ Bakım zamanı gelmiş gibi görünüyor.',
    '🧹 Bilgisayarı temizlik vaktı!',
  ],
};

// ============================================================
// BOTTLENECK COMMENTARY - Who\'s the Culprit?
// ============================================================

const BOTTLENECK_COMMENTS = {
  // CPU Bottleneck (GPU stronger than CPU)
  cpuBottleneck: [
    '🚗 Ekran kartın Ferrari ama motoru Şahin (Tofaş). İşlemci darboğaz yapıyor!',
    '🐎 GPU koşmak istiyor ama CPU: "Yavaş ol gardaş."',
    '⚡ Ekran kartı "UÇALIM!" diyor, işlemci "Bi dakka" diyor.',
    '🏎️ F1 arabası, traktör motoru. İşlemci yetişemiyor.',
    '💔 GPU\'n ağlıyor: "Beni özgür bırakın!"',
    '🔗 Zincirin zayıf halkası: CPU.',
    '🐢 İşlemci: "Ben bu tempoya ayak uyduramıyorum."',
  ],

  // GPU Bottleneck (CPU stronger than GPU)
  gpuBottleneck: [
    '🎮 İşlemcin dünyaları hesaplıyor ama ekran kartın "Ben yoruldum" diyor.',
    '🧠 Beyin hızlı, eller yavaş. GPU darboğaz.',
    '📊 CPU: "Hazırım!" GPU: "Bi saniye..."',
    '🖼️ Hesaplar tamam, çizim yavaş. Ekran kartı limit.',
    '⚡ İşlemci turbo, GPU ekonomi modunda.',
    '🔧 Ekran kartı yükseltmesi düşünme vakti.',
    '🐌 GPU: "Koşamıyorum, yürüyorum."',
  ],

  // Balanced System
  balanced: [
    '✅ Mükemmel denge! Takım çalışması bu işte.',
    '🤝 CPU ve GPU el ele, gönül gönüle.',
    '⚖️ Yin ve Yang gibi uyum içindeler.',
    '🎯 İdeal sistem! Darboğaz yok.',
    '🏆 Harika kombinasyon, tebrikler!',
    '💪 İkisi de formda, kimse kimseyi beklemiyor.',
    '🌟 Sistem mühendisliği dersi verilir bu dengeye.',
  ],

  // Severe Imbalance
  severeImbalance: [
    '🚨 ALARM! Sistemde ciddi dengesizlik var.',
    '⚠️ Bu kombinasyon su ve yağ gibi uyumsuz.',
    '💸 Paranın bir kısmı boşa gidiyor, yükseltme şart.',
    '🔥 Bir taraf yanıyor, diğeri izliyor.',
    '🆘 SOS! Sistem acil yardım istiyor.',
    '🎭 Trajedi ve komedi bir arada: bu sistem.',
  ],
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Randomly selects a comment from an array
 */
const getRandomComment = (comments: string[]): string => {
  const index = Math.floor(Math.random() * comments.length);
  return comments[index];
};

// ============================================================
// MAIN API FUNCTIONS
// ============================================================

export type CommentType = 'gpu' | 'cpu' | 'comparison' | 'bottleneck';

/**
 * GPU Commentary based on 3D Performance score
 */
export const getGPUComment = (score: number): { tier: string; comment: string; emoji: string } => {
  if (score >= 500000) {
    return { tier: 'God Tier', comment: getRandomComment(GPU_COMMENTS.god), emoji: '👑' };
  } else if (score >= 300000) {
    return { tier: 'High-End', comment: getRandomComment(GPU_COMMENTS.high), emoji: '🚀' };
  } else if (score >= 150000) {
    return { tier: 'Orta Segment', comment: getRandomComment(GPU_COMMENTS.mid), emoji: '⚖️' };
  } else if (score >= 50000) {
    return { tier: 'Giriş Seviyesi', comment: getRandomComment(GPU_COMMENTS.entry), emoji: '🎮' };
  } else {
    return { tier: 'Patates Tier', comment: getRandomComment(GPU_COMMENTS.potato), emoji: '🥔' };
  }
};

/**
 * CPU Commentary based on JavaScript Speed score
 */
export const getCPUComment = (score: number): { tier: string; comment: string; emoji: string } => {
  if (score >= 250000) {
    return { tier: 'Deha Seviyesi', comment: getRandomComment(CPU_COMMENTS.genius), emoji: '🧠' };
  } else if (score >= 150000) {
    return { tier: 'Harika', comment: getRandomComment(CPU_COMMENTS.great), emoji: '🌟' };
  } else if (score >= 80000) {
    return { tier: 'İyi', comment: getRandomComment(CPU_COMMENTS.good), emoji: '💪' };
  } else if (score >= 30000) {
    return { tier: 'Ortalama', comment: getRandomComment(CPU_COMMENTS.average), emoji: '📊' };
  } else {
    return { tier: 'Matematik Zayıf', comment: getRandomComment(CPU_COMMENTS.weak), emoji: '🐢' };
  }
};

/**
 * Historical Comparison Commentary
 */
export const getComparisonComment = (percentChange: number): { trend: string; comment: string; emoji: string } => {
  if (percentChange > 15) {
    return { trend: 'Büyük Artış', comment: getRandomComment(COMPARISON_COMMENTS.majorIncrease), emoji: '🚀' };
  } else if (percentChange > 5) {
    return { trend: 'Artış', comment: getRandomComment(COMPARISON_COMMENTS.minorIncrease), emoji: '📈' };
  } else if (percentChange >= -5) {
    return { trend: 'Stabil', comment: getRandomComment(COMPARISON_COMMENTS.stable), emoji: '⚖️' };
  } else if (percentChange >= -15) {
    return { trend: 'Düşüş', comment: getRandomComment(COMPARISON_COMMENTS.minorDecrease), emoji: '📉' };
  } else {
    return { trend: 'Büyük Düşüş', comment: getRandomComment(COMPARISON_COMMENTS.majorDecrease), emoji: '⚠️' };
  }
};

/**
 * Bottleneck Commentary based on GPU/CPU ratio
 */
export const getBottleneckComment = (
  gpuScore: number, 
  cpuScore: number
): { status: string; comment: string; emoji: string; culprit: 'cpu' | 'gpu' | 'none' | 'both' } => {
  // Normalize scores to compare
  const normalizedGpu = gpuScore / 300000; // 300k as baseline "good" GPU
  const normalizedCpu = cpuScore / 150000; // 150k as baseline "good" CPU
  
  const ratio = normalizedGpu / normalizedCpu;
  
  if (ratio > 2.0) {
    // GPU is WAY stronger than CPU
    return {
      status: 'Ciddi CPU Darboğazı',
      comment: getRandomComment(BOTTLENECK_COMMENTS.cpuBottleneck),
      emoji: '🚨',
      culprit: 'cpu'
    };
  } else if (ratio > 1.5) {
    // GPU is stronger than CPU
    return {
      status: 'CPU Darboğazı',
      comment: getRandomComment(BOTTLENECK_COMMENTS.cpuBottleneck),
      emoji: '⚠️',
      culprit: 'cpu'
    };
  } else if (ratio < 0.5) {
    // CPU is WAY stronger than GPU
    return {
      status: 'Ciddi GPU Darboğazı',
      comment: getRandomComment(BOTTLENECK_COMMENTS.gpuBottleneck),
      emoji: '🚨',
      culprit: 'gpu'
    };
  } else if (ratio < 0.7) {
    // CPU is stronger than GPU
    return {
      status: 'GPU Darboğazı',
      comment: getRandomComment(BOTTLENECK_COMMENTS.gpuBottleneck),
      emoji: '🎮',
      culprit: 'gpu'
    };
  } else {
    // Balanced
    return {
      status: 'Dengeli Sistem',
      comment: getRandomComment(BOTTLENECK_COMMENTS.balanced),
      emoji: '✅',
      culprit: 'none'
    };
  }
};

/**
 * Universal comment getter
 */
export const getComment = (
  score: number, 
  type: CommentType,
  additionalData?: { previousScore?: number; cpuScore?: number; gpuScore?: number }
): string => {
  switch (type) {
    case 'gpu':
      return getGPUComment(score).comment;
    case 'cpu':
      return getCPUComment(score).comment;
    case 'comparison':
      if (additionalData?.previousScore) {
        const percentChange = ((score - additionalData.previousScore) / additionalData.previousScore) * 100;
        return getComparisonComment(percentChange).comment;
      }
      return 'Geçmiş skor bulunamadı.';
    case 'bottleneck':
      if (additionalData?.cpuScore !== undefined && additionalData?.gpuScore !== undefined) {
        return getBottleneckComment(additionalData.gpuScore, additionalData.cpuScore).comment;
      }
      return 'Darboğaz analizi için hem GPU hem CPU skoru gerekli.';
    default:
      return 'Bilinmeyen kategori.';
  }
};

/**
 * Get all comments for a complete analysis
 */
export const getFullAnalysis = (
  gpuScore: number,
  cpuScore: number,
  previousCombinedScore?: number
): {
  gpu: { tier: string; comment: string; emoji: string };
  cpu: { tier: string; comment: string; emoji: string };
  bottleneck: { status: string; comment: string; emoji: string; culprit: 'cpu' | 'gpu' | 'none' | 'both' };
  comparison?: { trend: string; comment: string; emoji: string };
} => {
  const combinedScore = Math.round((gpuScore + cpuScore) / 2);
  
  const result = {
    gpu: getGPUComment(gpuScore),
    cpu: getCPUComment(cpuScore),
    bottleneck: getBottleneckComment(gpuScore, cpuScore),
    comparison: previousCombinedScore 
      ? getComparisonComment(((combinedScore - previousCombinedScore) / previousCombinedScore) * 100)
      : undefined
  };
  
  return result;
};
