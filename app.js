document.addEventListener('DOMContentLoaded', () => {
  // Ensure reportData is loaded
  if (!window.reportData) {
    console.error("डेटा सापडला नाही! कृपया data.js फाईल तपासा.");
    return;
  }

  const data = window.reportData;

  // Initialize page elements
  initHeaderHero(data);
  initStatsCounters(data);
  initHighlights(data);
  initDistrictSummary(data);
  initDiseaseSummary(data);
  initCharts(data);
  initBeneficiaryTable(data);
  initGallery();
  initContactSection(data);
});

// 1. Header and Hero Section Init
function initHeaderHero(data) {
  document.getElementById('authority-name').textContent = data.authority;
  document.getElementById('authority-post').textContent = data.designation;
  document.getElementById('hero-title').textContent = data.title;
  document.getElementById('hero-subtitle').textContent = data.subtitle;
  document.getElementById('hero-motto').textContent = `"${data.motto}"`;
  document.getElementById('report-duration').textContent = data.duration;
  
  // Set leader profile photo if exist
  const lankeContact = data.contacts.find(c => c.name.includes("अनिल"));
  if (lankeContact) {
    document.getElementById('hero-leader-img').src = lankeContact.photo;
    document.getElementById('hero-leader-name').textContent = lankeContact.name;
    document.getElementById('hero-leader-post').textContent = lankeContact.post;
  }
}

// 2. Animated Counters
function initStatsCounters(data) {
  const formatCurrency = (val) => {
    return '₹' + Number(val).toLocaleString('en-IN') + '/-';
  };

  const counters = [
    { id: 'stat-total-beneficiaries', target: data.summary.totalBeneficiaries, format: v => v + ' रुग्ण' },
    { id: 'stat-total-financial-help', target: data.summary.totalFinancialHelp, format: formatCurrency },
    { id: 'stat-total-pmjay', target: data.summary.totalPmjayHelp, format: formatCurrency },
    { id: 'stat-total-bill-savings', target: data.summary.totalBillSavings, format: formatCurrency },
    { id: 'stat-grand-total', target: data.summary.grandTotalBenefit, format: formatCurrency }
  ];

  counters.forEach(c => {
    const el = document.getElementById(c.id);
    if (!el) return;

    let start = 0;
    const duration = 1500; // ms
    const increment = c.target / (duration / 16); // 60 fps
    
    const updateCounter = () => {
      start += increment;
      if (start >= c.target) {
        el.textContent = c.format(c.target);
      } else {
        el.textContent = c.format(Math.floor(start));
        requestAnimationFrame(updateCounter);
      }
    };
    updateCounter();
  });
}

// 3. Highlights
function initHighlights(data) {
  const container = document.getElementById('highlights-container');
  if (!container) return;

  container.innerHTML = '';
  data.highlights.forEach(h => {
    const card = document.createElement('div');
    card.className = 'highlight-card';
    card.innerHTML = `
      <div class="highlight-title">${h.title}</div>
      <div class="highlight-value">${h.value}</div>
      <div class="highlight-desc">${h.desc}</div>
    `;
    container.appendChild(card);
  });
}

// 4. District Wise Progress
function initDistrictSummary(data) {
  const container = document.getElementById('districts-container');
  if (!container) return;

  container.innerHTML = '';
  data.districtWiseSummary.forEach(d => {
    const card = document.createElement('div');
    card.className = 'district-card';
    card.innerHTML = `
      <div class="district-name-group">
        <span class="district-name">${d.name}</span>
        <span class="district-cases-badge">${d.cases} लाभार्थी</span>
      </div>
      <div class="district-amount">₹${d.amount.toLocaleString('en-IN')}/-</div>
      <div class="progress-container">
        <div class="progress-bar" style="width: 0%"></div>
      </div>
      <div class="district-percentage">${d.percentage}% वाटा</div>
    `;
    container.appendChild(card);

    // Animate progress bar width
    setTimeout(() => {
      const bar = card.querySelector('.progress-bar');
      if (bar) bar.style.width = `${d.percentage}%`;
    }, 100);
  });
}

// 5. Disease Wise List
function initDiseaseSummary(data) {
  const container = document.getElementById('diseases-container');
  if (!container) return;

  container.innerHTML = '';
  data.diseaseWiseSummary.forEach(d => {
    const card = document.createElement('div');
    card.className = 'disease-card';
    card.innerHTML = `
      <div class="disease-icon-box">
        <i class="fas ${d.icon || 'fa-notes-medical'}"></i>
      </div>
      <div class="disease-details">
        <div class="disease-name">${d.name}</div>
        <div class="disease-cases">${d.cases} रुग्ण</div>
        <div class="disease-amount">₹${d.amount.toLocaleString('en-IN')}/-</div>
      </div>
    `;
    container.appendChild(card);
  });
}

