document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initRouter();
  initBurgerMenu();
  initScrollHeader();
  initStatsObserver();
  initProjectFilters();
  initValuationWizard();
  initContactForm();
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

// 2. CLIENT-SIDE ROUTER (SPA)
function initRouter() {
  const navLinks = document.querySelectorAll('.logo, .nav-links a, .footer-col ul a, .hero-cta a, a[data-target]');
  const pages = document.querySelectorAll('.page-view');
  
  showPage('home');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('data-target');
      if (targetId) {
        e.preventDefault();
        showPage(targetId);
        
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
  });
  
  function showPage(pageId) {
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

// 7. REAL ESTATE VALUATION WIZARD
function initValuationWizard() {
  const wizard = document.getElementById('valuation-wizard-form');
  if (!wizard) return;
  
  const panes = wizard.querySelectorAll('.wizard-pane');
  const nodes = document.querySelectorAll('.wizard-step-node');
  const stepLine = document.querySelector('.wizard-step-line');
  const nextBtn = wizard.querySelector('.btn-next');
  const prevBtn = wizard.querySelector('.btn-prev');
  
  // Property type selector cards in Step 0
  const typePills = wizard.querySelectorAll('.val-pill-card');
  const typeInput = document.getElementById('val-property-type');
  
  typePills.forEach(pill => {
    pill.addEventListener('click', () => {
      typePills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      if (typeInput) {
        typeInput.value = pill.getAttribute('data-type');
      }
    });
  });
  
  let currentStep = 0;
  updateWizard();
  
  nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      if (currentStep < panes.length - 1) {
        currentStep++;
        updateWizard();
      } else {
        submitValuation();
      }
    }
  });
  
  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      updateWizard();
    }
  });
  
  function updateWizard() {
    panes.forEach((pane, idx) => {
      if (idx === currentStep) {
        pane.classList.add('active');
        pane.style.display = 'block';
      } else {
        pane.classList.remove('active');
        pane.style.display = 'none';
      }
    });
    
    nodes.forEach((node, idx) => {
      if (idx < currentStep) {
        node.className = 'wizard-step-node completed';
        node.innerHTML = '✓';
      } else if (idx === currentStep) {
        node.className = 'wizard-step-node active';
        node.innerHTML = idx + 1;
      } else {
        node.className = 'wizard-step-node';
        node.innerHTML = idx + 1;
      }
    });
    
    const percentage = (currentStep / (panes.length - 1)) * 100;
    if (stepLine) stepLine.style.width = percentage + '%';
    
    if (currentStep === 0) {
      prevBtn.style.visibility = 'hidden';
    } else {
      prevBtn.style.visibility = 'visible';
    }
    
    if (currentStep === panes.length - 1) {
      nextBtn.innerText = currentLang === 'tr' ? 'Değerleme Talebini Tamamla' : 'Submit Valuation Request';
    } else {
      nextBtn.innerText = currentLang === 'tr' ? 'İleri' : 'Next';
    }
  }
  
  function validateStep(stepIdx) {
    const activePane = panes[stepIdx];
    const inputs = activePane.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
        input.style.borderColor = '#ef4444';
        input.addEventListener('input', () => {
          input.style.borderColor = 'var(--glass-border)';
        }, { once: true });
      }
    });
    
    if (!isValid) {
      alert(currentLang === 'tr' ? 'Lütfen tüm zorunlu alanları doldurunuz.' : 'Please fill in all required fields.');
    }
    
    return isValid;
  }
  
  function submitValuation() {
    const intent = document.getElementById('val-intent')?.value || 'Belirtilmedi';
    const propType = document.getElementById('val-property-type')?.value || 'Daire';
    const neighborhood = document.getElementById('val-neighborhood')?.value || 'Etimesgut';
    const rooms = document.getElementById('val-rooms')?.value || '';
    const area = document.getElementById('val-area')?.value || '';
    const floor = document.getElementById('val-floor')?.value || '';
    const age = document.getElementById('val-age')?.value || '';
    const priceExp = document.getElementById('val-price-expectation')?.value || 'Belirtilmedi';
    const deed = document.getElementById('val-deed-status')?.value || '';
    const notes = document.getElementById('val-notes')?.value || '';
    const name = document.getElementById('val-name')?.value || 'Müşteri';
    const phone = document.getElementById('val-phone')?.value || '';
    const channel = document.getElementById('val-channel')?.value || 'WhatsApp';
    
    const waText = encodeURIComponent(
      `*ETİMESGUT EMLAK OFİSİ - DEĞERLEME TALEBİ*\n` +
      `--------------------------------\n` +
      `👤 *Müşteri:* ${name}\n` +
      `📞 *Telefon:* ${phone}\n` +
      `🎯 *İşlem:* ${intent}\n` +
      `🏠 *Mülk Tipi:* ${propType}\n` +
      `📍 *Konum:* ${neighborhood}\n` +
      `🛏 *Oda / m²:* ${rooms} - ${area} m²\n` +
      `🏢 *Kat / Bina Yaşı:* ${floor} / ${age}\n` +
      `💰 *Fiyat Beklentisi:* ${priceExp}\n` +
      `📜 *Tapu Durumu:* ${deed}\n` +
      `📝 *Notlar:* ${notes}\n` +
      `📲 *İletişim Tercihi:* ${channel}`
    );
    
    const waUrl = `https://wa.me/905418510600?text=${waText}`;
    
    const container = document.querySelector('.wizard-container');
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1.5rem;" class="fade-in-section">
        <div style="font-size: 4rem; color: #25D366; margin-bottom: 1.5rem;">✓</div>
        <h3 style="font-size: 1.8rem; text-transform: uppercase; margin-bottom: 1rem; color: var(--text-primary);">
          ${currentLang === 'tr' ? 'Değerleme Talebiniz Hazırlandı' : 'Valuation Request Prepared'}
        </h3>
        <p style="color: var(--text-secondary); max-width: 540px; margin: 0 auto 2rem auto; line-height: 1.6;">
          ${currentLang === 'tr'
            ? `Sayın <strong>${name}</strong>, bilgileriniz kaydedildi. İlhan Kurt ve Adem Gürsoy'a bilgilerinizi doğrudan WhatsApp üzerinden ileterek anında ön ekspertiz alabilirsiniz:`
            : `Dear <strong>${name}</strong>, your details are registered. You can directly send them via WhatsApp for instant pre-valuation:`}
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="${waUrl}" target="_blank" class="btn-broker-wa" style="padding: 0.85rem 1.75rem; font-size: 1rem; border-radius: 4px;">
            <span>💬</span> ${currentLang === 'tr' ? "WhatsApp'tan Hemen Gönder" : 'Send via WhatsApp'}
          </a>
          <button class="btn btn-secondary" onclick="location.reload()">${currentLang === 'tr' ? 'Yeni Talep Oluştur' : 'Create New Request'}</button>
        </div>
      </div>
    `;
  }
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
    "nav-valuation": "Ücretsiz Değerleme",
    "nav-contact": "İletişim",
    
    "hero-sub": "Etimesgut & Çevresi Gayrimenkul ve Yatırım Danışmanlığı",
    "hero-title-1": "Güvenilir, Şeffaf ve",
    "hero-title-2": "Doğru Yatırımın Adresi",
    "hero-desc": "İlhan Kurt ve Adem Gürsoy güvencesiyle; Etimesgut, Bağlıca, Eryaman ve tüm Ankara aksında satılık ve kiralık konut, ticari mülk ve yatırımlık arsalarda dürüst esnaflık ve profesyonel danışmanlık.",
    "hero-btn-1": "Portföyümüzü İnceleyin",
    "hero-btn-2": "Ücretsiz Değerleme Alın",
    
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
    "nav-valuation": "Free Valuation",
    "nav-contact": "Contact",
    
    "hero-sub": "Etimesgut & Ankara Real Estate and Investment Advisory",
    "hero-title-1": "Trusted, Transparent and",
    "hero-title-2": "The Right Investment Address",
    "hero-desc": "Under the assurance of İlhan Kurt and Adem Gürsoy; providing honest, reliable and professional real estate solutions for residential, commercial and land investments in Etimesgut, Baglica, and Eryaman.",
    "hero-btn-1": "Explore Our Portfolio",
    "hero-btn-2": "Get Free Valuation",
    
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
