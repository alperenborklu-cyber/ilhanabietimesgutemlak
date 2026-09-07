document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initRouter();
  initBurgerMenu();
  initScrollHeader();
  initStatsObserver();
  initProjectFilters();
  initCareerWizard();
  initContactForm();
  initModals();
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
    width += Math.floor(Math.random() * 8) + 2;
    if (width >= 100) {
      width = 100;
      clearInterval(interval);
      
      setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        document.body.classList.add('loaded');
      }, 500);
    }
    
    if (bar) bar.style.width = width + '%';
    if (counter) counter.innerText = width + '%';
  }, 40);
}

// 2. CLIENT-SIDE ROUTER (SPA)
function initRouter() {
  const navLinks = document.querySelectorAll('.logo, .nav-links a, .footer-col ul a, .hero-cta .btn');
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
        if (navList.classList.contains('nav-active')) {
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
    }, 50);
    
    document.querySelectorAll('.nav-links a').forEach(a => {
      if (a.getAttribute('data-target') === pageId) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
    
    if (pageId === 'home') {
      resetStats();
    }
  }
}

// 3. BURGER MENU FOR MOBILE
function initBurgerMenu() {
  const burger = document.querySelector('.burger');
  const navList = document.querySelector('.nav-links');
  
  if (!burger) return;
  
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
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
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
    let current = 0;
    const duration = 2000;
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

// 6. PROJECT GRID FILTERS
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');
      
      projectCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const status = card.getAttribute('data-status');
        
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
          if (filterValue === 'all' || cat === filterValue || status === filterValue) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 50);
          } else {
            card.style.display = 'none';
          }
        }, 300);
      });
    });
  });
}