// 6. Charts rendering using Chart.js
function initCharts(data) {
  // Chart.js global font override
  if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Outfit', sans-serif";
    Chart.defaults.color = '#475569';
  } else {
    console.warn("Chart.js लायब्ररी लोड झालेली नाही.");
    return;
  }

  // A. Scheme Distribution Chart (Donut Chart)
  const schemeCtx = document.getElementById('schemeChart');
  if (schemeCtx) {
    const labels = data.schemeWiseSummary.map(s => s.name);
    const amounts = data.schemeWiseSummary.map(s => s.amount);
    
    new Chart(schemeCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: amounts,
          backgroundColor: [
            '#E2583E', // मुख्यमंत्री सहाय्यता
            '#0A2540', // टाटा ट्रस्ट
            '#D4AF37', // पंतप्रधान मदत
            '#FF9933', // बिल कपात
            '#10B981', // PMJAY
            '#3B82F6'  // सिद्धिविनायक
          ],
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 15,
              font: { size: 11, weight: 600 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.raw;
                return ` ${context.label}: ₹${val.toLocaleString('en-IN')}/-`;
              }
            }
          }
        },
        cutout: '60%'
      }
    });
  }

  // B. District-wise Help Chart (Bar Chart)
  const districtCtx = document.getElementById('districtChart');
  if (districtCtx) {
    const labels = data.districtWiseSummary.map(d => d.name);
    const amounts = data.districtWiseSummary.map(d => d.amount);

    new Chart(districtCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'वितरित आर्थिक मदत (रुपये)',
          data: amounts,
          backgroundColor: 'rgba(226, 88, 62, 0.85)',
          hoverBackgroundColor: '#E2583E',
          borderColor: '#E2583E',
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` मदत: ₹${context.raw.toLocaleString('en-IN')}/-`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { weight: 600 } }
          },
          y: {
            grid: { color: '#F1F5F9' },
            ticks: {
              callback: function(value) {
                if (value >= 100000) {
                  return (value / 100000) + ' लाख';
                }
                return value;
              }
            }
          }
        }
      }
    });
  }
}

// 7. Searchable, filterable & sortable Table
let currentBeneficiaries = [];
let sortColumn = 'id';
let sortDirection = 'asc';

function initBeneficiaryTable(data) {
  currentBeneficiaries = [...data.beneficiaries];
  
  // Populate filter dropdowns
  populateDropdown('filter-district', [...new Set(data.beneficiaries.map(b => b.district))]);
  populateDropdown('filter-scheme', [...new Set(data.beneficiaries.map(b => b.scheme))]);
  populateDropdown('filter-disease', [...new Set(data.beneficiaries.map(b => b.disease))]);

  // Bind event listeners
  document.getElementById('search-beneficiary').addEventListener('input', filterAndRenderTable);
  document.getElementById('filter-district').addEventListener('change', filterAndRenderTable);
  document.getElementById('filter-scheme').addEventListener('change', filterAndRenderTable);
  document.getElementById('filter-disease').addEventListener('change', filterAndRenderTable);
  
  // Bind sort listeners
  const tableHeaders = document.querySelectorAll('th.sortable');
  tableHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-col');
      if (sortColumn === col) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = col;
        sortDirection = 'asc';
      }
      
      // Update arrows
      tableHeaders.forEach(h => {
        const arrow = h.querySelector('i');
        if (arrow) arrow.className = 'fas fa-sort';
      });
      const activeArrow = th.querySelector('i');
      if (activeArrow) {
        activeArrow.className = sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
      }

      sortAndRenderTable();
    });
  });

  // Bind export buttons
  document.getElementById('btn-export-csv').addEventListener('click', exportToExcel);
  document.getElementById('btn-print').addEventListener('click', () => window.print());

  // Initial render
  sortAndRenderTable();
}

function populateDropdown(id, items) {
  const select = document.getElementById(id);
  if (!select) return;
  
  // Keep first option "सर्व"
  select.innerHTML = `<option value="">सर्व ${select.options[0].text.split(' ').slice(1).join(' ')}</option>`;
  
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = item;
    select.appendChild(opt);
  });
}

function filterAndRenderTable() {
  const searchVal = document.getElementById('search-beneficiary').value.toLowerCase().trim();
  const districtVal = document.getElementById('filter-district').value;
  const schemeVal = document.getElementById('filter-scheme').value;
  const diseaseVal = document.getElementById('filter-disease').value;

  const data = window.reportData;

  currentBeneficiaries = data.beneficiaries.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchVal) || 
                          b.hospital.toLowerCase().includes(searchVal) ||
                          b.disease.toLowerCase().includes(searchVal);
    const matchesDistrict = districtVal === "" || b.district === districtVal;
    const matchesScheme = schemeVal === "" || b.scheme === schemeVal;
    const matchesDisease = diseaseVal === "" || b.disease === diseaseVal;

    return matchesSearch && matchesDistrict && matchesScheme && matchesDisease;
  });

  sortAndRenderTable();
}

