document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initRouter();
  initBurgerMenu();
  initScrollHeader();
  initStatsObserver();
  initProjectFilters();
  initContactForm();
  initBlog();
  initModals();
  initFloatingWidget();
  initLanguageSwitcher();
});

// GLOBAL STATE
let currentLang = 'tr';

// 1. PRELOADER
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const bar = document.querySelector('.loader-bar');
  const counter = document.querySelector('.loader-counter');
  
  if (!preloader) return;
  
  let width = 0;
  const interval = setInterval(() => {
    width += Math.floor(Math.random() * 9) + 3;
    if (width >= 100) {
      width = 100;
      clearInterval(interval);
      
      setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        document.body.classList.add('loaded');
      }, 400);
    }
    
    if (bar) bar.style.width = width + '%';
    if (counter) counter.innerText = width + '%';
  }, 35);
}

// 2. CLIENT-SIDE ROUTER (SPA) WITH HTML5 HISTORY API
const routeMap = {
  '/': 'home',
  '/hakkimizda': 'corporate',
  '/kurumsal': 'corporate',
  '/hizmetlerimiz': 'sectors',
  '/portfoy': 'projects',
  '/ilanlar': 'projects',
  '/musteri-yorumlari': 'reviews',
  '/yorumlar': 'reviews',
  '/blog': 'blog',
  '/iletisim': 'contact',
  '/gizlilik-politikasi': 'privacy-policy',
  '/kvkk-aydinlatma-metni': 'kvkk-text',
  '/kvkk': 'kvkk-text',
  '/kullanim-sartlari': 'terms-of-service'
};

const pageToPath = {
  'home': '/',
  'corporate': '/hakkimizda',
  'sectors': '/hizmetlerimiz',
  'projects': '/portfoy',
  'reviews': '/musteri-yorumlari',
  'blog': '/blog',
  'contact': '/iletisim',
  'privacy-policy': '/gizlilik-politikasi',
  'kvkk-text': '/kvkk-aydinlatma-metni',
  'terms-of-service': '/kullanim-sartlari'
};

function initRouter() {
  const pages = document.querySelectorAll('.page-view');
  
  // Clean any hash from URL bar immediately on startup
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  if (window.location.hash) {
    history.replaceState(null, '', currentPath);
  }
  
  const initialPage = routeMap[currentPath] || 'home';
  showPage(initialPage, false);
  
  // Intercept all link clicks globally to prevent '#' and route smoothly
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (href === '#' || href === '') {
      e.preventDefault();
    }
    
    const targetId = link.getAttribute('data-target');
    if (targetId) {
      e.preventDefault();
      
      // Instantly drop DOM focus so browser never paints a focus outline/ring
      try {
        if (typeof link.blur === 'function') link.blur();
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
      } catch (err) {}
      
      showPage(targetId, true);
      
      // Close mobile menu if open
      const navList = document.querySelector('.nav-links');
      const burger = document.querySelector('.burger');
      if (navList && navList.classList.contains('nav-active')) {
        navList.classList.remove('nav-active');
        burger.classList.remove('toggle');
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  
  window.addEventListener('popstate', (e) => {
    const popPath = window.location.pathname.replace(/\/$/, '') || '/';
    const pageId = routeMap[popPath] || 'home';
    showPage(pageId, false);
  });
  
  function showPage(pageId, updateHistory = true) {
    let targetPage = document.getElementById(pageId);
    if (!targetPage) return;
    
    pages.forEach(page => {
      page.style.display = 'none';
      page.classList.remove('fade-in-section');
    });
    
    targetPage.style.display = 'block';
    setTimeout(() => {
      targetPage.classList.add('fade-in-section');
    }, 40);
    
    document.querySelectorAll('.nav-links a').forEach(a => {
      if (a.getAttribute('data-target') === pageId) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
    
    if (updateHistory) {
      const newPath = pageToPath[pageId] || '/';
      if (window.location.pathname !== newPath || window.location.hash) {
        history.pushState({ pageId }, '', newPath);
      } else {
        history.replaceState({ pageId }, '', newPath);
      }
    }
    
    if (pageId === 'home') {
      resetStats();
      setTimeout(animateStats, 200);
    }
  }
}

// 3. BURGER MENU FOR MOBILE
function initBurgerMenu() {
  const burger = document.querySelector('.burger');
  const navList = document.querySelector('.nav-links');
  
  if (!burger || !navList) return;
  
  burger.addEventListener('click', () => {
    navList.classList.toggle('nav-active');
    burger.classList.toggle('toggle');
    
    const lines = burger.querySelectorAll('div');
    if (burger.classList.contains('toggle')) {
      lines[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
      lines[1].style.opacity = '0';
      lines[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
    } else {
      lines[0].style.transform = 'none';
      lines[1].style.opacity = '1';
      lines[2].style.transform = 'none';
    }
  });
}

// 4. SCROLL HEADER STYLING
function initScrollHeader() {
  const header = document.querySelector('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// 5. COUNT-UP STATS
let statsAnimated = false;

function initStatsObserver() {
  const statsSection = document.querySelector('.dashboard-band');
  if (!statsSection) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        animateStats();
        statsAnimated = true;
      }
    });
  }, { threshold: 0.2 });
  
  observer.observe(statsSection);
}

function animateStats() {
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-val'), 10);
    const suffix = stat.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    
    let current = 0;
    const duration = 1500;
    const stepTime = Math.max(Math.floor(duration / target), 15);
    
    const counter = setInterval(() => {
      current += Math.ceil(target / (duration / stepTime));
      if (current >= target) {
        current = target;
        clearInterval(counter);
      }
      stat.innerHTML = current.toLocaleString(currentLang === 'tr' ? 'tr-TR' : 'en-US') + `<span>${suffix}</span>`;
    }, stepTime);
  });
}

function resetStats() {
  statsAnimated = false;
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(stat => {
    stat.innerHTML = '0' + `<span>${stat.getAttribute('data-suffix') || ''}</span>`;
  });
}

// 6. PORTFOLIO GRID FILTERS
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card[data-category]');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');
      
      projectCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        
        card.style.opacity = '0';
        card.style.transform = 'scale(0.96)';
        
        setTimeout(() => {
          if (filterValue === 'all' || cat === filterValue) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 50);
          } else {
            card.style.display = 'none';
          }
        }, 250);
      });
    });
  });
}

// 8. CONTACT FORM
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('contact-name')?.value || '';
    const phone = document.getElementById('contact-phone')?.value || '';
    const subject = document.getElementById('contact-subject')?.value || 'Genel';
    const msg = document.getElementById('contact-msg')?.value || '';
    
    if (name && phone && msg) {
      const waMsg = encodeURIComponent(
        `*ETİMESGUT EMLAK - İLETİŞİM FORMU*\n` +
        `👤 *Ad Soyad:* ${name}\n` +
        `📞 *Telefon:* ${phone}\n` +
        `📌 *Konu:* ${subject}\n` +
        `✉️ *Mesaj:* ${msg}`
      );
      
      const sendWa = confirm(
        currentLang === 'tr'
          ? `Teşekkürler Sayın ${name}. Mesajınızı İlhan Bey ve Adem Bey'e doğrudan WhatsApp üzerinden de iletmek ister misiniz?`
          : `Thank you ${name}. Would you like to forward your message directly via WhatsApp?`
      );
      
      if (sendWa) {
        window.open(`https://wa.me/905418510600?text=${waMsg}`, '_blank');
      } else {
        alert(currentLang === 'tr' ? 'Mesajınız başarıyla iletildi. En kısa sürede aranacaksınız.' : 'Your message has been sent. We will get back to you shortly.');
      }
      
      contactForm.reset();
    }
  });
}