// 7. CAREER MULTI-STEP WIZARD
function initCareerWizard() {
  const wizard = document.getElementById('career-wizard-form');
  if (!wizard) return;
  
  const panes = wizard.querySelectorAll('.wizard-pane');
  const nodes = wizard.querySelectorAll('.wizard-step-node');
  const stepLine = wizard.querySelector('.wizard-step-line');
  const nextBtn = wizard.querySelector('.btn-next');
  const prevBtn = wizard.querySelector('.btn-prev');
  
  let currentStep = 0;
  updateWizard();
  
  nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      if (currentStep < panes.length - 1) {
        currentStep++;
        updateWizard();
      } else {
        submitCareerApplication();
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
      if (pane.classList) {
        if (idx === currentStep) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
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
      nextBtn.innerText = currentLang === 'tr' ? 'Başvuruyu Tamamla' : 'Submit Application';
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
        input.style.borderColor = 'red';
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
  
  function submitCareerApplication() {
    const container = document.querySelector('.wizard-container');
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem;" class="fade-in-section">
        <div style="font-size: 4rem; color: var(--accent-gold); margin-bottom: 1.5rem;">✓</div>
        <h3 style="font-size: 2rem; text-transform: uppercase; margin-bottom: 1rem;">
          ${currentLang === 'tr' ? 'Başvurunuz Alındı' : 'Application Received'}
        </h3>
        <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 2rem auto;">
          ${currentLang === 'tr' 
            ? 'Zeugma Holding İnsan Kaynakları ekibi olarak başvurunuzu aldık. En kısa sürede sizinle iletişime geçilecektir.' 
            : 'As Zeugma Holding Human Resources team, we have received your application. We will contact you as soon as possible.'}
        </p>
        <button class="btn btn-primary" onclick="location.reload()">${currentLang === 'tr' ? 'Geri Dön' : 'Back'}</button>
      </div>
    `;
  }
}

// 8. CONTACT FORM & OFFICE SWITCHER
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const msg = document.getElementById('contact-msg').value;
      
      if (name && email && msg) {
        if (currentLang === 'tr') {
          alert(`Sayın ${name}, mesajınız başarıyla iletilmiştir. En kısa sürede dönüş sağlanacaktır.`);
        } else {
          alert(`Dear ${name}, your message has been sent successfully. We will get back to you shortly.`);
        }
        contactForm.reset();
      }
    });
  }
  
  const officeTabs = document.querySelectorAll('.office-tab');
  const detailsTitle = document.getElementById('office-details-title');
  const detailsPhone = document.getElementById('office-details-phone');
  const detailsAddr = document.getElementById('office-details-addr');
  const detailsEmail = document.getElementById('office-details-email');
  
  if (officeTabs.length && detailsTitle) {
    const officeData = {
      istanbul: {
        tr: {
          title: 'İstanbul Merkez Ofis (HQ)',
          addr: 'Büyükdere Caddesi, No: 193, Kule 2, Levent, İstanbul'
        },
        en: {
          title: 'Istanbul Head Office (HQ)',
          addr: 'Buyukdere Street, No: 193, Tower 2, Levent, Istanbul'
        },
        phone: '+90 (212) 800 45 00',
        email: 'istanbul@zeugmaholding.com.tr'
      },
      ankara: {
        tr: {
          title: 'Ankara Temsilciliği',
          addr: 'Dumlupınar Bulvarı, No: 9, Çankaya, Ankara'
        },
        en: {
          title: 'Ankara Representative Office',
          addr: 'Dumlupinar Boulevard, No: 9, Cankaya, Ankara'
        },
        phone: '+90 (312) 550 12 00',
        email: 'ankara@zeugmaholding.com.tr'
      },
      baku: {
        tr: {
          title: 'Bakü Operasyon Ofisi',
          addr: 'Nizami Caddesi, Bakü LandMark Binası, Bakü, Azerbaycan'
        },
        en: {
          title: 'Baku Operations Office',
          addr: 'Nizami Street, Baku Landmark Building, Baku, Azerbaijan'
        },
        phone: '+994 (12) 490 88 00',
        email: 'baku@zeugmaholding.com.tr'
      }
    };
    
    officeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        officeTabs.forEach(t => t.style.borderColor = 'var(--glass-border)');
        tab.style.borderColor = 'var(--accent-gold)';
        
        const loc = tab.getAttribute('data-office');
        const data = officeData[loc];
        if (data) {
          detailsTitle.innerText = data[currentLang].title;
          detailsPhone.innerText = data.phone;
          detailsAddr.innerText = data[currentLang].addr;
          detailsEmail.innerText = data.email;
        }
      });
    });
  }
}

// 9. DYNAMIC MODALS
const projectData = {
  p1: {
    tr: {
      title: 'Avrasya Mega Tüneli',
      category: 'ULAŞIM & ALTYAPI',
      status: 'Tamamlandı',
      duration: '36 Ay',
      location: 'İstanbul, Türkiye',
      client: 'Ulaştırma Bakanlığı',
      desc: 'Boğazın altından geçen, iki kıtayı birbirine bağlayan çift katlı karayolu tüneli projesi. İleri teknoloji tünel açma makineleri (TBM) kullanılarak sismik dayanıklılık öncelikli inşa edilmiştir.'
    },
    en: {
      title: 'Eurasia Mega Tunnel',
      category: 'TRANSPORTATION & INFRASTRUCTURE',
      status: 'Completed',
      duration: '36 Months',
      location: 'Istanbul, Turkey',
      client: 'Ministry of Transport',
      desc: 'Double-deck highway tunnel crossing beneath the Bosphorus Strait to connect Europe and Asia, designed with high seismic resilience using advanced TBM technology.'
    },
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
  },
  p2: {
    tr: {
      title: 'Gordion Rüzgar Enerjisi Santrali',
      category: 'ENDÜSTRİ & ENERJİ',
      status: 'Tamamlandı',
      duration: '24 Ay',
      location: 'İzmir, Türkiye',
      client: 'Enerji Piyasası Düzenleme Kurumu',
      desc: '120 MW kurulu güce sahip, 80 türbinli dev yenilenebilir enerji yatırımı.'
    },
    en: {
      title: 'Gordion Wind Power Plant',
      category: 'INDUSTRY & ENERGY',
      status: 'Completed',
      duration: '24 Months',
      location: 'Izmir, Turkey',
      client: 'Energy Market Regulatory Authority',
      desc: 'A massive 120 MW green energy investment comprising 80 wind turbines.'
    },
    img: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80'
  },
  p3: {
    tr: {
      title: 'Ege Port Liman Genişletmesi',
      category: 'ULAŞIM & ALTYAPI',
      status: 'Devam Ediyor',
      duration: '48 Ay (Tahmini)',
      location: 'İzmir, Türkiye',
      client: 'Zeugma Liman Yatırımları A.Ş.',
      desc: 'Lojistik kapasiteyi üç katına çıkaracak derin deniz rıhtımları ve dolgu sahası inşaatı.'
    },
    en: {
      title: 'Ege Port Terminal Expansion',
      category: 'TRANSPORTATION & INFRASTRUCTURE',
      status: 'Ongoing',
      duration: '48 Months (Est.)',
      location: 'Izmir, Turkey',
      client: 'Zeugma Port Investments Inc.',
      desc: 'Construction of deep-water berths and land reclamation expanding container logistics capacity by 3x.'
    },
    img: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80'
  },
  p4: {
    tr: {
      title: 'Alara Eko-Kule Konutları',
      category: 'GAYRİMENKUL & ÜSTYAPI',
      status: 'Devam Ediyor',
      duration: '30 Ay (Tahmini)',
      location: 'İstanbul, Türkiye',
      client: 'Özel Sektör Konsorsiyumu',
      desc: 'LEED Platin yeşil bina sertifikası adayı olan, kendi enerjisini üretebilen ve yağmur suyu geri dönüşüm sistemlerine sahip 42 katlı lüks rezidans kulesi.'
    },
    en: {
      title: 'Alara Eco-Tower Residences',
      category: 'REAL ESTATE & BUILDINGS',
      status: 'Ongoing',
      duration: '30 Months (Est.)',
      location: 'Istanbul, Turkey',
      client: 'Private Sector Consortium',
      desc: 'A LEED Platinum-certified, self-powered 42-story smart residential tower incorporating rainwater harvesting systems.'
    },
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
  },
  p5: {
    tr: {
      title: 'Anadolu Yeşil Çimento Fabrikası',
      category: 'ENDÜSTRİ & ENERJİ',
      status: 'Tamamlandı',
      duration: '18 Ay',
      location: 'Kayseri, Türkiye',
      client: 'Zeugma Çimento Grubu',
      desc: 'Düşük karbonlu, yüksek mukavemetli sürdürülebilir çimento üretimi gerçekleştiren, bacalarındaki atık ısıyı elektrik enerjisine dönüştüren entegre tesis.'
    },
    en: {
      title: 'Anadolu Green Cement Factory',
      category: 'INDUSTRY & ENERGY',
      status: 'Completed',
      duration: '18 Months',
      location: 'Kayseri, Turkey',
      client: 'Zeugma Cement Group',
      desc: 'An eco-friendly integrated facility producing low-carbon cement by generating electricity from waste heat.'
    },
    img: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80'
  },
  p6: {
    tr: {
      title: 'Çukurova Şehir Hastanesi',
      category: 'GAYRİMENKUL & ÜSTYAPI',
      status: 'Tamamlandı',
      duration: '40 Ay',
      location: 'Adana, Türkiye',
      client: 'Sağlık Bakanlığı (KÖİ Modeli)',
      desc: '1.200 sismik izolatörle donatılmış, 1.500 yatak kapasiteli, bölgenin en gelişmiş sağlık kompleksi ve üniversite hastanesi projesi.'
    },
    en: {
      title: 'Çukurova City Hospital',
      category: 'REAL ESTATE & BUILDINGS',
      status: 'Completed',
      duration: '40 Months',
      location: 'Adana, Turkey',
      client: 'Ministry of Health (PPP Model)',
      desc: 'A 1,500-bed state-of-the-art medical complex equipped with advanced seismic base isolators.'
    },
    img: 'https://images.unsplash.com/photo-1587301620398-159cf43abbad?auto=format&fit=crop&w=800&q=80'
  }
};

function initModals() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  
  const closeBtn = modal.querySelector('.modal-close');
  const overlay = modal.querySelector('.modal-overlay');
  
  const mTitle = document.getElementById('modal-project-title');
  const mCat = document.getElementById('modal-project-cat');
  const mDesc = document.getElementById('modal-project-desc');
  const mStatus = document.getElementById('modal-meta-status');
  const mDuration = document.getElementById('modal-meta-duration');
  const mLocation = document.getElementById('modal-meta-location');
  const mClient = document.getElementById('modal-meta-client');
  const mImg = document.getElementById('modal-project-img');
  
  const projectCards = document.querySelectorAll('.project-card[data-id]');
  
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const pid = card.getAttribute('data-id');
      const data = projectData[pid];
      
      if (data) {
        const langData = data[currentLang] || data['tr'];
        mTitle.innerText = langData.title;
        mCat.innerText = langData.category;
        mDesc.innerText = langData.desc;
        mStatus.innerText = langData.status;
        mDuration.innerText = langData.duration;
        mLocation.innerText = langData.location;
        mClient.innerText = langData.client;
        mImg.src = data.img;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
  
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// 10. LANGUAGE TRANSLATION (i18n)
const translations = {
  tr: {
    // Nav & General
    "nav-corporate": "Kurumsal",
    "nav-sectors": "Faaliyet Alanları",
    "nav-projects": "Projeler",
    "nav-career": "Kariyer",
    "nav-contact": "İletişim",
    
    // Home Page
    "hero-sub": "Küresel Altyapı ve Mühendislik Grubu",
    "hero-title-1": "Sınırları Aşan",
    "hero-title-2": "Büyük Projeler",
    "hero-desc": "Ulaştırma, yenilenebilir enerji, mega altyapı ve sürdürülebilir üstyapı çözümleriyle dünya standartlarında mühendislik üretiyoruz.",
    "hero-btn-1": "Projelerimizi İnceleyin",
    "hero-btn-2": "Biz Kimiz?",
    
    "stat-employees-lbl": "Çalışan Sayısı",
    "stat-countries-lbl": "Aktif Ülke",
    "stat-ciro-lbl": "Yıllık Ciro",
    "stat-enr-lbl": "ENR Dünya Sıralaması",
    
    "sectors-sub": "Uzmanlık Alanlarımız",
    "sectors-title": "Faaliyet Sektörleri",
    "sectors-btn": "Tüm Sektörler",
    
    "sec1-title": "Ulaşım & Altyapı",
    "sec1-desc": "Otoyollar, viyadükler, raylı sistemler, havalimanları ve derin deniz limanlarıyla küresel ulaşım ağları inşa ediyoruz.",
    "sec2-title": "Endüstri & Enerji",
    "sec2-desc": "Rüzgar, hidroelektrik, jeotermal tesisler ve modern endüstriyel üretim kompleksleriyle sürdürülebilir geleceği besliyoruz.",
    "sec3-title": "Gayrimenkul & Üstyapı",
    "sec3-desc": "Akıllı şehir hastaneleri, yeşil bina sertifikalı konutlar ve yüksek teknolojili ticari merkezler geliştiriyoruz.",
    
    "proj-sub": "Mühendislik Harikalarımız",
    "proj-title": "Öne Çıkan Projeler",
    "proj-btn": "Tümünü İncele",
    
    "p1-title": "Avrasya Mega Tüneli",
    "p1-desc": "İki kıtayı deniz altından birleştiren, depreme dayanıklı çift katlı mega tünel geçişi.",
    "p2-title": "Gordion Rüzgar Enerjisi Santrali",
    "p2-desc": "120 MW kurulu güce sahip, 80 türbinli dev yenilenebilir enerji yatırımı.",
    "p3-title": "Ege Port Liman Genişletmesi",
    "p3-desc": "Lojistik kapasiteyi 3 katına çıkaracak derin deniz rıhtımları ve dolgu sahası yapımı.",
    "p4-title": "Alara Eko-Kule Konutları",
    "p4-desc": "LEED Platin sertifikalı, kendi enerjisini üreten 42 katlı akıllı rezidans kulesi.",
    "p5-title": "Anadolu Yeşil Çimento Fabrikası",
    "p5-desc": "Atık ısıyı elektriğe dönüştüren, düşük karbonlu çimento üreten entegre ekolojik tesis.",
    "p6-title": "Çukurova Şehir Hastanesi",
    "p6-desc": "Sismik izolatörlü ve modern teknolojik donanımlı 1.500 yatak kapasiteli sağlık kompleksi.",
    
    // Corporate Page
    "corp-sub": "Köklü Geçmiş, Güçlü Gelecek",
    "corp-title": "Kurumsal Profilimiz",
    "corp-p1": "Zeugma Holding, 1982 yılında başladığı mühendislik yolculuğunda bugün 18 ülkede faaliyet gösteren, ENR dünyanın en büyük müteahhitleri listesinde 38. sırada yer alan küresel bir güçtür.",
    "corp-p2": "İsmini iki medeniyeti birbirine bağlayan tarihi antik kentten alan grubumuz, tıpkı ismi gibi kıtaları, toplumları ve gelecek hayallerini sağlam köprülerle birbirine bağlamayı ilke edinmiştir. Çevreye saygı, iş güvenliği ve sürdürülebilirlik ilkelerimiz doğrultusunda, yarının medeniyetlerini inşa ediyoruz.",
    "corp-year-lbl": "Kuruluş Yılı",
    "corp-proj-lbl": "Tamamlanan Proje",
    
    "board-sub": "Yönetim Kadromuz",
    "board-title": "Yönetim Kurulu",
    
    "dir1-role": "Kurucu & Yönetim Kurulu Başkanı",
    "dir1-name": "Ahmet Zeugma",
    "dir1-desc": "İnşaat yüksek mühendisi olan kurucumuz, 40 yılı aşkın süredir gruba vizyoner liderlik yapmaktadır.",
    
    "dir2-role": "Yönetim Kurulu Başkan Vekili",
    "dir2-name": "Elif Zeugma Kaya",
    "dir2-desc": "Yatırım ve uluslararası finans yönetiminden sorumlu başkan vekilimiz, holdingin küresel genişlemesini yönetmektedir.",
    
    "dir3-role": "Yönetim Kurulu Üyesi & CEO",
    "dir3-name": "Dr. Can Demir",
    "dir3-desc": "Enerji ve altyapı sektörlerinde 25 yıllık operasyon tecrübesine sahip CEO'muz, holdingin günlük yönetiminden sorumludur.",
    
    "time-sub": "Tarihe Kazınan Anlar",
    "time-title": "Başarı Kilometre Taşlarımız",
    "time-item-1-title": "İlk Temeller",
    "time-item-1-desc": "Zeugma İnşaat Ltd. Şti. Ankara'da kuruldu ve ilk altyapı ve kanalizasyon taahhüt projelerine başladı.",
    "time-item-2-title": "Endüstriyel Hamle",
    "time-item-2-desc": "Holding, ilk baraj ve enerji santrali projesini başarıyla tamamlayarak enerji taahhüt sektörüne girdi.",
    "time-item-3-title": "Uluslararası Açılım",
    "time-item-3-desc": "Orta Doğu ve Doğu Avrupa'da eş zamanlı havalimanı ve karayolu projeleri üstlenilerek küresel marka olma adımı atıldı.",
    "time-item-4-title": "Sürdürülebilir Enerji Liderliği",
    "time-item-4-desc": "Yenilenebilir enerji kurulu gücümüz 500 MW seviyesine ulaştı ve karbon-nötr yeşil şantiyeler konsepti hayata geçirildi.",
    "time-item-5-title": "ENR #38",
    "time-item-5-desc": "Uluslararası müteahhitler listesinde 38. sıraya yükselen holdingimiz, 18 ülkede 45.000 çalışanla geleceği inşa etmeye devam ediyor.",
    
    // Sectors Page
    "sectors-page-sub": "Operasyonel Çeşitlilik",
    "sectors-page-title": "Faaliyet Alanlarımız",
    
    "sectors-sec1-lbl": "Ulaşım & Altyapı",
    "sectors-sec1-p": "Zeugma Holding, ulaştırma altyapısı konusunda dünya çapında uzmanlaşmıştır. Şehirleri birbirine bağlayan tüneller, kıtaları aşan köprüler, yüksek hızlı demiryolu ağları ve en modern terminal tasarımlarına sahip havalimanı projeleri imza işlerimiz arasındadır.",
    "sectors-sec1-item-1": "✓ Yüksek Hızlı Tren & Metro Hatları",
    "sectors-sec1-item-2": "✓ Mega Tünel ve Köprü Geçişleri",
    "sectors-sec1-item-3": "✓ Havalimanı Terminal Kompleksleri",
    "sectors-sec1-item-4": "✓ Derin Deniz Konteyner Limanları",
    
    "sectors-sec2-lbl": "Endüstri & Enerji",
    "sectors-sec2-p": "Enerji arzının güvenliğini yenilenebilir ve temiz kaynaklardan sağlamayı taahhüt ediyoruz. Rüzgar, hidroelektrik, güneş ve biyokütle enerjisi santrallerinin yanı sıra, petrokimya tesisleri, çimento fabrikaları ve entegre sanayi tesisleri mühendisliğinde öncüyüz.",
    "sectors-sec2-item-1": "✓ Rüzgar & Güneş Santralleri (GES/RES)",
    "sectors-sec2-item-2": "✓ Hidroelektrik Barajlar (HES)",
    "sectors-sec2-item-3": "✓ Atık Isı Geri Kazanım Sistemleri",
    "sectors-sec2-item-4": "✓ Petrokimya & Rafineri Tesisleri",
    
    "sectors-sec3-lbl": "Gayrimenkul & Üstyapı",
    "sectors-sec3-p": "Toplumların yaşam kalitesini artıracak akıllı yapılar tasarlıyoruz. Kamu-Özel İş Birliği (KÖİ) modelleriyle inşa edilen tam teşekküllü şehir hastaneleri, lüks yaşam rezidansları, beş yıldızlı turizm otelleri ve iş dünyasının kalbi olan ofis kuleleri bu alandaki odak noktalarımızdır.",
    "sectors-sec3-item-1": "✓ Entegre Sağlık Kampüsleri (Şehir Hastaneleri)",
    "sectors-sec3-item-2": "✓ LEED Sertifikalı Akıllı Rezidanslar",
    "sectors-sec3-item-3": "✓ Lüks Otel ve Kongre Merkezleri",
    "sectors-sec3-item-4": "✓ Ticari İş & Alışveriş Merkezleri",
    
    // Projects Page
    "projects-page-sub": "Üstün Mühendislik Portföyümüz",
    "projects-page-title": "Projelerimiz",
    "filter-all": "Tümü",
    "filter-transport": "Ulaşım & Altyapı",
    "filter-energy": "Endüstri & Enerji",
    "filter-building": "Gayrimenkul & Üstyapı",
    "filter-completed": "Tamamlananlar",
    "filter-ongoing": "Devam Edenler",
    
    // Career Page
    "career-page-sub": "Ekibimizin Bir Parçası Olun",
    "career-page-title": "Kariyer Fırsatları",
    "career-p": "Zeugma Holding, çalışanlarına küresel düzeyde büyük projelerde yer alma, kariyer basamaklarını hızla tırmanma ve mesleki uzmanlıklarını dünya standartlarında geliştirme fırsatı sunmaktadır.",
    "wizard-title": "İş Başvuru Sihirbazı",
    "wizard-step1-title": "Kişisel Bilgiler",
    "wizard-step2-title": "Pozisyon ve Deneyim",
    "wizard-step3-title": "CV ve Belgeler",
    
    "lbl-name": "Ad Soyad *",
    "lbl-email": "E-posta Adresi *",
    "lbl-phone": "Telefon Numarası *",
    "lbl-position": "Başvurulan Alan / Departman *",
    "lbl-experience": "Deneyim Süresi *",
    "lbl-letter": "Önyazı / Kendinizi Kısaca Tanıtın *",
    "lbl-cv": "Özgeçmişinizi Yükleyin",
    "lbl-cv-formats": "PDF, DOCX formatları desteklenmektedir (Maks. 5MB)",
    "lbl-kvkk": "KVKK kapsamında kişisel verilerimin, iş başvurumun değerlendirilmesi amacıyla işlenmesini ve saklanmasını onaylıyorum. *",
    "btn-prev": "Geri",
    "btn-next": "İleri",
    
    // Contact Page
    "contact-page-sub": "Bize Ulaşın",
    "contact-page-title": "İletişim",
    "contact-panel-h": "Bize Yazın ya da Ziyaret Edin",
    "contact-panel-p": "Projelerimiz, yatırımlarımız veya tedarik süreçlerimiz hakkında detaylı bilgi almak için bizimle iletişime geçebilirsiniz.",
    "contact-form-h": "Bize Mesaj Gönderin",
    "contact-form-subject-lbl": "Konu *",
    "contact-form-msg-lbl": "Mesajınız *",
    "contact-form-btn": "Gönder",
    
    // Office Labels
    "office-phone": "Telefon",
    "office-address": "Adres",
    "office-email": "E-posta",
    "office-map-btn": "HARİTAYI GÖSTER (MOCK)",
    
    // Footer & Meta labels
    "footer-text": "Zeugma Holding, ulaştırma altyapısı, endüstri tesisleri ve yenilenebilir enerji alanındaki uzmanlığıyla sürdürülebilir bir gelecek inşa eden küresel mühendislik ortağıdır.",
    "footer-links-title-1": "Hızlı Linkler",
    "footer-links-title-2": "Kurumsal",
    "footer-links-title-3": "İletişim",
    "footer-bottom-text": "© 2026 Zeugma Holding A.Ş. Tüm hakları saklıdır.",
    "footer-link-usage": "Kullanım Koşulları",
    "footer-link-privacy": "Gizlilik Politikası",
    
    "modal-lbl-status": "Durum:",
    "modal-lbl-duration": "Süre:",
    "modal-lbl-location": "Lokasyon:",
    "modal-lbl-client": "İşveren:"
  },
  en: {
    // Nav & General
    "nav-corporate": "Corporate",
    "nav-sectors": "Sectors",
    "nav-projects": "Projects",
    "nav-career": "Careers",
    "nav-contact": "Contact",
    
    // Home Page
    "hero-sub": "Global Infrastructure & Engineering Group",
    "hero-title-1": "Grand Projects",
    "hero-title-2": "Beyond Borders",
    "hero-desc": "We deliver world-class engineering solutions in transportation, renewable energy, mega infrastructure, and sustainable building.",
    "hero-btn-1": "Explore Our Projects",
    "hero-btn-2": "Who We Are",
    
    "stat-employees-lbl": "Employees",
    "stat-countries-lbl": "Active Countries",
    "stat-ciro-lbl": "Annual Revenue",
    "stat-enr-lbl": "ENR World Ranking",
    
    "sectors-sub": "Our Fields of Expertise",
    "sectors-title": "Operating Sectors",
    "sectors-btn": "All Sectors",
    
    "sec1-title": "Transportation & Infrastructure",
    "sec1-desc": "We build global transit networks including highways, viaducts, rail systems, airports, and deep-water ports.",
    "sec2-title": "Industry & Energy",
    "sec2-desc": "We fuel a sustainable future with wind, hydro, geothermal plants, and advanced industrial manufacturing complexes.",
    "sec3-title": "Real Estate & Buildings",
    "sec3-desc": "We develop smart city hospitals, green-certified residential spaces, and high-tech business centers.",
    
    "proj-sub": "Our Engineering Wonders",
    "proj-title": "Featured Projects",
    "proj-btn": "View All",
    
    "p1-title": "Eurasia Mega Tunnel",
    "p1-desc": "A double-deck, seismic-resistant mega highway tunnel crossing beneath the sea to connect two continents.",
    "p2-title": "Gordion Wind Power Plant",
    "p2-desc": "A massive 120 MW green energy investment comprising 80 wind turbines.",
    "p3-title": "Ege Port Terminal Expansion",
    "p3-desc": "Construction of deep-water berths and land reclamation expanding container logistics capacity by 3x.",
    "p4-title": "Alara Eco-Tower Residences",
    "p4-desc": "A LEED Platinum-certified, self-powered 42-story smart residential tower.",
    "p5-title": "Anadolu Green Cement Factory",
    "p5-desc": "An eco-friendly integrated facility producing low-carbon cement by generating electricity from waste heat.",
    "p6-title": "Çukurova City Hospital",
    "p6-desc": "A 1,500-bed state-of-the-art medical complex equipped with advanced seismic base isolators.",
    
    // Corporate Page
    "corp-sub": "Deep-Rooted History, Strong Future",
    "corp-title": "Corporate Profile",
    "corp-p1": "Zeugma Holding is a global force operating in 18 countries, ranked 38th in the ENR top international contractors list since starting its engineering journey in 1982.",
    "corp-p2": "Named after the historic ancient city bridging two civilisations, our group aims to connect continents, societies, and dreams of the future with solid bridges. We build the civilisations of tomorrow in line with our environmental respect, safety, and sustainability values.",
    "corp-year-lbl": "Year of Foundation",
    "corp-proj-lbl": "Completed Projects",
    
    "board-sub": "Executive Leadership",
    "board-title": "Board of Directors",
    
    "dir1-role": "Founder & Chairman",
    "dir1-name": "Ahmet Zeugma",
    "dir1-desc": "A civil engineer by background, our founder has provided visionary leadership to the group for over 40 years.",
    
    "dir2-role": "Vice Chair of the Board",
    "dir2-name": "Elif Zeugma Kaya",
    "dir2-desc": "Overseeing investment and international finance, our vice chair manages the holding's global expansion.",
    
    "dir3-role": "Board Member & CEO",
    "dir3-name": "Dr. Can Demir",
    "dir3-desc": "With 25 years of operational experience in energy and infrastructure, our CEO leads the daily operations of the holding.",
    
    // Timeline
    "time-sub": "Historic Milestones",
    "time-title": "Our Milestones of Success",
    "time-item-1-title": "First Foundations",
    "time-item-1-desc": "Zeugma Construction Ltd. was founded in Ankara, starting its first municipal infrastructure and sewage works.",
    "time-item-2-title": "Industrial Turn",
    "time-item-2-desc": "The holding successfully completed its first dam and power station project, expanding into energy contracting.",
    "time-item-3-title": "Going Global",
    "time-item-3-desc": "Airport and highway projects were secured simultaneously in the Middle East and Eastern Europe, taking global brand steps.",
    "time-item-4-title": "Renewable Power Leader",
    "time-item-4-desc": "Our renewable energy capacity hit 500 MW, launching carbon-neutral green construction site concepts.",
    "time-item-5-title": "ENR #38",
    "time-item-5-desc": "Rising to number 38 in the international contractors list, our holding shapes the future with 45,000 employees in 18 countries.",
    
    // Sectors Page
    "sectors-page-sub": "Operational Diversity",
    "sectors-page-title": "Our Sectors of Activity",
    
    "sectors-sec1-lbl": "Transportation & Infrastructure",
    "sectors-sec1-p": "Zeugma Holding is specialized globally in transport infrastructure. Signature works include rail systems, transit tunnels, cross-continental bridges, and highly modern airport passenger terminals.",
    "sectors-sec1-item-1": "✓ High-Speed Train & Metro Lines",
    "sectors-sec1-item-2": "✓ Mega Tunnel & Bridge Crossings",
    "sectors-sec1-item-3": "✓ Modern Airport Terminals",
    "sectors-sec1-item-4": "✓ Deep-Sea Container Ports",
    
    "sectors-sec2-lbl": "Industry & Energy",
    "sectors-sec2-p": "We are committed to delivering secure energy from green and renewable sources. We excel in wind, solar, hydro, and geothermal plants, alongside refineries, petrochemical complexes, and cement factories.",
    "sectors-sec2-item-1": "✓ Wind & Solar Power Plants (WPP/SPP)",
    "sectors-sec2-item-2": "✓ Hydroelectric Power Plants (HPP)",
    "sectors-sec2-item-3": "✓ Waste Heat Recovery Installations",
    "sectors-sec2-item-4": "✓ Petrochemical & Refinery Facilities",
    
    "sectors-sec3-lbl": "Real Estate & Buildings",
    "sectors-sec3-p": "We design buildings that elevate the quality of life. Our portfolio focuses on state-of-the-art public-private partnership (PPP) city hospitals, luxury eco-residences, 5-star hotels, and dynamic corporate towers.",
    "sectors-sec3-item-1": "✓ Integrated Health Campuses (PPP Hospitals)",
    "sectors-sec3-item-2": "✓ LEED-Certified Smart Residential Towers",
    "sectors-sec3-item-3": "✓ Luxury Hotels & Convention Centers",
    "sectors-sec3-item-4": "✓ Commercial Towers & Shopping Plazas",
    
    // Projects Page
    "projects-page-sub": "Our Engineering Portfolio",
    "projects-page-title": "Projects",
    "filter-all": "All",
    "filter-transport": "Transportation & Infra",
    "filter-energy": "Industry & Energy",
    "filter-building": "Real Estate & Buildings",
    "filter-completed": "Completed",
    "filter-ongoing": "Ongoing",
    
    // Career Page
    "career-page-sub": "Join Our Global Team",
    "career-page-title": "Career Opportunities",
    "career-p": "Zeugma Holding offers employees opportunities to work on landmark international projects, accelerate career advancement, and build expertise at world-class standards.",
    "wizard-title": "Job Application Wizard",
    "wizard-step1-title": "Personal Info",
    "wizard-step2-title": "Position & Experience",
    "wizard-step3-title": "CV & Documents",
    
    "lbl-name": "Full Name *",
    "lbl-email": "Email Address *",
    "lbl-phone": "Phone Number *",
    "lbl-position": "Applied Field / Department *",
    "lbl-experience": "Years of Experience *",
    "lbl-letter": "Cover Letter / Short Introduction *",
    "lbl-cv": "Upload Your Resume",
    "lbl-cv-formats": "Supported formats: PDF, DOCX (Max 5MB)",
    "lbl-kvkk": "I hereby consent to the processing and storage of my personal data for the purpose of job application assessment under protection acts. *",
    "btn-prev": "Back",
    "btn-next": "Next",
    
    // Contact Page
    "contact-page-sub": "Get in Touch",
    "contact-page-title": "Contact",
    "contact-panel-h": "Write to Us or Visit",
    "contact-panel-p": "Feel free to reach out for general info, vendor tenders, procurement details, or press inquiries.",
    "contact-form-h": "Send Us a Message",
    "contact-form-subject-lbl": "Subject *",
    "contact-form-msg-lbl": "Your Message *",
    "contact-form-btn": "Send Message",
    
    // Office Labels
    "office-phone": "Phone",
    "office-address": "Address",
    "office-email": "Email",
    "office-map-btn": "SHOW MAP (MOCK)",
    
    // Footer & Meta labels
    "footer-text": "Zeugma Holding is a global engineering partner building a sustainable future through expertise in transport infrastructure, industrial facilities, and renewable energy.",
    "footer-links-title-1": "Quick Links",
    "footer-links-title-2": "Corporate",
    "footer-links-title-3": "Contact",
    "footer-bottom-text": "© 2026 Zeugma Holding A.S. All rights reserved.",
    "footer-link-usage": "Terms of Use",
    "footer-link-privacy": "Privacy Policy",
    
    "modal-lbl-status": "Status:",
    "modal-lbl-duration": "Duration:",
    "modal-lbl-location": "Location:",
    "modal-lbl-client": "Employer:"
  }
};

function initLanguageSwitcher() {
  const switchBtn = document.getElementById('lang-switch');
  if (!switchBtn) return;
  
  switchBtn.addEventListener('click', () => {
    // Toggle
    currentLang = currentLang === 'tr' ? 'en' : 'tr';
    
    // Update button text
    switchBtn.innerText = currentLang === 'tr' ? 'EN' : 'TR';
    
    // Perform translation
    translateUI();
    
    // Re-bind modal events and filter events so project lists adapt if updated
    updateProjectsBadgesAndLabels();
  });
}

function translateUI() {
  // Elements with innerHTML/innerText i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = translations[currentLang][key];
    if (translation) {
      el.innerHTML = translation;
    }
  });
  
  // Elements with input placeholder i18n
  const inputs = document.querySelectorAll('[data-i18n-placeholder]');
  inputs.forEach(input => {
    const key = input.getAttribute('data-i18n-placeholder');
    const translation = translations[currentLang][key];
    if (translation) {
      input.placeholder = translation;
    }
  });
  
  // Custom updates (e.g. document titles or html metadata)
  document.title = currentLang === 'tr' ? 'Zeugma Holding - Geleceği İnşa Ediyoruz' : 'Zeugma Holding - Shaping the Future';
  
  // Update wizard button dynamic texts manually if active
  const nextBtn = document.querySelector('.btn-next');
  if (nextBtn) {
    const careerWizardForm = document.getElementById('career-wizard-form');
    if (careerWizardForm) {
      const activePane = careerWizardForm.querySelector('.wizard-pane.active');
      const isLastStep = activePane && activePane.getAttribute('data-step') === '2';
      if (isLastStep) {
        nextBtn.innerText = currentLang === 'tr' ? 'Başvuruyu Tamamla' : 'Submit Application';
      } else {
        nextBtn.innerText = currentLang === 'tr' ? 'İleri' : 'Next';
      }
    }
  }
}

function updateProjectsBadgesAndLabels() {
  const badges = document.querySelectorAll('.project-badge');
  badges.forEach(badge => {
    const status = badge.parentElement.parentElement.getAttribute('data-status');
    if (status === 'Tamamlandı') {
      badge.innerText = currentLang === 'tr' ? 'Tamamlandı' : 'Completed';
    } else if (status === 'Devam Ediyor') {
      badge.innerText = currentLang === 'tr' ? 'Devam Ediyor' : 'Ongoing';
    }
  });
  
  // Translate current active office detail texts if contact details are open
  const officeTabs = document.querySelectorAll('.office-tab');
  const detailsTitle = document.getElementById('office-details-title');
  if (detailsTitle) {
    // Find active tab
    let activeTabLoc = 'istanbul';
    officeTabs.forEach(tab => {
      if (tab.style.borderColor === 'var(--accent-gold)' || tab.style.borderColor === 'rgb(197, 168, 128)') {
        activeTabLoc = tab.getAttribute('data-office');
      }
    });
    // Trigger click or manual translation reload
    const detailsAddr = document.getElementById('office-details-addr');
    const officeAddrData = {
      istanbul: {
        tr: { title: 'İstanbul Merkez Ofis (HQ)', addr: 'Büyükdere Caddesi, No: 193, Kule 2, Levent, İstanbul' },
        en: { title: 'Istanbul Head Office (HQ)', addr: 'Buyukdere Street, No: 193, Tower 2, Levent, Istanbul' }
      },
      ankara: {
        tr: { title: 'Ankara Temsilciliği', addr: 'Dumlupınar Bulvarı, No: 9, Çankaya, Ankara' },
        en: { title: 'Ankara Representative Office', addr: 'Dumlupinar Boulevard, No: 9, Cankaya, Ankara' }
      },
      baku: {
        tr: { title: 'Bakü Operasyon Ofisi', addr: 'Nizami Caddesi, Bakü LandMark Binası, Bakü, Azerbaycan' },
        en: { title: 'Baku Operations Office', addr: 'Nizami Street, Baku Landmark Building, Baku, Azerbaijan' }
      }
    };
    detailsTitle.innerText = officeAddrData[activeTabLoc][currentLang].title;
    detailsAddr.innerText = officeAddrData[activeTabLoc][currentLang].addr;
  }
}