function sortAndRenderTable() {
  currentBeneficiaries.sort((a, b) => {
    let valA = a[sortColumn];
    let valB = b[sortColumn];

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('beneficiary-table-body');
  const countEl = document.getElementById('filtered-count');
  const totalAmountEl = document.getElementById('filtered-total');
  
  if (!tbody) return;
  tbody.innerHTML = '';

  let totalAmount = 0;

  if (currentBeneficiaries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-light); padding: 30px;">माहिती उपलब्ध नाही.</td></tr>`;
    countEl.textContent = 'एकूण: 0 रुग्ण';
    totalAmountEl.textContent = 'मदत रक्कम: ₹0/-';
    return;
  }

  currentBeneficiaries.forEach((b, idx) => {
    totalAmount += b.amount;
    const tr = document.createElement('tr');
    
    let statusClass = 'approved';
    if (b.status.includes('कॅशलेस')) statusClass = 'cashless';
    if (b.status.includes('कपात')) statusClass = 'concession';

    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${b.name}</strong></td>
      <td>${b.district}</td>
      <td>${b.scheme}</td>
      <td>${b.disease}</td>
      <td>${b.hospital}</td>
      <td><span class="status-badge ${statusClass}">${b.status}</span></td>
      <td style="text-align: right; font-weight: 700; color: var(--primary-saffron)">₹${b.amount.toLocaleString('en-IN')}/-</td>
    `;
    tbody.appendChild(tr);
  });

  countEl.textContent = `एकूण: ${currentBeneficiaries.length} रुग्ण`;
  totalAmountEl.textContent = `एकूण रक्कम: ₹${totalAmount.toLocaleString('en-IN')}/-`;
}

// Export using sheetjs (XLSX) if loaded, otherwise fallback CSV download
function exportToExcel() {
  const fileName = 'वैद्यकीय_मदत_अहवाल_जून_२०२६';
  const headers = ['अ.क्र.', 'रुग्णाचे नाव', 'जिल्हा', 'योजना/मदत प्रकार', 'आजार / शस्त्रक्रिया', 'रुग्णालय', 'स्थिती', 'मंजूर रक्कम (₹)'];
  
  const excelData = currentBeneficiaries.map((b, idx) => [
    idx + 1,
    b.name,
    b.district,
    b.scheme,
    b.disease,
    b.hospital,
    b.status,
    b.amount
  ]);

  // Insert headers at the beginning
  excelData.unshift(headers);

  if (typeof XLSX !== 'undefined') {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set column widths
    const wscols = [
      { wch: 6 },
      { wch: 25 },
      { wch: 12 },
      { wch: 25 },
      { wch: 20 },
      { wch: 25 },
      { wch: 12 },
      { wch: 15 }
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "लाभार्थी यादी");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  } else {
    // Fallback to CSV format with UTF-8 BOM for Marathi characters display in Excel
    let csvContent = "\uFEFF"; // UTF-8 BOM
    excelData.forEach(row => {
      const csvRow = row.map(val => {
        const text = String(val).replace(/"/g, '""');
        return text.includes(',') || text.includes('\n') ? `"${text}"` : text;
      });
      csvContent += csvRow.join(',') + "\r\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// 8. Gallery and Lightbox modal
function initGallery() {
  const cards = document.querySelectorAll('.gallery-card');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.getAttribute('data-img');
      const caption = card.querySelector('.gallery-title').textContent;
      
      lightboxImg.src = imgSrc;
      lightboxCaption.textContent = caption;
      lightbox.style.display = 'flex';
    });
  });

  closeBtn.addEventListener('click', () => {
    lightbox.style.display = 'none';
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.style.display = 'none';
    }
  });
}

// 9. Contact Section Init
function initContactSection(data) {
  const container = document.getElementById('contacts-container');
  if (!container) return;

  container.innerHTML = '';
  data.contacts.forEach(c => {
    const card = document.createElement('div');
    card.className = 'contact-card';
    
    // Create WhatsApp text message
    const waText = encodeURIComponent(`जय महाराष्ट्र, मी ${c.name} यांच्या जून २०२६ च्या वैद्यकीय मदत कार्य अहवालासंदर्भात संपर्क साधत आहे.`);
    const waUrl = `https://wa.me/91${c.phone}?text=${waText}`;

    card.innerHTML = `
      <img src="${c.photo}" alt="${c.name}" class="contact-img">
      <div class="contact-info">
        <h4 class="contact-name">${c.name}</h4>
        <p class="contact-post">${c.post}</p>
        <div class="contact-actions">
          <a href="tel:+91${c.phone}" class="btn-contact btn-call">
            <i class="fas fa-phone-alt"></i> कॉल करा
          </a>
          <a href="${waUrl}" target="_blank" class="btn-contact btn-whatsapp">
            <i class="fab fa-whatsapp"></i> व्हॉट्सॲप
          </a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}