// 9. DYNAMIC PROPERTY DATA & MODALS
const propertyData = {
  p1: {
    tr: {
      title: 'İstasyon Mah. Sıfır Lüks 3+1 Daire',
      category: 'SATILIK KONUT',
      price: '3.850.000 TL',
      location: 'İstasyon Mahallesi, Etimesgut, Ankara',
      rooms: '3+1',
      area: '135 m² Net / 155 m² Brüt',
      heating: 'Kombi (Doğalgaz)',
      floor: '3. Kat (Ara Kat)',
      broker: 'İlhan Kurt (0541 851 06 00)',
      brokerPhone: '05418510600',
      desc: 'Etimesgut İstasyon Mahallesi merkezinde, Başkentray ve YHT istasyonuna 5 dakika yürüme mesafesinde sıfır lüks daire. Ebeveyn banyolu, giyinme bölümlü, geniş çift balkonlu, kapalı otoparklı ve asansörlüdür. Birinci sınıf işçilik ve kaliteli malzeme kullanılmıştır. Krediye uygundur, hemen taşınmaya hazırdır.'
    },
    en: {
      title: 'Istasyon Dist. Brand New Luxury 3+1 Apartment',
      category: 'FOR SALE RESIDENTIAL',
      price: '3,850,000 TL',
      location: 'Istasyon Neighborhood, Etimesgut, Ankara',
      rooms: '3+1',
      area: '135 m² Net / 155 m² Gross',
      heating: 'Individual Gas Combi',
      floor: '3rd Floor (Middle Floor)',
      broker: 'İlhan Kurt (+90 541 851 06 00)',
      brokerPhone: '05418510600',
      desc: 'Brand new luxury apartment situated in central Istasyon neighborhood, within 5 minutes walk to Baskentray and High Speed Train. Features en-suite master bathroom, dressing area, double balconies, covered parking, and elevator.'
    },
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
  },
  p2: {
    tr: {
      title: 'Bağlıca Bulvarı Cepheli 4+1 Dubleks',
      category: 'FIRSAT PORTFÖY / DUBLEKS',
      price: '6.750.000 TL',
      location: 'Bağlıca Mahallesi, Etimesgut, Ankara',
      rooms: '4+1 Çatı Dubleksi',
      area: '220 m² Net / 250 m² Brüt',
      heating: 'Yerden Isıtma (Merkezi Pay Ölçer)',
      floor: 'Çatı Dubleksi',
      broker: 'Adem Gürsoy (0534 571 99 04)',
      brokerPhone: '05345719904',
      desc: 'Bağlıca Bulvarı üzerinde, prestijli sitede önü tamamen açık şehir manzaralı 4+1 lüks dubleks. 40 m² barbekülü ferah teras, akıllı ev altyapısı, ada tezgahlı modern mutfak ve 7/24 güvenlikli site imkanları sunmaktadır. Bölgenin en değerli lokasyonunda kaçırılmayacak yaşam alanı.'
    },
    en: {
      title: 'Baglica Boulevard Facing 4+1 Duplex Penthouse',
      category: 'FEATURED / DUPLEX',
      price: '6,750,000 TL',
      location: 'Baglica Neighborhood, Etimesgut, Ankara',
      rooms: '4+1 Duplex',
      area: '220 m² Net / 250 m² Gross',
      heating: 'Underfloor Heating',
      floor: 'Penthouse Duplex',
      broker: 'Adem Gürsoy (+90 534 571 99 04)',
      brokerPhone: '05345719904',
      desc: 'Panoramic city view luxury penthouse on Baglica Boulevard. Offers a 40 m² barbecue terrace, smart home automation, high-end kitchen, 24/7 security, and open/closed parking.'
    },
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
  },
  p3: {
    tr: {
      title: 'Cadde Üzeri Kurumsal Kiracılı Satılık Dükkan',
      category: 'TİCARİ YATIRIM',
      price: '5.200.000 TL',
      location: 'Alsancak Mahallesi, Etimesgut, Ankara',
      rooms: 'Ticari / Mağaza & Depo',
      area: '175 m² Net (Düz Giriş + Depo)',
      heating: 'Klima & Doğalgaz',
      floor: 'Zemin Düz Ayak Giriş',
      broker: 'İlhan Kurt (0541 851 06 00)',
      brokerPhone: '05418510600',
      desc: 'Alsancak ana cadde üzerinde, yüksek tabela ve vitrin değerine sahip satılık ticari gayrimenkul. İçerisinde 5 yıllık sözleşmeli kurumsal hazır kiracı bulunmakta olup aylık 35.000 TL net kira getirisi mevcuttur. Düzenli ve yüksek kira çarpanı arayan yatırımcılar için ideal fırsattır.'
    },
    en: {
      title: 'Main Street Commercial Shop with Corporate Tenant',
      category: 'COMMERCIAL INVESTMENT',
      price: '5,200,000 TL',
      location: 'Alsancak Neighborhood, Etimesgut, Ankara',
      rooms: 'Store / Commercial Unit',
      area: '175 m² Net (Ground Floor + Storage)',
      heating: 'A/C & Natural Gas',
      floor: 'Ground Floor Level Entrance',
      broker: 'İlhan Kurt (+90 541 851 06 00)',
      brokerPhone: '05418510600',
      desc: 'High foot-traffic main avenue retail store with a dependable 5-year corporate lease yielding 35,000 TL monthly rental income. Exceptional ROI for long-term commercial property investors.'
    },
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
  },
  p4: {
    tr: {
      title: 'Göksu Parkı Yakını Kiralık 2+1 Daire',
      category: 'KİRALIK KONUT',
      price: '19.500 TL / Ay',
      location: 'Eryaman, Etimesgut, Ankara',
      rooms: '2+1',
      area: '95 m² Net / 110 m² Brüt',
      heating: 'Merkezi Pay Ölçer',
      floor: '2. Kat',
      broker: 'Adem Gürsoy (0534 571 99 04)',
      brokerPhone: '05345719904',
      desc: 'Eryaman Göksu Parkı ve metro istasyonuna yürüme mesafesinde, boyalı ve masrafsız kiralık 2+1 daire. Cam balkonlu, güney-doğu cepheli, açık otoparklı, nezih aile sitesinde huzurlu yaşam alanı. Memur veya kurumsal çalışan aileler tercih sebebidir.'
    },
    en: {
      title: '2+1 Apartment for Rent Near Goksu Park',
      category: 'FOR RENT RESIDENTIAL',
      price: '19,500 TL / Month',
      location: 'Eryaman, Etimesgut, Ankara',
      rooms: '2+1',
      area: '95 m² Net / 110 m² Gross',
      heating: 'Central Heating Meter',
      floor: '2nd Floor',
      broker: 'Adem Gürsoy (+90 534 571 99 04)',
      brokerPhone: '05345719904',
      desc: 'Move-in ready 2+1 rental apartment in walking proximity to Goksu Park and Eryaman Metro station. Glazed balcony, south-east orientation, in a peaceful family complex.'
    },
    img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
  },
  p5: {
    tr: {
      title: 'Süvari Mahallesi Bakımlı 3+1 Ara Kat',
      category: 'SATILIK KONUT',
      price: '3.150.000 TL',
      location: 'Süvari Mahallesi, Etimesgut, Ankara',
      rooms: '3+1',
      area: '125 m² Net / 140 m² Brüt',
      heating: 'Kombi (Doğalgaz)',
      floor: '2. Kat (Ara Kat)',
      broker: 'İlhan Kurt (0541 851 06 00)',
      brokerPhone: '05418510600',
      desc: 'Süvari Mahallesi merkezinde, ilkokul, ortaokul, sağlık ocağı ve semt pazarına 2 dakika mesafede ara kat daire. Yenilenmiş mutfak dolapları ve banyosu, çift balkonu, geniş salonu ile masrafsız hemen oturuma uygun daire.'
    },
    en: {
      title: 'Well-Maintained 3+1 Middle Floor in Suvari',
      category: 'FOR SALE RESIDENTIAL',
      price: '3,150,000 TL',
      location: 'Suvari Neighborhood, Etimesgut, Ankara',
      rooms: '3+1',
      area: '125 m² Net / 140 m² Gross',
      heating: 'Individual Combi',
      floor: '2nd Floor (Middle Floor)',
      broker: 'İlhan Kurt (+90 541 851 06 00)',
      brokerPhone: '05418510600',
      desc: 'Center of Suvari neighborhood, 2 minutes away from primary/middle schools, healthcare clinic, and weekly bazaar. Renovated kitchen, dual balconies, spacious layout.'
    },
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
  },
  p6: {
    tr: {
      title: 'İmarlı Konut & Villa Parseli 650 m²',
      category: 'ARSA & YATIRIM',
      price: '4.450.000 TL',
      location: 'Bağlıca / Şehitali Aksı, Etimesgut, Ankara',
      rooms: 'İmarlı Konut Arsası',
      area: '650 m² Müstakil Parsel',
      heating: 'Altyapı Mevcut',
      floor: 'Emsal: 0.50 (2 Kat Villa İzni)',
      broker: 'Adem Gürsoy (0534 571 99 04)',
      brokerPhone: '05345719904',
      desc: 'Etimesgut Bağlıca ve Şehitali gelişim aksında, etrafında lüks villa projelerinin bulunduğu bölgede müstakil tek tapulu imarlı arsa. Elektrik, su, kanalizasyon ve yol altyapısı mevcuttur. Hemen kendi müstakil villanızı yapabilir veya değer kazanan bölgede yatırımlık tutabilirsiniz.'
    },
    en: {
      title: '650 m² Zoned Residential & Villa Plot',
      category: 'LAND & INVESTMENT',
      price: '4,450,000 TL',
      location: 'Baglica / Sehitali Corridor, Etimesgut, Ankara',
      rooms: 'Zoned Residential Plot',
      area: '650 m² Private Parcel',
      heating: 'Utilities Ready',
      floor: 'FAR: 0.50 (2-Storey Villa Approval)',
      broker: 'Adem Gürsoy (+90 534 571 99 04)',
      brokerPhone: '05345719904',
      desc: 'Standalone freehold titled plot in the fast-appreciating villa development corridor of Baglica/Sehitali. Complete infrastructure including roads, electricity, and water connection.'
    },
    img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
  },
  p7: {
    tr: {
      title: 'Prestijli Sitede 4+1 Ultra Lüks Daire',
      category: 'SATILIK KONUT',
      price: '5.400.000 TL',
      location: 'Ahi Mesut Mahallesi, Etimesgut, Ankara',
      rooms: '4+1',
      area: '170 m² Net / 195 m² Brüt',
      heating: 'Kombi (Doğalgaz)',
      floor: '5. Kat',
      broker: 'İlhan Kurt (0541 851 06 00)',
      brokerPhone: '05418510600',
      desc: 'Ahi Mesut Mahallesinin en gözde sitesinde, çift asansörlü, jeneratörlü, kapalı yüzme havuzu, fitness salonu ve 24 saat özel güvenlikli sitede 4+1 geniş lüks daire. Ankastre set, ebeveyn banyosu, kiler odası ve geniş peyzaj alanları mevcuttur.'
    },
    en: {
      title: '4+1 Ultra Luxury Apartment in Prestigious Complex',
      category: 'FOR SALE RESIDENTIAL',
      price: '5,400,000 TL',
      location: 'Ahi Mesut Neighborhood, Etimesgut, Ankara',
      rooms: '4+1',
      area: '170 m² Net / 195 m² Gross',
      heating: 'Combi Heating',
      floor: '5th Floor',
      broker: 'İlhan Kurt (+90 541 851 06 00)',
      brokerPhone: '05418510600',
      desc: 'Top-tier gated complex in Ahi Mesut featuring indoor swimming pool, gym, 24/7 security guard, backup generator, dual elevators, pantry, and lush landscaping.'
    },
    img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80'
  },
  p8: {
    tr: {
      title: 'Ana Cadde Üzeri Kiralık Ofis / Büro Katı',
      category: 'KİRALIK TİCARİ',
      price: '24.000 TL / Ay',
      location: 'İstasyon Caddesi, Etimesgut, Ankara',
      rooms: '3 Bölüm + Karşılama + Mutfak',
      area: '120 m² Net',
      heating: 'Kombi',
      floor: '1. Kat (Ofis Katı)',
      broker: 'Adem Gürsoy (0534 571 99 04)',
      brokerPhone: '05345719904',
      desc: 'Etimesgut İstasyon Caddesi üzerinde, tabela değeri yüksek iş merkezinde 1. kat kiralık ofis büro. Avukatlık bürosu, mali müşavir, mühendislik, mimarlık veya eğitim danışmanlığı için ideal oda dağılımına sahiptir. Asansörlü binada merkezi konum.'
    },
    en: {
      title: 'Main Street Commercial Office Floor for Rent',
      category: 'FOR RENT COMMERCIAL',
      price: '24,000 TL / Month',
      location: 'Istasyon Avenue, Etimesgut, Ankara',
      rooms: '3 Partitioned Rooms + Reception + Kitchenette',
      area: '120 m² Net',
      heating: 'Combi',
      floor: '1st Floor (Office Level)',
      broker: 'Adem Gürsoy (+90 534 571 99 04)',
      brokerPhone: '05345719904',
      desc: 'Prime business building on Istasyon Avenue, optimal for law practices, accounting, architectural or engineering consulting offices with excellent signage exposure.'
    },
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
  }
};

function initModals() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  
  const closeBtn = modal.querySelector('.modal-close');
  const overlay = modal.querySelector('.modal-overlay');
  
  const mTitle = document.getElementById('modal-project-title');
  const mCat = document.getElementById('modal-project-cat');
  const mPrice = document.getElementById('modal-project-price');
  const mDesc = document.getElementById('modal-project-desc');
  const mLocation = document.getElementById('modal-meta-location');
  const mRooms = document.getElementById('modal-meta-rooms');
  const mArea = document.getElementById('modal-meta-area');
  const mHeating = document.getElementById('modal-meta-heating');
  const mFloor = document.getElementById('modal-meta-floor');
  const mBroker = document.getElementById('modal-meta-broker');
  const mImg = document.getElementById('modal-project-img');
  const btnWa = document.getElementById('modal-btn-wa');
  const btnCall = document.getElementById('modal-btn-call');
  
  const projectCards = document.querySelectorAll('.project-card[data-id]');
  
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const pid = card.getAttribute('data-id');
      const item = propertyData[pid];
      
      if (item) {
        const langData = item[currentLang] || item['tr'];
        if (mTitle) mTitle.innerText = langData.title;
        if (mCat) mCat.innerText = langData.category;
        if (mPrice) mPrice.innerText = langData.price;
        if (mDesc) mDesc.innerText = langData.desc;
        if (mLocation) mLocation.innerText = langData.location;
        if (mRooms) mRooms.innerText = langData.rooms;
        if (mArea) mArea.innerText = langData.area;
        if (mHeating) mHeating.innerText = langData.heating;
        if (mFloor) mFloor.innerText = langData.floor;
        if (mBroker) mBroker.innerText = langData.broker;
        if (mImg) mImg.src = item.img;
        
        const brokerNumber = langData.brokerPhone || '05418510600';
        const waMsg = encodeURIComponent(
          `Merhaba, web sitenizdeki "${langData.title}" (${langData.price}) ilanınız hakkında detaylı bilgi almak istiyorum.`
        );
        
        if (btnWa) {
          btnWa.href = `https://wa.me/90${brokerNumber.replace(/^0/, '')}?text=${waMsg}`;
        }
        if (btnCall) {
          btnCall.href = `tel:${brokerNumber}`;
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
  
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);
  
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// 10. FLOATING WHATSAPP & CONTACT WIDGET
function initFloatingWidget() {
  const toggleBtn = document.getElementById('floating-wa-toggle');
  const menu = document.getElementById('floating-wa-menu');
  
  if (!toggleBtn || !menu) return;
  
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('active');
  });
  
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== toggleBtn) {
      menu.classList.remove('active');
    }
  });
}

// 11. LANGUAGE TRANSLATION (i18n)
const translations = {
  tr: {
    "nav-corporate": "Kurumsal",
    "nav-sectors": "Hizmetlerimiz",
    "nav-projects": "Portföyümüz",
    "nav-reviews": "Google Yorumları (4.8 ★)",
    "nav-blog": "Blog",
    "nav-contact": "İletişim",
    
    "hero-title-1": "Güvenilir, Şeffaf ve",
    "hero-title-2": "Doğru Yatırımın Adresi",
    "hero-desc": "İlhan Kurt ve Adem Gürsoy güvencesiyle; Etimesgut, Bağlıca, Eryaman ve tüm Ankara aksında satılık ve kiralık konut, ticari mülk ve yatırımlık arsalarda dürüst esnaflık ve profesyonel\u00A0danışmanlık.",
    "hero-btn-1": "Portföyümüzü İnceleyin",
    "hero-btn-2": "Bize Ulaşın",
    
    "stat-reviews-lbl": "Google Müşteri Yorumu (4.8 ★)",
    "stat-experience-lbl": "Yıllık Bölge Uzmanlığı",
    "stat-deals-lbl": "Başarılı Alım-Satım & Kiralama",
    "stat-trust-lbl": "Şeffaflık & Müşteri Memnuniyeti",
    
    "sectors-sub": "Uzmanlık Alanlarımız",
    "sectors-title": "Hizmetlerimiz",
    "sectors-btn": "Tüm Hizmetler",
    
    "sec1-title": "Konut Alım, Satım & Kiralama",
    "sec1-desc": "Etimesgut ve çevre mahallelerde sıfır ve ikinci el daireler, dubleksler, site içi konutlar ve güvenilir kiracı yerleşimi.",
    "sec2-title": "Ticari Gayrimenkul & Dükkan",
    "sec2-desc": "Cadde üzeri dükkanlar, mağazalar, plazalar, yüksek kira getirili kurumsal kiracılı ticari mülk yatırımları.",
    "sec3-title": "Arsa, Arazi & Tarla Yatırımları",
    "sec3-desc": "Etimesgut, Bağlıca, Yapracık ve çevre gelişim koridorlarında imarlı konut/ticari arsalar ve kat karşılığı projeler.",
    
    "proj-sub": "Fırsat ve Güncel İlanlar",
    "proj-title": "Öne Çıkan Portföyümüz",
    "proj-btn": "Tüm İlanları İncele",
    "filter-all": "Tümü",
    
    "corp-sub": "Köklü Güven, Dürüst Esnaflık",
    "corp-title": "Biz Kimiz & Danışmanlarımız",
    "corp-p1": "Etimesgut Emlak Ofisi, Ankara Etimesgut'ta gayrimenkul alım, satım, kiralama ve yatırım danışmanlığı alanında dürüstlük, hak ve hukuk gözetme ilkeleriyle hizmet veren bölgenin öncü gayrimenkul ofisidir.",
    "corp-p2": "Müşterilerimizin 'Nerede o eski güvenilir esnaflar derdik, çok da uzakta değilmiş' sözleriyle tarif ettiği çalışma prensibimiz; malı satıp elden çıkarmak değil, her taşınmazı bizzat kendimize alıyormuşçasına tüm artıları ve eksileriyle şeffaf biçimde sunmaktır.",
    
    "sec-page-sub": "Kapsamlı Danışmanlık",
    "sec-page-title": "Gayrimenkul Hizmetlerimiz",
    
    "proj-page-sub": "Seçkin İlanlarımız",
    "proj-page-title": "Etimesgut Emlak Portföyü",
    
    "contact-page-sub": "Ofisimize Bir Kahveye Bekleriz",
    "contact-page-title": "İletişim & Konum",
    "contact-panel-h": "Etimesgut Emlak Ofisi",
    "contact-panel-p": "Ev alım-satımı, kiralama, arsa yatırımı veya ücretsiz ekspertiz için ofisimize bekler veya doğrudan telefonla arayabilirsiniz.",
    "office-phone": "Telefon & Danışmanlar",
    "office-address": "Adres",
    "contact-form-h": "Bize Mesaj Gönderin",
    "contact-form-btn": "Mesajı Gönder",
    
    "footer-text": "Etimesgut Emlak Ofisi, İlhan Kurt ve Adem Gürsoy güvencesiyle Ankara Etimesgut genelinde güvenilir, şeffaf ve profesyonel gayrimenkul alım-satım ve kiralama danışmanlığı sunar."
  },
  en: {
    "nav-corporate": "About Us",
    "nav-sectors": "Services",
    "nav-projects": "Properties",
    "nav-reviews": "Google Reviews (4.8 ★)",
    "nav-blog": "Blog",
    "nav-contact": "Contact",
    
    "hero-title-1": "Trusted, Transparent and",
    "hero-title-2": "The Right Investment Address",
    "hero-desc": "Under the assurance of İlhan Kurt and Adem Gürsoy; providing honest, reliable and professional real estate solutions for residential, commercial and land investments in Etimesgut, Baglica, and Eryaman.",
    "hero-btn-1": "Explore Our Portfolio",
    "hero-btn-2": "Contact Us",
    
    "stat-reviews-lbl": "Google Client Reviews (4.8 ★)",
    "stat-experience-lbl": "Years of Regional Expertise",
    "stat-deals-lbl": "Successful Sales & Rentals",
    "stat-trust-lbl": "Transparency & Satisfaction",
    
    "sectors-sub": "Our Expertise",
    "sectors-title": "Our Real Estate Services",
    "sectors-btn": "All Services",
    
    "sec1-title": "Residential Sales & Leasing",
    "sec1-desc": "New and resale apartments, duplexes, gated residential communities and dependable tenant placements in Etimesgut.",
    "sec2-title": "Commercial Real Estate & Shops",
    "sec2-desc": "High-visibility retail shops, corporate-leased properties and office spaces with solid rental returns.",
    "sec3-title": "Land & Plot Investments",
    "sec3-desc": "Zoned residential plots, villa parcels and high-growth land investments in Baglica, Sehitali and Etimesgut corridors.",
    
    "proj-sub": "Current Listings",
    "proj-title": "Featured Real Estate",
    "proj-btn": "View All Properties",
    "filter-all": "All",
    
    "corp-sub": "Established Trust, Honest Brokerage",
    "corp-title": "About Us & Our Brokers",
    "corp-p1": "Etimesgut Real Estate Office is a premier brokerage in Ankara dedicated to honesty, transparency and legal integrity.",
    "corp-p2": "Described by our clients as the benchmark for traditional honest merchant values, we treat every property as if we are buying it for ourselves, disclosing every detail with zero hidden defects.",
    
    "sec-page-sub": "End-to-End Solutions",
    "sec-page-title": "Real Estate Services",
    
    "proj-page-sub": "Exclusive Portfolio",
    "proj-page-title": "Etimesgut Property Listings",
    
    "contact-page-sub": "We Welcome You For Coffee",
    "contact-page-title": "Contact & Office Location",
    "contact-panel-h": "Etimesgut Real Estate Office",
    "contact-panel-p": "Visit our office or call us directly for property buying, selling, rentals or complimentary valuation.",
    "office-phone": "Phone & Brokers",
    "office-address": "Address",
    "contact-form-h": "Send Us a Message",
    "contact-form-btn": "Submit Message",
    
    "footer-text": "Etimesgut Real Estate Office provides dependable, transparent and expert real estate brokerage led by İlhan Kurt and Adem Gürsoy in Ankara."
  }
};

function initLanguageSwitcher() {
  const switchBtn = document.getElementById('lang-switch');
  if (!switchBtn) return;
  
  switchBtn.addEventListener('click', () => {
    currentLang = currentLang === 'tr' ? 'en' : 'tr';
    switchBtn.innerText = currentLang === 'tr' ? 'EN' : 'TR';
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[currentLang] && translations[currentLang][key]) {
        el.innerText = translations[currentLang][key];
      }
    });
  });
}


// 12. BLOG DATA AND READER MODAL
window.blogPostsData = [{"id": "blog-1", "title": "Etimesgut'ta Ev Alırken Dikkat Edilmesi Gereken 7 Altın Kural", "category": "Konut Rehberi", "cat_slug": "rehber", "date": "14 Mart 2026", "author": "İlhan Kurt", "read_time": "5 dk okuma", "img": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80", "excerpt": "Ankara'nın en dinamik ilçelerinden Etimesgut'ta ev satın alırken zemin etüdünden tapu türüne, ulaşım akslarından emsal değer analizine kadar bilmeniz gereken hayati püf noktaları.", "content": "\n<p>Ankara'nın batıya doğru genişleyen en güçlü koridorlarından biri olan Etimesgut, son yıllarda gerek aile yaşamı gerekse yatırım getirisi açısından başkentin en çok rağbet gören ilçelerinden biri haline gelmiştir. 15 yılı aşkın bölge uzmanlığımızla, Etimesgut'ta ev almayı düşünen alıcıların mutlaka dikkat etmesi gereken 7 temel kuralı derledik:</p>\n\n<h3>1. Tapu Türünü Doğrulayın: Kat Mülkiyeti ve İskan Durumu</h3>\n<p>Bir mülk satın alırken karşılaşabileceğiniz en büyük yanılgılardan biri 'kat irtifakı' ile 'kat mülkiyeti' arasındaki farkı bilmemektir. İskanı (Yapı Kullanım İzin Belgesi) alınmamış binalarda şantiye tarifesi üzerinden faturalandırma ve ilerleyen dönemde hukuki yaptırımlar riski bulunmaktadır. Etimesgut Emlak Ofisi olarak her portföyümüzün iskan durumunu belediye ve tapu müdürlüğünden bizzat teyit ediyoruz.</p>\n\n<h3>2. Ulaşım Aksları ve Başkentray / Metro Mesafesi</h3>\n<p>Etimesgut'ta konut değerini belirleyen ana etkenlerden biri Başkentray banliyö treni, Eryaman 1-2 metro durakları ve İstanbul Yolu - Eskişehir Yolu bağlantılarıdır. İstasyon, Alsancak veya Süvari mahallelerinde Başkentray durağına yürüme mesafesinde olan bir daire hem yüksek kira getirisi sağlar hem de değerini hızla katlar.</p>\n\n<h3>3. Bölge Rayiç Bedeli ve Emsal Fiyat Karşılaştırması</h3>\n<p>Aynı sokakta yer alan iki binanın m² birim fiyatları; bina yaşı, cephe, otopark ve ısı yalıtımına göre değişkenlik gösterir. İlan sitelerindeki abartılı köpük fiyatlara aldanmamak için bölgede son 6 ayda gerçekleşmiş fiili tapu satışlarını bilen lisanslı bir gayrimenkul danışmanından destek almalısınız.</p>\n\n<h3>4. Bina Isı Yalıtımı ve Isınma Maliyetleri</h3>\n<p>Ankara kışlarının sert geçtiği bilinmektedir. Mantolaması eksik veya kalitesiz malzemeyle yapılmış konutlar, yüksek doğalgaz faturalarına yol açar. Merkezi pay ölçer veya bireysel kombi altyapısını yerinde kontrol edin.</p>\n\n<h3>5. Otopark ve Sosyal Donatı İhtiyacı</h3>\n<p>Özellikle Ahi Mesut, Eryaman ve Bağlıca bölgelerinde kapalı otopark ve peyzaj alanları konutun yeniden satış kabiliyetini doğrudan etkiler.</p>\n\n<h3>6. Kredi Uygunluğu ve Ekspertiz Raporu</h3>\n<p>Kredi kullanacaksanız, bankanın göndereceği SPK lisanslı gayrimenkul değerleme uzmanının raporu mülkün kredi tavanını belirler. Hisseli, hacizli veya imara aykırı eklentileri olan mülklerde kredi onaylanmayabilir.</p>\n\n<h3>7. Lisanslı ve Bölgeye Hakim Emlak Ofisiyle Çalışın</h3>\n<p>T.C. Ticaret Bakanlığı Taşınmaz Ticareti Yetki Belgesi (No: 0604716) sahibi olan ofisimiz, alıcı ve satıcı haklarını koruyan şeffaf sözleşmelerle süreci baştan sona güvence altına almaktadır.</p>\n"}, {"id": "blog-2", "title": "Bağlıca Gayrimenkul Piyasası: Neden Ankara'nın En Hızlı Değerlenen Bölgesi?", "category": "Bölge Analizi", "cat_slug": "bolge", "date": "11 Mart 2026", "author": "Adem Gürsoy", "read_time": "6 dk okuma", "img": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "excerpt": "Geniş bulvarları, lüks villa konseptleri, prestijli 4+1/dubleks projeleri ve Çankaya-Üniversiteler aksına yakınlığıyla Bağlıca'nın yatırım cazibesi neden durmaksızın yükseliyor?", "content": "\n<p>Bağlıca, son 10 yılda Ankara'nın en dikkat çekici gayrimenkul dönüşümüne sahne oldu. Eskiden bağ evleri ve tarlalarıyla bilinen bölge, bugün başkentin en prestijli villa ve lüks konut merkezlerinden biri konumundadır.</p>\n\n<h3>Yatay Mimari ve Düşük Yoğunluklu Yerleşim</h3>\n<p>Çankaya ve İncek gibi yüksek fiyatlı bölgelere alternatif arayan üst gelir grubu ve bürokratlar, Bağlıca'nın geniş parsel yapısını ve villa parsellerini tercih etmektedir. Bölgede çok katlı sıkışık yapılaşma yerine bahçeli villalar ve ferah siteler hâkimdir.</p>\n\n<h3>Milli Savunma Bakanlığı 'Ay Yıldız' Projesi Etkisi</h3>\n<p>Etimesgut sınırları içerisinde inşa edilen devasa Milli Savunma Bakanlığı ve Genelkurmay Başkanlığı 'Ay Yıldız' yerleşkesi, Bağlıca ve İstasyon bölgesine üst düzey bürokrat ve askeri personelin talebini zirveye taşımıştır. Bu durum kiralık ve satılık lüks konut talebini yapısal olarak desteklemektedir.</p>\n\n<h3>Üniversiteler ve Çevre Yolu Bağlantısı</h3>\n<p>Başkent Üniversitesi'ne olan komşuluk, Çankaya Üniversitesi ve ODTÜ-Bilkent aksına bağlanan yeni bulvarlar ile çevre yolu bağlantısı Bağlıca'yı şehrin merkezine bağlamıştır.</p>\n\n<h3>Yatırımcı İçin Getiri Öngörüsü</h3>\n<p>Bağlıca'da arsa ve konut fiyatları enflasyonun üzerinde reel prim üretmeye devam etmektedir. Özellikle Bağlıca Bulvarı cepheli ticari mülkler ile Şehitali-Yapracık koridorundaki villa imarlı arsalar orta ve uzun vadeli yatırımcısına yüksek kazanç vadetmektedir.</p>\n"}, {"id": "blog-3", "title": "Eryaman ve Göksu Çevresinde Konut Yatırımı: Trendler ve Fırsatlar", "category": "Bölge Analizi", "cat_slug": "bolge", "date": "8 Mart 2026", "author": "İlhan Kurt", "read_time": "4 dk okuma", "img": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80", "excerpt": "Metro hatlarına yakınlığı, Göksu Parkı ve çevresindeki sosyal yaşam kalitesi ile Eryaman'ın yüksek kira çarpanı dinamikleri yatırımcısına ne vadediyor?", "content": "\n<p>Eryaman, düzenli şehir planı, geniş parkları ve metro bağlantısıyla Ankara'da konut kiralama ve satış hızının en yüksek olduğu bölgelerdendir. Konutun boş kalma süresi Eryaman genelinde ortalama 15-20 gün civarındadır.</p>\n\n<h3>Metro Hattı Avantajı: Eryaman 1-2 ve Devlet Mahallesi</h3>\n<p>Kızılay ve Batıkent aktarmasız metro erişimi, memur ve kurumsal çalışanların Eryaman'ı ilk sıraya yazmasını sağlamaktadır. Metro duraklarına 5-10 dakika yürüme mesafesinde olan 1+1, 2+1 ve 3+1 daireler hem likiditesi en yüksek hem de kira amortisman süresi en kısa konutlardır.</p>\n\n<h3>Göksu Parkı ve Çevresindeki Lüks Yaşam</h3>\n<p>Göksu Göleti çevresinde konumlanan modern konut projeleri, manzara ve sosyal imkanlarıyla ailelerin ve çocuklu sakinlerin gözdesidir. Bölgede site yönetimi oturmuş, güvenlikli ve havuzlu konutlar değerini sürekli korumaktadır.</p>\n\n<h3>Kira Getirisi ve Amortisman Süresi</h3>\n<p>Eryaman'da konut yatırımı yapan yatırımcılar, Ankara genel ortalamasına göre 2-3 yıl daha kısa amortisman süresi avantajı elde etmektedir. Özellikle eşyalı 1+1 ve 2+1 dairelerde kira çarpanı oldukça caziptir.</p>\n"}, {"id": "blog-4", "title": "İstasyon Mahallesi'nin Stratejik Önemi: Başkentray, Ulaşım ve Kentsel Gelişim", "category": "Bölge Analizi", "cat_slug": "bolge", "date": "5 Mart 2026", "author": "Adem Gürsoy", "read_time": "5 dk okuma", "img": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80", "excerpt": "Etimesgut Tren Garı ve Başkentray hattı üzerinde yer alan İstasyon Mahallesi'nin merkezi konumu, çarşı hareketliliği ve esnaf kültürüyle prim potansiyeli.", "content": "\n<p>Ofisimizin de yer aldığı İstasyon Mahallesi (Güzelyurt Sokak No: 6/A), Etimesgut'un kalbi ve ticari merkezidir. Tarihi tren istasyonunun etrafında gelişen bu köklü mahalle, günümüzde Başkentray ve YHT entegrasyonuyla başkentin en kritik ulaşım düğüm noktalarından biridir.</p>\n\n<h3>Sıhhiye ve Kızılay'a 22 Dakikada Ulaşım</h3>\n<p>Başkentray banliyö treni sayesinde İstasyon Mahallesi sakinleri trafiğe takılmadan Sıhhiye, Kurtuluş ve Kayaş yönüne dakikalar içinde seyahat edebilmektedir. Bu ulaşım konforu mahalledeki konut ve dükkan talebini daima canlı tutmaktadır.</p>\n\n<h3>Canlı Çarşı ve Esnaf Dinamizmi</h3>\n<p>Hükümet Konağı, bankalar, belediye birimleri ve sağlık merkezlerinin İstasyon Mahallesi çevresinde yoğunlaşması, bölgeyi sadece bir konut alanı değil aynı zamanda yoğun yaya trafiğine sahip güçlü bir ticaret merkezi kılmaktadır.</p>\n\n<h3>Yatırım ve Kentsel Dönüşüm Fırsatları</h3>\n<p>Mahalledeki eski yapı stoğu hızla yerini modern, asansörlü ve otoparklı binalara bırakmaktadır. Dönüşüm projelerine erken dahil olan yatırımcılar, arsa payı avantajıyla yüksek kâr elde etmektedir.</p>\n"}, {"id": "blog-5", "title": "Ankara Batı Aksı İmar ve Arsa Yatırımı Rehberi (Şehitali, Yapracık, Bağlıca)", "category": "Yatırım & Piyasa", "cat_slug": "yatirim", "date": "28 Şubat 2026", "author": "İlhan Kurt", "read_time": "7 dk okuma", "img": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80", "excerpt": "İmar planları, parselasyon, 18. madde uygulamaları ve kat karşılığı inşaat sözleşmelerinde topraktan kazanmanın güvenli ve hukuki adımları.", "content": "\n<p>Toprak, gayrimenkul yatırımları arasında sınırlı arzı sebebiyle en yüksek katma değeri üreten yatırım aracıdır. Ancak arsa ve arazi yatırımı, konut alımına kıyasla çok daha derin hukuki ve imar bilgisi gerektirir.</p>\n\n<h3>İmarlı Arsa ile Tarla Arasındaki Kritik Ayrım</h3>\n<p>Tarlalar imar planı dışında kalan kadastral arazilerdir ve üzerlerine yasal inşaat izni verilmez. İmarlı arsalar ise parselasyon planı tamamlanmış, KAKS (Emsal) ve TAKS oranları belirlenmiş, yapı ruhsatı almaya hazır taşınmazlardır. Arsa alırken imar durum belgesi (çap) mutlaka belediyeden incelenmelidir.</p>\n\n<h3>Şehitali ve Yapracık Bölgesinin Geleceği</h3>\n<p>Ankara'nın güneybatı gelişim ekseninde yer alan Şehitali ve Yapracık, yeni açılan bulvarlar ve geniş konut alanlarıyla 5-10 yıllık vadede en yüksek prim potansiyeline sahip bölgelerdir. Doğru parselde, altyapı geçiş güzergahında yer alan parseller yatırımcısını zengin etmektedir.</p>\n\n<h3>Kat Karşılığı İnşaat Anlaşmalarında Dikkat Edilecekler</h3>\n<p>Arsanızı müteahhide kat karşılığı teslim ederken sözleşmede inşaat süresi, gecikme cezası, teknik şartname kalitesi ve bağımsız bölüm paylaşımı noter onaylı olarak en ince detayına kadar yazılmalıdır.</p>\n"}, {"id": "blog-6", "title": "Ev Satışında Doğru Fiyat Tespiti: Emsal Değerleme Neden Hayatidir?", "category": "Yatırım & Piyasa", "cat_slug": "yatirim", "date": "24 Şubat 2026", "author": "Adem Gürsoy", "read_time": "4 dk okuma", "img": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80", "excerpt": "Gayrimenkulün piyasada aylarca beklemeden, değer kaybetmeden ve değerinde satılması için reel piyasa emsal analizi nasıl yapılır?", "content": "\n<p>Evini satmak isteyen mülk sahiplerinin düştüğü en yaygın hata, internetteki ilan fiyatlarını baz alarak kendi evine fiyat biçmektir. Oysa ilan sitelerindeki fiyatlar 'satıcının hayal ettiği' fiyattır; tapuda gerçekleşen 'alıcının ödediği gerçek fiyat' değildir.</p>\n\n<h3>Aşırı Fiyatlandırmanın Tehlikeleri</h3>\n<p>Piyasa rayicinin %20 üzerinde fiyatla satışa çıkan bir konut, ilk 3 haftalık en değerli vitrin dönemini kaybeder. İlan eskidikçe alıcıların gözünde 'demek ki bu evde bir problem var ki satılmıyor' algısı oluşur ve mülk sahibi aylar sonra evini gerçek değerinin de altına satmak zorunda kalır.</p>\n\n<h3>Etimesgut Emlak Ofisi Emsal Değerleme Yöntemi</h3>\n<p>Bizler portföyümüze aldığımız her taşınmaz için son 90 günde bölgede el değiştiren benzer m² ve özelliklerdeki dairelerin fiili satış verilerini analiz ederiz. Böylece mülkünüz doğru fiyatla piyasaya çıkar ve ortalama 30-45 gün içinde en yüksek değerle nakde çevrilir.</p>\n"}, {"id": "blog-7", "title": "Taşınmaz Ticareti Yetki Belgesi (0604716) Neden Bu Kadar Önemlidir?", "category": "Tapu & Hukuk", "cat_slug": "hukuk", "date": "20 Şubat 2026", "author": "İlhan Kurt", "read_time": "5 dk okuma", "img": "tasinmaz_ticareti_yetki_belgesi.jpg", "excerpt": "T.C. Ticaret Bakanlığı lisanslı gayrimenkul danışmanlığı ile merdiven altı yetkisiz aracılar arasındaki farklar ve tüketici güvencesi.", "content": "\n<p>Gayrimenkul alım satımı, hayatınız boyunca biriktirdiğiniz emeğin ve sermayenin en büyük kısmını oluşturur. Böylesine kritik bir işlemde yetki belgesiz, ayakçı veya merdiven altı şahıslarla çalışmak telafisi imkansız maddi kayıplara yol açabilir.</p>\n\n<h3>Yasal Zorunluluk: Taşınmaz Ticareti Yönetmeliği</h3>\n<p>T.C. Ticaret Bakanlığı mevzuatına göre Yetki Belgesi olmayan kişi ve işletmelerin gayrimenkul aracılığı yapması, tabela asması ve ilan sitelerine portföy girmesi kanunen yasaktır. <strong>Etimesgut Emlak Ofisi</strong>, Ankara Valiliği Ticaret İl Müdürlüğü tarafından verilmiş <strong>0604716</strong> numaralı resmi Taşınmaz Ticareti Yetki Belgesi sahibidir.</p>\n\n<h3>Yetkili Emlak Ofisi Size Ne Sağlar?</h3>\n<ul>\n<li><strong>Hukuki Sorumluluk:</strong> Yapılan her işlemde sözleşme güvencesi ve yasal sorumluluk vardır.</li>\n<li><strong>Şeffaf Hizmet Bedeli:</strong> Kanuni komisyon oranları dışında hiçbir gizli masraf talep edilmez.</li>\n<li><strong>Tapu ve Banka Güvencesi:</strong> İpotek, haciz, şerh ve tapu kayıtları uzman gözüyle taranır.</li>\n</ul>\n"}, {"id": "blog-8", "title": "Tapu Devir Sürecinde Alıcı ve Satıcının Hazırlaması Gereken Evraklar", "category": "Tapu & Hukuk", "cat_slug": "hukuk", "date": "16 Şubat 2026", "author": "Adem Gürsoy", "read_time": "4 dk okuma", "img": "tapu_kredi_takip.jpg", "excerpt": "Web-Tapu randevusu, DASK poliçesi, belediye rayiç belgesi, döner sermaye harcı ve güvenli para transferi (Tapu Takas) adımları.", "content": "\n<p>Tapu müdürlüğünde imza aşamasına gelindiğinde herhangi bir evrak eksikliği randevunun yanmasına ve sürecin günlerce uzamasına neden olabilir. İşte eksiksiz bir tapu devri için gerekli kontrol listesi:</p>\n\n<h3>Satıcının Hazırlaması Gerekenler</h3>\n<ul>\n<li>Tapu Senedi aslı veya fotokopisi.</li>\n<li>İlgili belediyeden (Etimesgut Belediyesi) alınmış 'Vergi Borcu Yoktur' ve 'Rayiç Değer Belgesi'.</li>\n<li>Konutun güncel DASK (Zorunlu Deprem Sigortası) poliçesi.</li>\n<li>T.C. Kimlik Kartı aslı.</li>\n</ul>\n\n<h3>Alıcının Hazırlaması Gerekenler</h3>\n<ul>\n<li>T.C. Kimlik Kartı aslı.</li>\n<li>Kredi kullanılıyorsa bankanın ipotek evrakları ve avukat koordinasyonu.</li>\n</ul>\n\n<h3>Güvenli Para Transferi: Tapu Takas Sistemi</h3>\n<p>Etimesgut Emlak Ofisi olarak müşterilerimizin çantada nakit para taşımasını kesinlikle tavsiye etmiyoruz. Takasbank güvencesindeki TapuTakas sistemi veya banka bloke çek uygulamasıyla, para ancak tapudaki ıslak imzalar tamamlandıktan sonra satıcının hesabına geçer.</p>\n"}, {"id": "blog-9", "title": "Kat İrtifakı ile Kat Mülkiyeti Arasındaki Farklar ve İskan Önemi", "category": "Tapu & Hukuk", "cat_slug": "hukuk", "date": "12 Şubat 2026", "author": "İlhan Kurt", "read_time": "5 dk okuma", "img": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", "excerpt": "Yapı kullanım izin belgesi (iskan) olmayan binalardaki şantiye elektriği/suyu riskleri ve kat mülkiyetli tapunun değeri.", "content": "\n<p>Gayrimenkul satın alırken tapu belgesinin üzerindeki kutucuklara dikkatlice bakmak gerekir: 'Kat İrtifakı' mı işaretli yoksa 'Kat Mülkiyeti' mi?</p>\n\n<h3>Kat İrtifakı Nedir?</h3>\n<p>Henüz inşaatı devam eden veya inşaatı bitmiş ancak belediyeden iskan onayı henüz alınmamış binalarda arsa payı üzerinden kurulan mülkiyet hakkıdır.</p>\n\n<h3>Kat Mülkiyeti Nedir?</h3>\n<p>Binanın projesine, sığınak, yangın merdiveni, statik ve imar yönetmeliklerine %100 uygun tamamlandığını gösteren İskan Belgesi alındıktan sonra tapu sicilinde tescil edilen nihai bağımsız bölüm tapusudur.</p>\n\n<h3>İskansız Ev Almanın Riskleri</h3>\n<p>İskanı olmayan binalar konut elektrik/su tarifesi yerine yüksek fiyatlı şantiye tarifesi ödemek zorunda kalabilir. Ayrıca binada projeye aykırı kaçak kat, sığınak ihlali vb. kusurlar varsa belediyece yıkım veya ceza kararları çıkabilir.</p>\n"}, {"id": "blog-10", "title": "Etimesgut Kiralık Ev Arayan Memur ve Aileler İçin En Uygun Mahalleler", "category": "Konut Rehberi", "cat_slug": "rehber", "date": "8 Şubat 2026", "author": "Adem Gürsoy", "read_time": "5 dk okuma", "img": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80", "excerpt": "Zırhlı Birlikler, Milli Savunma Bakanlığı ve kamu personeli için güvenli, okullara ve toplu taşımaya yakın mahalle analizleri.", "content": "\n<p>Etimesgut, başkent Ankara'da kamu çalışanlarının, öğretmenlerin, askeri personelin ve çekirdek ailelerin huzurla ikamet ettiği en popüler ilçelerden biridir. Kiralık ev ararken beklentinize göre öne çıkan mahalleler şunlardır:</p>\n\n<h3>1. İstasyon ve Süvari Mahallesi: Ulaşım Odaklı</h3>\n<p>Tren garına ve dolmuş hatlarına birkaç adım mesafede yaşamak isteyen, Sıhhiye veya Kızılay'a işe gidip gelen kamu çalışanları için en pratik ve bütçe dostu mahallelerdir.</p>\n\n<h3>2. Eryaman ve Devlet Mahallesi: Modern ve Sosyal</h3>\n<p>Geniş siteler, kreşler, kolejler ve AVM erişimi arayan genç aileler için metroya yakın Eryaman etapları ideal bir seçenektir.</p>\n\n<h3>3. Ahi Mesut ve Alsancak Mahallesi: Aile Yaşamı</h3>\n<p>Havadar konumu, geniş parkları ve yeni konut projeleriyle Ahi Mesut, sessiz ve sakin bir aile muhiti arayanların ilk tercihidir.</p>\n"}, {"id": "blog-11", "title": "Alsancak ve Süvari Mahallelerinde Ticari Dükkan ve Mağaza Yatırımı", "category": "Yatırım & Piyasa", "cat_slug": "yatirim", "date": "4 Şubat 2026", "author": "İlhan Kurt", "read_time": "6 dk okuma", "img": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80", "excerpt": "Cadde üzeri kurumsal kiracılı ticari mülklerde amortisman süreleri, hava parası dinamikleri ve yüksek kira getirili dükkanlar.", "content": "\n<p>Ticari gayrimenkul yatırımı, konut yatırımına kıyasla kiracıyla uğraşma derdinin az olması, tadilat masraflarının kiracı tarafından karşılanması ve uzun vadeli sözleşmeler (5-10 yıl) sunmasıyla profesyonel yatırımcıların gözdesidir.</p>\n\n<h3>Cadde Üzeri ve Tabela Değeri</h3>\n<p>Alsancak ve Süvari mahallelerinin ana caddelerinde yer alan dükkanlar; market zincirleri, eczaneler, medikal firmalar ve unlu mamul işletmeleri için yüksek talep görmektedir.</p>\n\n<h3>Kurumsal Kiracılı Mülklerin Avantajı</h3>\n<p>BİM, A101, ŞOK veya kurumsal banka şubelerinin kiracı olduğu mülklerde kira tahsilatı sorunu yaşanmaz. Düzenli TÜFE kira artışlarıyla enflasyona karşı tam koruma sağlanır.</p>\n"}, {"id": "blog-12", "title": "Konut Kredisi Başvurusunda Ekspertiz ve İpotek Aşamaları", "category": "Tapu & Hukuk", "cat_slug": "hukuk", "date": "31 Ocak 2026", "author": "Adem Gürsoy", "read_time": "4 dk okuma", "img": "tapu_kredi_takip.jpg", "excerpt": "Banka eksperlerinin değerleme kriterleri, kredi onay süreçleri ve ipotek tesisinde dikkat edilecek hususlar.", "content": "\n<p>Konut kredisiyle ev satın alırken bankaların onay süreçleri iki aşamalı işler: Birincisi alıcının kredi notu ve gelir durumu, ikincisi ise satın alınacak evin teknik ve hukuki durumudur.</p>\n\n<h3>Ekspertiz Raporunda Nelere Bakılır?</h3>\n<p>SPK lisanslı değerleme uzmanı belediye imar arşivinden binanın onaylı mimari projesini inceler. Dairenin yerinde ölçümünü yaparak projeye uygun olup olmadığını, balkon kapatmalarını, ortak alan işgallerini ve binanın deprem dayanıklılığını raporlar.</p>\n\n<h3>Kredi Oranları ve Limitler</h3>\n<p>BDDK'nın güncel düzenlemelerine göre evin enerji sınıfı ve ekspertiz değerine bağlı olarak kredi kullanım oranı belirlenir. Etimesgut Emlak Ofisi olarak kredi sürecinizin bankalar nezdinde en hızlı şekilde sonuçlanması için dosya takibini bizzat yapıyoruz.</p>\n"}, {"id": "blog-13", "title": "Ankara'da Sıfır Bina mı, İkinci El Konut mu? Getiri Karşılaştırması", "category": "Konut Rehberi", "cat_slug": "rehber", "date": "27 Ocak 2026", "author": "İlhan Kurt", "read_time": "5 dk okuma", "img": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "excerpt": "Tadilat maliyetleri, enerji kimlik belgesi, bina yaşı ve amortisman açısından sıfır bina ile 2. el daire kıyaslaması.", "content": "\n<p>Konut alıcılarının en sık ikilemde kaldığı konulardan biri sıfır bir projeden daire almak ile oturmuş bir mahallede ikinci el konut tercih etmek arasındaki dengedir.</p>\n\n<h3>Sıfır Binaların Artıları ve Eksileri</h3>\n<p>Modern mimari, yeni tesisat, asansör konforu ve 5 yıl boyunca müteahhidin gizli ayıplardan sorumluluğu sıfır binaların en büyük artısıdır. Ancak genellikle m² birim fiyatları ikinci ele göre %30-40 daha yüksektir.</p>\n\n<h3>İkinci El Konutların Cazip Yönleri</h3>\n<p>İkinci el daireler genellikle daha geniş m²'lere sahiptir, çevre düzenlemesi ve komşuluk ilişkileri oturmuştur. Doğru fiyata alınan ve ufak bir tadilatla yenilenen ikinci el bir daire, sıfır konuta göre çok daha yüksek bir kârlılık sağlayabilir.</p>\n"}, {"id": "blog-14", "title": "Ahi Mesut ve Elvankent Bölgesinde Site İçi Yaşam ve Yatırım Avantajları", "category": "Bölge Analizi", "cat_slug": "bolge", "date": "23 Ocak 2026", "author": "Adem Gürsoy", "read_time": "5 dk okuma", "img": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", "excerpt": "Kapalı otopark, 24 saat güvenlik, peyzaj alanları ve aile odaklı yaşam standartlarıyla Ahi Mesut-Elvankent hattının dinamikleri.", "content": "\n<p>Elvankent ve Ahi Mesut, Etimesgut'un planlı site yerleşimlerinin kalbini oluşturur. Geniş yeşil alanları, çocuk parkları, basketbol sahaları ve güvenlikli site yapılarıyla başkentte huzurlu aile yaşamının simgesi haline gelmiştir.</p>\n\n<h3>Geniş 3+1 ve 4+1 Daire Portföyü</h3>\n<p>Bu bölgedeki daireler genellikle brüt 140 m² ile 200 m² arasında geniş metrekarelere sahiptir. Çift banyo, kiler, ebeveyn giyinme odası ve geniş cam balkonlar standart donanım haline gelmiştir.</p>\n\n<h3>Kira Getirisi ve Kiracı Profili</h3>\n<p>Elvankent ve Ahi Mesut'ta kiracı profili ekseriyetle memur, mühendis ve uzun dönemli ailelerden oluşur. Kiraların düzenli ödenmesi ve konutun temiz kullanılması yatırımcılar için büyük bir güvencedir.</p>\n"}, {"id": "blog-15", "title": "Tarla ve Hisseli Arsa Alırken Karşılaşılabilecek Hukuki Riskler", "category": "Tapu & Hukuk", "cat_slug": "hukuk", "date": "19 Ocak 2026", "author": "İlhan Kurt", "read_time": "6 dk okuma", "img": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80", "excerpt": "Şufa (önalım) hakkı davası, fiili taksim sözleşmesi, kadastro sınırları ve hisseli tapularda mağdur olmamak için bilinmesi gerekenler.", "content": "\n<p>Toprak yatırımı kârlıdır ancak 'hisseli arsa' veya 'tarla payı' satın alırken yapılan hukuki hatalar paranızın yıllarca mahkeme koridorlarında kilitlenmesine neden olabilir.</p>\n\n<h3>Şufa (Yasal Önalım) Hakkı Tehlikesi</h3>\n<p>Türk Medeni Kanunu'na göre hisseli bir gayrimenkulde bir hissedar payını dışarıdan birine sattığında, diğer hissedarların aynı fiyattan o payı öncelikle satın alma hakkı vardır. Hissedarlardan noter onaylı feragatname alınmadan yapılan satışlar dava konusu olabilir.</p>\n\n<h3>Fiili Taksim Sözleşmesi Şartı</h3>\n<p>Hisseli arsada hangi hissedarın arsanın hangi köşesini kullanacağı noterden onaylanmış bir 'Fiili Taksim Sözleşmesi' ve kroki ile belirlenmelidir. Aksi takdirde sınır ihtilafları kaçınılmazdır.</p>\n"}, {"id": "blog-16", "title": "Kira Sözleşmesi Hazırlarken Ev Sahibi ve Kiracının Hakları", "category": "Tapu & Hukuk", "cat_slug": "hukuk", "date": "15 Ocak 2026", "author": "Adem Gürsoy", "read_time": "5 dk okuma", "img": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80", "excerpt": "Tahliye taahhütnamesinin hukuki geçerlilik şartları, TÜFE kira artış oranları, depozito kuralları ve şeffaf sözleşme yönetimi.", "content": "\n<p>Kiralama işlemleri hem mülk sahibi hem de kiracı için hassas bir denge gerektirir. Kırtasiyeden alınan matbu sözleşmeler yerine güncel Borçlar Kanunu hükümlerine uygun profesyonel sözleşmeler kullanılmalıdır.</p>\n\n<h3>Tahliye Taahhütnamesinde Tarih Kriteri</h3>\n<p>Yargıtay içtihatlarına göre kira sözleşmesiyle aynı gün imzalanan tahliye taahhütnameleri 'baskı altında alındığı' gerekçesiyle geçersiz sayılabilmektedir. Taahhütnamenin kira başlangıcından makul bir süre sonra imzalanması hukuki güvence sağlar.</p>\n\n<h3>Depozitonun İadesi ve Güvencesi</h3>\n<p>Depozito azami 3 aylık kira bedelini aşamaz ve mevzuata göre vadeli ortak bir banka hesabında tutulmalıdır. Etimesgut Emlak Ofisi olarak her kiralamada demirbaş teslim tutanağını fotoğraflı olarak imza altına alıyoruz.</p>\n"}, {"id": "blog-17", "title": "Etimesgut'ta Kentsel Dönüşüm Süreci ve Müteahhit Seçiminde Güven", "category": "Yatırım & Piyasa", "cat_slug": "yatirim", "date": "10 Ocak 2026", "author": "İlhan Kurt", "read_time": "6 dk okuma", "img": "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80", "excerpt": "Riskli yapı tespiti, kat karşılığı inşaat sözleşmelerinde teknik şartname, teminat mektubu ve hak sahiplerinin korunması.", "content": "\n<p>6306 Sayılı Kentsel Dönüşüm Kanunu kapsamında Etimesgut'un eski mahallelerinde (İstasyon, Alsancak, Piyade) binalar hızla yenilenmektedir. Ancak müteahhit seçimi hayatınızın en önemli kararlarından biridir.</p>\n\n<h3>Müteahhidin Mali ve Teknik Yeterliliği</h3>\n<p>Yalnızca en yüksek daire payını veren değil; Çevre, Şehircilik ve İklim Değişikliği Bakanlığı yapı müteahhitliği yetki belgesi olan, daha önce tamamladığı referans projeleri bulunan ve banka teminat mektubu verebilen güvenilir inşaat firmalarıyla anlaşılmalıdır.</p>\n\n<h3>Kira Yardımı ve Taşınma Desteği</h3>\n<p>Riskli yapı tespiti kesinleştikten sonra hak sahipleri bakanlıktan 18 ila 48 ay arasında değişen kira yardımlarından veya faiz destekli kentsel dönüşüm kredilerinden faydalanabilir.</p>\n"}, {"id": "blog-18", "title": "Dükkan ve Mağaza Yatırımında Tabela Değeri ve Yaya Sirkülasyonu", "category": "Yatırım & Piyasa", "cat_slug": "yatirim", "date": "6 Ocak 2026", "author": "Adem Gürsoy", "read_time": "4 dk okuma", "img": "https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=800&q=80", "excerpt": "Cephe genişliği, baca ve ruhsat uygunluğu, otopark imkanı ve cadde yaya yoğunluğunun ticari kira çarpanına doğrudan etkisi.", "content": "\n<p>Bir dükkanın değerini m²'sinden çok 'cephe genişliği' ve 'tabela görünürlüğü' belirler. Caddeye 12 metre cephesi olan 100 m² bir dükkan, cephesi dar 200 m² bir dükkandan her zaman daha değerlidir.</p>\n\n<h3>Baca ve İskan Şartı: Gıda Sektörü İçin Hayati</h3>\n<p>Restoran, kafe veya fırın gibi yüksek kira ödeyen gıda işletmeleri için binanın çatısına kadar uzanan bağımsız havalandırma bacasının bulunması yasal zorunluluktur. Bacası ve iskanı olmayan dükkanlara belediye iş yeri açma ruhsatı vermez.</p>\n"}, {"id": "blog-19", "title": "Gayrimenkul Alım Satımında Tapu Harçları ve Vergi Yükümlülükleri", "category": "Tapu & Hukuk", "cat_slug": "hukuk", "date": "2 Ocak 2026", "author": "İlhan Kurt", "read_time": "5 dk okuma", "img": "tapu_kredi_takip.jpg", "excerpt": "%4 tapu harcı paylaşımı, değer artış kazancı vergisi muafiyetleri (5 yıl kuralı) ve döner sermaye bedellerinin güncel hesaplaması.", "content": "\n<p>Tapu masrafları satış sürecinde en çok kafa karıştıran mali yükümlülüktür. Harçlar ve vergiler konusunda bilinmesi gereken temel prensipler:</p>\n\n<h3>Tapu Harcı Oranı: %4</h3>\n<p>Kanunen gayrimenkulün beyan edilen satış bedeli üzerinden %2 alıcıdan, %2 satıcıdan olmak üzere toplam %4 tapu harcı tahsil edilir. Taraflar anlaşarak harcın tamamının alıcı tarafından ödenmesini de kararlaştırabilir.</p>\n\n<h3>5 Yıl Kuralı ve Değer Artış Kazancı Vergisi</h3>\n<p>Gerçek kişilerin edindikleri konutu satın aldıkları tarihten itibaren 5 tam yıl geçtikten sonra satmaları halinde elde edilen kâr Gelir Vergisi'nden tamamen muaftır. 5 yıl dolmadan satılırsa alış-satış arasındaki fark üzerinden değer artış kazancı vergisi doğar.</p>\n"}, {"id": "blog-20", "title": "İlhan Kurt & Adem Gürsoy'dan Etimesgut Gayrimenkul Piyasası Değerlendirmesi", "category": "Yatırım & Piyasa", "cat_slug": "yatirim", "date": "1 Ocak 2026", "author": "İlhan Kurt & Adem Gürsoy", "read_time": "5 dk okuma", "img": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", "excerpt": "15 yıllık saha tecrübemiz, dürüst esnaflık ilkelerimiz ve Ankara Etimesgut'ta alırken kazandıran portföy yönetimi vizyonumuz.", "content": "\n<p>Etimesgut Emlak Ofisi olarak yıllardır benimsediğimiz temel ilke: 'Kendimizin içine sinmeyen, kendi ailemize almayacağımız hiçbir mülkü müşterimize tavsiye etmemektir.' Müşterilerimizin Google yorumlarında bize atfettiği o eski dürüst esnaflık güveni, bizim en büyük sermayemizdir.</p>\n\n<h3>Etimesgut'un Önümüzdeki 5 Yılı</h3>\n<p>Bağlıca'daki gelişim, Başkentray ve metro hatlarının entegrasyonu, Ay Yıldız yerleşkesinin tamamlanması ve batı aksındaki arsa projeleriyle Etimesgut, başkent Ankara'nın en güvenli yatırım limanı olmaya devam edecektir.</p>\n\n<h3>Ofisimize Bir Kahveye Bekleriz</h3>\n<p>İster mülkünüzü değerinde satmak isteyin, ister aileniz için doğru evi arayın; İstasyon Mahallesi Güzelyurt Sokak No: 6/A adresindeki ofisimizde her zaman bir sıcak kahvemiz ve dostane danışmanlığımız sizi bekliyor.</p>\n"}];

function initBlog() {
  const filterBtns = document.querySelectorAll('#blog-category-filters button');
  const cards = document.querySelectorAll('.blog-card');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-blog-filter');
      cards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

window.openBlogModal = function(postId) {
  const post = window.blogPostsData.find(p => p.id === postId);
  if (!post) return;
  
  const modal = document.getElementById('blog-reader-modal');
  if (!modal) return;
  
  document.getElementById('bmodal-cat').innerText = post.category;
  document.getElementById('bmodal-title').innerText = post.title;
  document.getElementById('bmodal-author').innerText = '👤 ' + post.author;
  document.getElementById('bmodal-date').innerText = '📅 ' + post.date;
  document.getElementById('bmodal-readtime').innerText = '⏱ ' + post.read_time;
  document.getElementById('bmodal-img').src = post.img;
  document.getElementById('bmodal-img').alt = post.title;
  document.getElementById('bmodal-body').innerHTML = post.content;
  
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeBlogModal = function() {
  const modal = document.getElementById('blog-reader-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};
