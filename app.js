// ==========================================
// CONFIGURATION FIREBASE (À REMPLACER PAR VOS CLÉS)
// ==========================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialisation Firebase (optionnelle si pas config)
let auth = null;
let db = null;
let currentUser = null;

try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
  }
} catch (e) {
  console.log("Firebase non configuré");
}

// ==========================================
// UTILITAIRES GLOBAUX
// ==========================================
const Geocoding = {
  async searchAddress(query) {
    if (!query || query.length < 3) return [];
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=fr`
      );
      const data = await response.json();
      return data.features.map(feature => ({
        display_name: [feature.properties.name, feature.properties.street, feature.properties.city, feature.properties.country].filter(Boolean).join(', '),
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0]
      }));
    } catch (e) {
      return [];
    }
  }
};

const Weather = {
  async getWeather(destination) {
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1`);
      const geoData = await geoRes.json();
      if (!geoData.results?.[0]) return null;
      
      const { latitude, longitude, name } = geoData.results[0];
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&timezone=auto`);
      const weatherData = await weatherRes.json();
      
      const codes = {
        0: { icon: '☀️', desc: 'Ensoleillé' }, 1: { icon: '🌤️', desc: 'Partiellement nuageux' },
        2: { icon: '⛅', desc: 'Nuageux' }, 3: { icon: '☁️', desc: 'Couvert' },
        45: { icon: '🌫️', desc: 'Brumeux' }, 51: { icon: '🌦️', desc: 'Pluie légère' },
        61: { icon: '🌧️', desc: 'Pluvieux' }, 71: { icon: '🌨️', desc: 'Neige' },
        95: { icon: '⛈️', desc: 'Orageux' }
      };
      const weather = codes[weatherData.current.weathercode] || { icon: '🌡️', desc: 'Variable' };
      
      return {
        location: name,
        temp: Math.round(weatherData.current.temperature_2m),
        icon: weather.icon,
        desc: weather.desc
      };
    } catch (e) {
      return null;
    }
  }
};

const Utils = {
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  },
  
  exportTripData(tripId) {
    const trip = Storage.getTrip(tripId);
    const data = {
      trip,
      transport: Storage.getTransport(tripId),
      hotel: Storage.getHotel(tripId),
      days: Storage.getDays(tripId),
      budget: Storage.getBudget(tripId),
      checklist: Storage.getChecklist(tripId),
      spots: Storage.getMapSpots(tripId),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voyage-${trip.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  
  async shareTrip(tripId) {
    const trip = Storage.getTrip(tripId);
    const text = `${trip.name} - ${trip.destination}`;
    if (navigator.share) {
      await navigator.share({ title: trip.name, text: text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(text + ' ' + window.location.href);
      alert('Lien copié !');
    }
  }
};

// ==========================================
// STOCKAGE
// ==========================================
const Storage = {
  getTrips() { return JSON.parse(localStorage.getItem('trips') || '[]'); },
  saveTrip(trip) {
    const trips = this.getTrips();
    if (trip.id) {
      const idx = trips.findIndex(t => t.id === trip.id);
      if (idx !== -1) trips[idx] = trip;
    } else {
      trip.id = Date.now().toString();
      trip.createdAt = new Date().toISOString();
      trips.push(trip);
    }
    localStorage.setItem('trips', JSON.stringify(trips));
    return trip;
  },
  deleteTrip(id) {
    const trips = this.getTrips().filter(t => t.id !== id);
    localStorage.setItem('trips', JSON.stringify(trips));
    ['transport', 'hotel', 'days', 'budget', 'checklist', 'map'].forEach(k => localStorage.removeItem(`${k}_${id}`));
  },
  getTrip(id) { return this.getTrips().find(t => t.id === id); },
  getTransport(id) { return JSON.parse(localStorage.getItem(`transport_${id}`) || '{"outbound": null}'); },
  saveTransport(id, data) { localStorage.setItem(`transport_${id}`, JSON.stringify(data)); },
  getHotel(id) { return JSON.parse(localStorage.getItem(`hotel_${id}`) || 'null'); },
  saveHotel(id, data) { localStorage.setItem(`hotel_${id}`, JSON.stringify(data)); },
  getDays(id) { return JSON.parse(localStorage.getItem(`days_${id}`) || '[]'); },
  saveDays(id, data) { localStorage.setItem(`days_${id}`, JSON.stringify(data)); },
  getBudget(id) { return JSON.parse(localStorage.getItem(`budget_${id}`) || '{"expenses": [], "categories": {}}'); },
  saveBudget(id, data) { localStorage.setItem(`budget_${id}`, JSON.stringify(data)); },
  getChecklist(id) { return JSON.parse(localStorage.getItem(`checklist_${id}`) || '{"preparation": [], "reservations": [], "bagage": [], "documents": [], "avantDepart": []}'); },
  saveChecklist(id, data) { localStorage.setItem(`checklist_${id}`, JSON.stringify(data)); },
  getMapSpots(id) { return JSON.parse(localStorage.getItem(`map_${id}`) || '[]'); },
  saveMapSpots(id, data) { localStorage.setItem(`map_${id}`, JSON.stringify(data)); },
  setCurrentTrip(id) { localStorage.setItem('currentTripId', id); },
  getCurrentTrip() { return localStorage.getItem('currentTripId'); },
  clearCurrentTrip() { localStorage.removeItem('currentTripId'); }
};

// ==========================================
// ROUTER
// ==========================================
const Router = {
  currentPage: 'home',
  currentTripId: null,
  
  init() {
    this.currentTripId = Storage.getCurrentTrip();
    this.navigate('home');
    document.getElementById('back-btn').addEventListener('click', () => this.goBack());
  },
  
  navigate(page, tripId = null) {
    this.currentPage = page;
    if (tripId) {
      this.currentTripId = tripId;
      Storage.setCurrentTrip(tripId);
    }
    this.updateUI();
    this.renderPage();
  },
  
  goBack() {
    if (this.currentPage === 'settings') {
      this.navigate('home');
      return;
    }
    if (this.currentPage !== 'home') {
      this.navigate('home');
      Storage.clearCurrentTrip();
      this.currentTripId = null;
    }
  },
  
  updateUI() {
    const backBtn = document.getElementById('back-btn');
    const bottomNav = document.getElementById('bottom-nav');
    const fabBtn = document.getElementById('fab-btn');
    const pageTitle = document.getElementById('page-title');
    const settingsBtn = document.getElementById('settings-btn');
    
    // Par défaut : cacher FAB et back button, montrer settings
    fabBtn.classList.add('hidden');
    backBtn.classList.add('hidden');
    settingsBtn.classList.remove('hidden');
    bottomNav.classList.add('hidden');
    
    if (this.currentPage === 'home') {
      pageTitle.textContent = 'TripPlanner +';
      fabBtn.classList.remove('hidden');
    } else if (this.currentPage === 'settings') {
      pageTitle.textContent = 'Réglages';
      backBtn.classList.remove('hidden'); // CORRECTION : montrer le bouton retour
      settingsBtn.classList.add('hidden'); // Cacher settings quand on est dedans
    } else {
      // Pages de voyage (overview, itinerary, etc.)
      backBtn.classList.remove('hidden');
      bottomNav.classList.remove('hidden');
      fabBtn.classList.remove('hidden');
      const titles = { 
        overview: 'Voyage', 
        itinerary: 'Programme', 
        map: 'Carte', 
        budget: 'Budget', 
        checklist: 'Checklist' 
      };
      pageTitle.textContent = titles[this.currentPage] || 'Voyage';
    }
    
    // Mettre à jour la nav active
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === this.currentPage);
    });
  },
  
  renderPage() {
    const main = document.getElementById('main-content');
    main.innerHTML = '';
    
    switch(this.currentPage) {
      case 'home': Trips.render(main); break;
      case 'settings': Settings.render(main); break;
      case 'overview': Overview.render(main, this.currentTripId); break;
      case 'itinerary': Itinerary.render(main, this.currentTripId); break;
      case 'map': MapView.render(main, this.currentTripId); break;
      case 'budget': Budget.render(main, this.currentTripId); break;
      case 'checklist': Checklist.render(main, this.currentTripId); break;
    }
  }
};

// ==========================================
// VUES
// ==========================================

const Transport = {
  edit() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    const current = Storage.getTransport(Router.currentTripId);
    
    content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">✈️ Vol Aller</h2>
        <button class="modal-close" onclick="Trips.closeModal()">×</button>
      </div>
      <form id="transport-form">
        <div class="form-group" style="position: relative;">
          <label class="form-label">De (aéroport)</label>
          <input type="text" class="form-input" id="from-search" placeholder="CDG, Paris..." value="${current?.outbound?.fromCode || ''}" autocomplete="off">
          <input type="hidden" id="from-code" value="${current?.outbound?.fromCode || ''}">
          <input type="hidden" id="from-name" value="${current?.outbound?.from || ''}">
          <div id="from-suggestions" class="autocomplete-suggestions"></div>
        </div>
        <div class="form-group" style="position: relative;">
          <label class="form-label">Vers (aéroport)</label>
          <input type="text" class="form-input" id="to-search" placeholder="JFK, New York..." value="${current?.outbound?.toCode || ''}" autocomplete="off">
          <input type="hidden" id="to-code" value="${current?.outbound?.toCode || ''}">
          <input type="hidden" id="to-name" value="${current?.outbound?.to || ''}">
          <div id="to-suggestions" class="autocomplete-suggestions"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Compagnie</label>
            <input type="text" class="form-input" id="trans-company" value="${current?.outbound?.company || ''}" placeholder="Air France">
          </div>
          <div class="form-group">
            <label class="form-label">N° Vol</label>
            <input type="text" class="form-input" id="trans-flight" value="${current?.outbound?.flightNumber || ''}" placeholder="AF023">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Prix (€)</label>
            <input type="number" class="form-input" id="trans-price" value="${current?.outbound?.price || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Date</label>
            <input type="date" class="form-input" id="trans-date" value="${current?.outbound?.date || ''}">
          </div>
        </div>
        <button type="submit" class="btn-primary">Sauvegarder</button>
      </form>
    `;
    
    this.setupAirportAutocomplete('from');
    this.setupAirportAutocomplete('to');
    
    modal.classList.remove('hidden');
    document.getElementById('transport-form').onsubmit = (e) => {
      e.preventDefault();
      const transport = {
        outbound: {
          fromCode: document.getElementById('from-code').value,
          from: document.getElementById('from-name').value,
          toCode: document.getElementById('to-code').value,
          to: document.getElementById('to-name').value,
          company: document.getElementById('trans-company').value,
          flightNumber: document.getElementById('trans-flight').value,
          price: document.getElementById('trans-price').value,
          date: document.getElementById('trans-date').value,
          type: 'avion'
        }
      };
      Storage.saveTransport(Router.currentTripId, transport);
      Trips.closeModal();
      Router.renderPage();
    };
  },
  
  setupAirportAutocomplete(direction) {
    const input = document.getElementById(`${direction}-search`);
    const suggestions = document.getElementById(`${direction}-suggestions`);
    const codeInput = document.getElementById(`${direction}-code`);
    const nameInput = document.getElementById(`${direction}-name`);
    
    input.addEventListener('input', (e) => {
      const query = e.target.value;
      if (query.length < 2) {
        suggestions.classList.remove('visible');
        return;
      }
      const results = AirportSearch.search(query);
      if (results.length > 0) {
        suggestions.innerHTML = results.map(a => `
          <div class="suggestion-item" style="display: flex; align-items: center; gap: 12px;">
            <div style="background: var(--ios-blue); color: white; padding: 4px 8px; border-radius: 4px; font-weight: 700; font-size: 13px;">${a.code}</div>
            <div style="flex: 1;"><div style="font-weight: 600;">${a.city}</div><div style="font-size: 12px; color: var(--text-tertiary);">${a.name}</div></div>
            <div style="font-size: 20px;">${this.getFlag(a.country)}</div>
          </div>
        `).join('');
        suggestions.classList.add('visible');
        
        suggestions.querySelectorAll('.suggestion-item').forEach(el => {
          el.onclick = () => {
            const code = el.querySelector('div').textContent;
            const airport = AirportSearch.getByCode(code);
            input.value = `${airport.code} - ${airport.city}`;
            codeInput.value = airport.code;
            nameInput.value = airport.name;
            suggestions.classList.remove('visible');
          };
        });
      }
    });
    
    document.addEventListener('click', (e) => {
      if (!e.target.closest(`#${direction}-search`)) suggestions.classList.remove('visible');
    });
  },
  
  getFlag(code) {
    const points = code.toUpperCase().split('').map(c => 127397 + c.charCodeAt());
    return String.fromCodePoint(...points);
  }
};

const Trips = {
  currentFilter: 'template',
  
  render(container) {
    const filterDiv = document.createElement('div');
    filterDiv.className = 'segmented-control animate-fade-in';
    filterDiv.innerHTML = `
      <div class="segment ${this.currentFilter === 'template' ? 'active' : ''}" onclick="Trips.setFilter('template')">Idées</div>
      <div class="segment ${this.currentFilter === 'active' ? 'active' : ''}" onclick="Trips.setFilter('active')">En cours</div>
      <div class="segment ${this.currentFilter === 'completed' ? 'active' : ''}" onclick="Trips.setFilter('completed')">Faits</div>
    `;
    container.appendChild(filterDiv);
    
    const trips = Storage.getTrips().filter(t => t.status === this.currentFilter);
    
    if (trips.length === 0) {
      const msg = {
        template: { icon: '💡', title: 'Aucune idée', text: 'Crée ton premier voyage de rêve' },
        active: { icon: '✈️', title: 'Pas de voyage actif', text: 'Active une de tes idées' },
        completed: { icon: '🏆', title: 'Aucun souvenir', text: 'Marque un voyage comme terminé' }
      }[this.currentFilter];
      
      container.innerHTML += `
        <div class="empty-state animate-fade-in">
          <div class="empty-state-icon">${msg.icon}</div>
          <h2>${msg.title}</h2>
          <p>${msg.text}</p>
        </div>
      `;
    } else {
      const list = document.createElement('div');
      list.className = 'animate-fade-in';
      trips.forEach((trip, i) => {
        const card = document.createElement('div');
        card.className = `card ${trip.status === 'template' ? 'template' : trip.status === 'active' ? 'active-trip' : 'completed'}`;
        card.style.animationDelay = `${i * 0.05}s`;
        card.classList.add('animate-fade-in');
        
        const transport = Storage.getTransport(trip.id);
        const days = Storage.getDays(trip.id);
        const spots = Storage.getMapSpots(trip.id);
        
        card.innerHTML = `
          <div class="card-header">
            <span class="card-title">${trip.name}</span>
            <span class="card-status status-${trip.status}">${this.getStatusLabel(trip.status)}</span>
          </div>
          <div class="card-destination">📍 ${trip.destination}</div>
          <div class="card-meta">
            <span>✈️ ${transport.outbound ? transport.outbound.fromCode + '→' + transport.outbound.toCode : '?'}</span>
            <span>📍 ${spots.length} spots</span>
            <span>💰 ${trip.budget || 0}€</span>
          </div>
        `;
        card.onclick = () => Router.navigate('overview', trip.id);
        list.appendChild(card);
      });
      container.appendChild(list);
    }
    
    // Le FAB est géré globalement dans updateUI
    document.getElementById('fab-btn').onclick = () => this.showAddModal();
  },
  
  setFilter(f) { this.currentFilter = f; Router.renderPage(); },
  getStatusLabel(s) { return { template: 'Idée', active: 'Actif', completed: 'Fait' }[s]; },
  
  showAddModal() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div class="modal-header"><h2 class="modal-title">Nouveau voyage</h2><button class="modal-close" onclick="Trips.closeModal()">×</button></div>
      <form id="trip-form">
        <div class="form-group"><label class="form-label">Nom</label><input type="text" class="form-input" id="trip-name" placeholder="Roadtrip USA" required></div>
        <div class="form-group"><label class="form-label">Destination</label><input type="text" class="form-input" id="trip-destination" placeholder="Californie" required></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Durée (j)</label><input type="number" class="form-input" id="trip-duration" placeholder="14"></div>
          <div class="form-group"><label class="form-label">Budget (€)</label><input type="number" class="form-input" id="trip-budget" placeholder="3000"></div>
        </div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="trip-notes" placeholder="Envies..."></textarea></div>
        <button type="submit" class="btn-primary">Créer</button>
      </form>
    `;
    modal.classList.remove('hidden');
    document.getElementById('trip-form').onsubmit = (e) => {
      e.preventDefault();
      const trip = {
        name: document.getElementById('trip-name').value,
        destination: document.getElementById('trip-destination').value,
        duration: parseInt(document.getElementById('trip-duration').value) || null,
        budget: parseFloat(document.getElementById('trip-budget').value) || 0,
        notes: document.getElementById('trip-notes').value,
        status: 'template'
      };
      const saved = Storage.saveTrip(trip);
      Storage.saveChecklist(saved.id, {
        preparation: [{ id: '1', text: 'Vérifier passeport', checked: false }],
        reservations: [], bagage: [], documents: [], avantDepart: []
      });
      this.closeModal();
      Router.navigate('overview', saved.id);
    };
  },
  
  closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); }
};

const Overview = {
  async render(container, tripId) {
    const trip = Storage.getTrip(tripId);
    const transport = Storage.getTransport(tripId);
    const hotel = Storage.getHotel(tripId);
    const days = Storage.getDays(tripId);
    const spots = Storage.getMapSpots(tripId);
    
    // Header
    const header = document.createElement('div');
    header.className = 'overview-header';
    header.innerHTML = `
      <div class="overview-title">${trip.name}</div>
      <div class="destination-badge">📍 ${trip.destination}</div>
      <div class="overview-stats">
        <div class="overview-stat"><div class="overview-stat-value">${days.length}</div><div>Jours</div></div>
        <div class="overview-stat"><div class="overview-stat-value">${spots.length}</div><div>Repères</div></div>
        <div class="overview-stat"><div class="overview-stat-value">${trip.budget || 0}€</div><div>Budget</div></div>
      </div>
    `;
    container.appendChild(header);
    
    // Météo
    const weather = await Weather.getWeather(trip.destination);
    if (weather) {
      const wDiv = document.createElement('div');
      wDiv.className = 'weather-widget';
      wDiv.innerHTML = `
        <div>
          <div class="weather-temp">${weather.temp}°</div>
          <div class="weather-desc">${weather.desc}</div>
          <div style="font-size: 13px; opacity: 0.8;">${weather.location}</div>
        </div>
        <div class="weather-icon">${weather.icon}</div>
      `;
      container.appendChild(wDiv);
    }
    
    // Transport avec bouton modifier stylisé
    const tSection = document.createElement('div');
    tSection.innerHTML = `
      <div class="section-header">
        <div class="section-title">✈️ Transport</div>
        <button class="section-action" onclick="Transport.edit()">Modifier</button>
      </div>
    `;
    
    if (transport.outbound) {
      const t = transport.outbound;
      tSection.innerHTML += `
        <div class="transport-card animate-fade-in">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div><span class="airport-code">${t.fromCode}</span> <span style="font-size: 20px; color: var(--text-secondary);">→</span> <span class="airport-code">${t.toCode}</span></div>
            <div style="font-weight: 600; color: var(--text-secondary);">${t.company || 'Vol'}</div>
          </div>
          <div style="font-size: 14px; color: var(--text-tertiary); display: flex; justify-content: space-between;">
            <span>${t.flightNumber || 'N° non renseigné'}</span>
            <span style="font-weight: 600; color: var(--ios-blue);">${t.price ? t.price + '€' : ''}</span>
          </div>
          ${t.date ? `<div style="font-size: 13px; color: var(--text-tertiary); margin-top: 8px;">📅 ${new Date(t.date).toLocaleDateString('fr-FR')}</div>` : ''}
        </div>
      `;
    } else {
      tSection.innerHTML += `
        <div class="card animate-fade-in" onclick="Transport.edit()" style="border-left: 4px solid var(--ios-blue);">
          <div style="text-align: center; padding: 30px; color: var(--ios-blue); font-weight: 600;">
            <div style="font-size: 32px; margin-bottom: 8px;">✈️</div>
            <div>Ajouter le vol</div>
          </div>
        </div>
      `;
    }
    container.appendChild(tSection);
    
    // Hôtel avec bouton modifier
    const hSection = document.createElement('div');
    hSection.innerHTML = `
      <div class="section-header">
        <div class="section-title">🏨 Hébergement</div>
        ${hotel ? '<button class="section-action" onclick="Overview.editHotel()">Modifier</button>' : '<button class="section-action" onclick="Overview.editHotel()">Ajouter</button>'}
      </div>
    `;
    
    if (hotel) {
      hSection.innerHTML += `
        <div class="hotel-card animate-fade-in">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="font-weight: 700; font-size: 18px; color: var(--text-primary);">${hotel.name}</div>
            ${hotel.price ? `<div style="background: rgba(255,149,0,0.1); color: var(--ios-orange); padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 700;">${hotel.price}€</div>` : ''}
          </div>
          <div style="color: var(--text-tertiary); margin-bottom: 8px; font-size: 14px; line-height: 1.4;">${hotel.address || 'Adresse non renseignée'}</div>
          ${hotel.phone ? `<div style="font-size: 14px; color: var(--ios-blue); font-weight: 500; display: flex; align-items: center; gap: 6px;">📞 ${hotel.phone}</div>` : ''}
        </div>
      `;
    } else {
      hSection.innerHTML += `
        <div class="card animate-fade-in" onclick="Overview.editHotel()" style="border-left: 4px solid var(--ios-orange);">
          <div style="text-align: center; padding: 30px; color: var(--ios-orange); font-weight: 600;">
            <div style="font-size: 32px; margin-bottom: 8px;">🏨</div>
            <div>Ajouter l'hébergement</div>
          </div>
        </div>
      `;
    }
    container.appendChild(hSection);
    
    // Gestion du clic sur le FAB
    document.getElementById('fab-btn').onclick = () => this.showQuickAdd();
  },
  
  editHotel() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    const current = Storage.getHotel(Router.currentTripId);
    
    content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">🏨 Hébergement</h2>
        <button class="modal-close" onclick="Trips.closeModal()">×</button>
      </div>
      <form id="hotel-form">
        <div class="form-group" style="position: relative;">
          <label class="form-label">Rechercher un hôtel</label>
          <input type="text" class="form-input" id="hotel-search" placeholder="Nom + ville" autocomplete="off">
          <div id="hotel-suggestions" class="autocomplete-suggestions"></div>
        </div>
        <div class="form-group"><label class="form-label">Nom de l'établissement</label><input type="text" class="form-input" id="hotel-name" value="${current?.name || ''}" required></div>
        <div class="form-group"><label class="form-label">Adresse complète</label><textarea class="form-textarea" id="hotel-address" rows="2">${current?.address || ''}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Latitude</label><input type="number" step="any" class="form-input" id="hotel-lat" value="${current?.lat || ''}"></div>
          <div class="form-group"><label class="form-label">Longitude</label><input type="number" step="any" class="form-input" id="hotel-lng" value="${current?.lng || ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Téléphone</label><input type="tel" class="form-input" id="hotel-phone" value="${current?.phone || ''}" placeholder="+33..."></div>
          <div class="form-group"><label class="form-label">Prix/nuit (€)</label><input type="number" class="form-input" id="hotel-price" value="${current?.price || ''}"></div>
        </div>
        <button type="submit" class="btn-primary">Sauvegarder</button>
        ${current ? `<button type="button" class="btn-danger" onclick="Overview.deleteHotel()" style="margin-top: 12px;">Supprimer l'hébergement</button>` : ''}
      </form>
    `;
    
    // Autocomplete hôtel
    const search = document.getElementById('hotel-search');
    const sugg = document.getElementById('hotel-suggestions');
    let timer;
    search.addEventListener('input', (e) => {
      clearTimeout(timer);
      const q = e.target.value;
      if (q.length < 3) { sugg.classList.remove('visible'); return; }
      timer = setTimeout(async () => {
        const res = await Geocoding.searchAddress(q);
        if (res.length) {
          sugg.innerHTML = res.map(r => `<div class="suggestion-item"><div style="font-weight: 600;">${r.display_name.split(',')[0]}</div><div style="font-size: 13px; color: var(--text-tertiary);">${r.display_name}</div></div>`).join('');
          sugg.classList.add('visible');
          sugg.querySelectorAll('.suggestion-item').forEach((el, idx) => {
            el.onclick = () => {
              document.getElementById('hotel-name').value = res[idx].display_name.split(',')[0];
              document.getElementById('hotel-address').value = res[idx].display_name;
              document.getElementById('hotel-lat').value = res[idx].lat;
              document.getElementById('hotel-lng').value = res[idx].lon;
              sugg.classList.remove('visible');
            };
          });
        }
      }, 500);
    });
    
    modal.classList.remove('hidden');
    document.getElementById('hotel-form').onsubmit = (e) => {
      e.preventDefault();
      const hotel = {
        name: document.getElementById('hotel-name').value,
        address: document.getElementById('hotel-address').value,
        lat: parseFloat(document.getElementById('hotel-lat').value) || null,
        lng: parseFloat(document.getElementById('hotel-lng').value) || null,
        phone: document.getElementById('hotel-phone').value,
        price: document.getElementById('hotel-price').value
      };
      Storage.saveHotel(Router.currentTripId, hotel);
      if (hotel.lat && hotel.lng) {
        const spots = Storage.getMapSpots(Router.currentTripId);
        if (!spots.find(s => s.name === hotel.name)) {
          spots.push({ id: Date.now().toString(), name: hotel.name, lat: hotel.lat, lng: hotel.lng, type: 'hotel', icon: '🏨', address: hotel.address });
          Storage.saveMapSpots(Router.currentTripId, spots);
        }
      }
      Trips.closeModal();
      Router.renderPage();
    };
  },
  
  deleteHotel() {
    if (confirm('Supprimer cet hébergement ?')) {
      Storage.saveHotel(Router.currentTripId, null);
      Trips.closeModal();
      Router.renderPage();
    }
  },
  
  showQuickAdd() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div class="modal-header"><h2 class="modal-title">Ajouter</h2><button class="modal-close" onclick="Trips.closeModal()">×</button></div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button class="btn-secondary" onclick="Trips.closeModal(); Transport.edit();">✈️ Transport</button>
        <button class="btn-secondary" onclick="Trips.closeModal(); Overview.editHotel();">🏨 Hébergement</button>
        <button class="btn-secondary" onclick="Trips.closeModal(); Router.navigate('itinerary'); setTimeout(() => Itinerary.addDay(), 300);">📅 Jour</button>
        <button class="btn-secondary" onclick="Trips.closeModal(); Router.navigate('map');">🗺️ Carte</div>
      </div>
    `;
    modal.classList.remove('hidden');
  }
};

const Itinerary = {
  render(container, tripId) {
    const days = Storage.getDays(tripId);
    if (days.length === 0) {
      container.innerHTML = `
        <div class="empty-state animate-fade-in">
          <div class="empty-state-icon">🗓️</div>
          <h2>Aucun jour planifié</h2>
          <button onclick="Itinerary.addDay()" class="btn-primary" style="margin-top: 20px;">+ Ajouter le jour 1</button>
        </div>
      `;
    } else {
      const timeline = document.createElement('div');
      timeline.className = 'timeline';
      days.forEach((day, idx) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.style.setProperty('--index', idx);
        item.innerHTML = `
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div style="font-weight: 700; margin-bottom: 8px; font-size: 17px;">Jour ${idx + 1}</div>
            ${(day.activities || []).map(act => `
              <div style="padding: 10px; background: rgba(0,122,255,0.1); border-radius: 8px; margin-bottom: 8px; font-size: 14px;">
                <div style="font-weight: 600;">${act.time || '--:--'} ${act.title}</div>
                ${act.note ? `<div style="font-size: 13px; color: var(--text-tertiary);">${act.note}</div>` : ''}
              </div>
            `).join('') || '<div style="color: var(--text-tertiary); font-size: 14px; padding: 20px; text-align: center;">Aucune activité planifiée</div>'}
            <button onclick="Itinerary.addActivity(${idx})" style="background: none; border: none; color: var(--ios-blue); font-size: 14px; margin-top: 8px; font-weight: 600; width: 100%; padding: 8px;">+ Ajouter une activité</button>
          </div>
        `;
        timeline.appendChild(item);
      });
      container.appendChild(timeline);
      
      const addBtn = document.createElement('button');
      addBtn.className = 'btn-primary';
      addBtn.textContent = `+ Jour ${days.length + 1}`;
      addBtn.onclick = () => this.addDay();
      addBtn.style.marginTop = '20px';
      container.appendChild(addBtn);
    }
    document.getElementById('fab-btn').onclick = () => this.addDay();
  },
  
  addDay() {
    const days = Storage.getDays(Router.currentTripId);
    days.push({ id: Date.now().toString(), activities: [] });
    Storage.saveDays(Router.currentTripId, days);
    Router.renderPage();
  },
  
  addActivity(dayIdx) {
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div class="modal-header"><h2 class="modal-title">Nouvelle activité</h2><button class="modal-close" onclick="Trips.closeModal()">×</button></div>
      <form id="act-form">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Heure</label><input type="time" class="form-input" id="act-time"></div>
          <div class="form-group"><label class="form-label">Type</label><select class="form-select" id="act-type"><option>Visite</option><option>Restaurant</option><option>Transport</option><option>Shopping</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Nom de l'activité</label><input type="text" class="form-input" id="act-title" placeholder="Musée du Louvre" required></div>
        <div class="form-group"><label class="form-label">Notes / Adresse</label><input type="text" class="form-input" id="act-note" placeholder="Adresse ou infos pratiques..."></div>
        <button type="submit" class="btn-primary">Ajouter</button>
      </form>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('act-form').onsubmit = (e) => {
      e.preventDefault();
      const days = Storage.getDays(Router.currentTripId);
      days[dayIdx].activities.push({
        time: document.getElementById('act-time').value,
        type: document.getElementById('act-type').value,
        title: document.getElementById('act-title').value,
        note: document.getElementById('act-note').value
      });
      // Trier par heure
      days[dayIdx].activities.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
      Storage.saveDays(Router.currentTripId, days);
      Trips.closeModal();
      Router.renderPage();
    };
  }
};

const MapView = {
  map: null,
  markers: [],
  
  render(container, tripId) {
    const spots = Storage.getMapSpots(tripId);
    
    const filters = document.createElement('div');
    filters.className = 'map-filters';
    filters.innerHTML = `<div class="map-filter active" onclick="MapView.filter('all')">Tout</div><div class="map-filter" onclick="MapView.filter('hotel')">🏨 Hôtels</div><div class="map-filter" onclick="MapView.filter('activity')">📍 Activités</div>`;
    container.appendChild(filters);
    
    const mapDiv = document.createElement('div');
    mapDiv.id = 'map-container';
    container.appendChild(mapDiv);
    
    if (spots.length === 0) {
      container.innerHTML += `
        <div class="card animate-fade-in" onclick="MapView.addSpot()" style="cursor: pointer;">
          <div style="text-align: center; padding: 40px; color: var(--text-tertiary);">
            <div style="font-size: 48px; margin-bottom: 12px;">📍</div>
            <div style="font-weight: 600; margin-bottom: 4px;">Aucun repère</div>
            <div style="font-size: 14px;">Tapez pour ajouter votre premier lieu</div>
          </div>
        </div>
      `;
    } else {
      const list = document.createElement('div');
      list.style.marginTop = '20px';
      spots.forEach((spot, i) => {
        const item = document.createElement('div');
        item.className = 'card animate-fade-in';
        item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; animation-delay: ' + (i * 0.05) + 's';
        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 28px; background: ${spot.type === 'hotel' ? 'rgba(255,149,0,0.1)' : 'rgba(0,122,255,0.1)'}; padding: 8px; border-radius: 12px;">${spot.icon}</span>
            <div>
              <div style="font-weight: 600; color: var(--text-primary);">${spot.name}</div>
              <div style="font-size: 13px; color: var(--text-tertiary); text-transform: capitalize;">${spot.type}</div>
            </div>
          </div>
          <button onclick="event.stopPropagation(); MapView.deleteSpot(${i})" style="background: rgba(255,59,48,0.1); border: none; color: var(--ios-red); font-size: 20px; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
        `;
        list.appendChild(item);
      });
      container.appendChild(list);
    }
    
    setTimeout(() => this.initMap(tripId, spots), 100);
    document.getElementById('fab-btn').onclick = () => this.addSpot();
  },
  
  initMap(tripId, spots) {
    this.map = L.map('map-container', { zoomControl: false }).setView([48.8566, 2.3522], 13);
    L.control.zoom({ position: 'topright' }).addTo(this.map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
      subdomains: 'abcd'
    }).addTo(this.map);
    
    this.markers = [];
    spots.forEach(spot => {
      const marker = L.marker([spot.lat, spot.lng]).addTo(this.map).bindPopup(`<b>${spot.name}</b><br>${spot.type === 'hotel' ? '🏨' : '📍'} ${spot.type}`);
      marker.spotType = spot.type;
      this.markers.push(marker);
    });
    
    if (spots.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  },
  
  filter(type) {
    document.querySelectorAll('.map-filter').forEach(f => f.classList.remove('active'));
    event.target.classList.add('active');
    this.markers.forEach(m => {
      if (type === 'all' || m.spotType === type) m.addTo(this.map);
      else m.remove();
    });
  },
  
  addSpot() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div class="modal-header"><h2 class="modal-title">Nouveau repère</h2><button class="modal-close" onclick="Trips.closeModal()">×</button></div>
      <form id="spot-form">
        <div class="form-group" style="position: relative;">
          <label class="form-label">Rechercher un lieu</label>
          <input type="text" class="form-input" id="spot-search" placeholder="Tour Eiffel, restaurant..." autocomplete="off">
          <div id="spot-suggestions" class="autocomplete-suggestions"></div>
        </div>
        <div class="form-group"><label class="form-label">Nom du lieu</label><input type="text" class="form-input" id="spot-name" required></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Latitude</label><input type="number" step="any" class="form-input" id="spot-lat"></div>
          <div class="form-group"><label class="form-label">Longitude</label><input type="number" step="any" class="form-input" id="spot-lng"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Type</label>
          <select class="form-select" id="spot-type" onchange="document.getElementById('spot-icon').value = this.value === 'hotel' ? '🏨' : this.value === 'restaurant' ? '🍽️' : this.value === 'photo' ? '📸' : '📍'">
            <option value="activity">Activité générale</option>
            <option value="hotel">Hôtel</option>
            <option value="restaurant">Restaurant</option>
            <option value="photo">Point de vue / Photo</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Icône</label><input type="text" class="form-input" id="spot-icon" value="📍" style="font-size: 24px; text-align: center;"></div>
        <button type="submit" class="btn-primary">Ajouter sur la carte</button>
      </form>
    `;
    
    const search = document.getElementById('spot-search');
    const sugg = document.getElementById('spot-suggestions');
    let timer;
    search.addEventListener('input', (e) => {
      clearTimeout(timer);
      const q = e.target.value;
      if (q.length < 3) return;
      timer = setTimeout(async () => {
        const res = await Geocoding.searchAddress(q);
        if (res.length) {
          sugg.innerHTML = res.map(r => `<div class="suggestion-item">${r.display_name}</div>`).join('');
          sugg.classList.add('visible');
          sugg.querySelectorAll('.suggestion-item').forEach((el, idx) => {
            el.onclick = () => {
              document.getElementById('spot-name').value = res[idx].display_name.split(',')[0];
              document.getElementById('spot-lat').value = res[idx].lat;
              document.getElementById('spot-lng').value = res[idx].lon;
              sugg.classList.remove('visible');
            };
          });
        }
      }, 500);
    });
    
    modal.classList.remove('hidden');
    document.getElementById('spot-form').onsubmit = (e) => {
      e.preventDefault();
      const spots = Storage.getMapSpots(Router.currentTripId);
      spots.push({
        id: Date.now().toString(),
        name: document.getElementById('spot-name').value,
        lat: parseFloat(document.getElementById('spot-lat').value),
        lng: parseFloat(document.getElementById('spot-lng').value),
        type: document.getElementById('spot-type').value,
        icon: document.getElementById('spot-icon').value
      });
      Storage.saveMapSpots(Router.currentTripId, spots);
      Trips.closeModal();
      Router.renderPage();
    };
  },
  
  deleteSpot(i) {
    if (confirm('Supprimer ce repère ?')) {
      const spots = Storage.getMapSpots(Router.currentTripId);
      spots.splice(i, 1);
      Storage.saveMapSpots(Router.currentTripId, spots);
      Router.renderPage();
    }
  }
};

const Budget = {
  categories: { transport: '✈️', hebergement: '🏨', activites: '🎭', nourriture: '🍽️', shopping: '🛍️' },
  
  render(container, tripId) {
    const budget = Storage.getBudget(tripId);
    let total = 0;
    let spent = 0;
    Object.values(budget.categories || {}).forEach(c => {
      total += c.estimated || 0;
      spent += c.spent || 0;
    });
    
    const header = document.createElement('div');
    header.style.cssText = 'background: linear-gradient(135deg, var(--ios-green), #30b350); color: white; padding: 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(52,199,89,0.3);';
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">Budget total estimé</div>
          <div style="font-size: 36px; font-weight: 700;">${total}€</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">Dépensé</div>
          <div style="font-size: 24px; font-weight: 600; ${spent > total ? 'color: #ffeb3b;' : ''}">${spent}€</div>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.2); height: 6px; border-radius: 3px; overflow: hidden;">
        <div style="background: white; height: 100%; width: ${total > 0 ? Math.min((spent/total)*100, 100) : 0}%; transition: width 0.5s ease;"></div>
      </div>
    `;
    container.appendChild(header);
    
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px;';
    Object.entries(this.categories).forEach(([key, icon]) => {
      const cat = budget.categories?.[key] || { estimated: 0, spent: 0 };
      const percent = cat.estimated > 0 ? Math.round((cat.spent || 0) / cat.estimated * 100) : 0;
      grid.innerHTML += `
        <div class="card" onclick="Budget.editCategory('${key}')" style="text-align: center; padding: 20px; cursor: pointer;">
          <div style="font-size: 32px; margin-bottom: 8px;">${icon}</div>
          <div style="font-size: 13px; color: var(--text-tertiary); margin-bottom: 4px; text-transform: capitalize;">${key}</div>
          <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">${cat.estimated}€</div>
          ${cat.spent ? `<div style="font-size: 12px; color: ${percent > 100 ? 'var(--ios-red)' : 'var(--ios-green)'}; font-weight: 600;">${cat.spent}€ dépensé</div>` : ''}
        </div>
      `;
    });
    container.appendChild(grid);
    
    document.getElementById('fab-btn').onclick = () => this.addExpense();
  },
  
  editCategory(key) {
    const budget = Storage.getBudget(Router.currentTripId);
    if (!budget.categories) budget.categories = {};
    if (!budget.categories[key]) budget.categories[key] = { estimated: 0, spent: 0 };
    
    const current = budget.categories[key];
    const estimated = prompt('Budget estimé (€):', current.estimated || 0);
    if (estimated === null) return;
    
    const spent = prompt('Déjà dépensé (€):', current.spent || 0);
    if (spent === null) return;
    
    budget.categories[key] = { 
      estimated: parseFloat(estimated) || 0,
      spent: parseFloat(spent) || 0
    };
    Storage.saveBudget(Router.currentTripId, budget);
    Router.renderPage();
  },
  
  addExpense() {
    this.editCategory('divers');
  }
};

const Checklist = {
  categories: { preparation: '📋 Préparation', reservations: '📅 Réservations', bagage: '🎒 Bagage', documents: '📄 Documents' },
  
  render(container, tripId) {
    const checklist = Storage.getChecklist(tripId);
    
    Object.entries(this.categories).forEach(([key, label]) => {
      const items = checklist[key] || [];
      const done = items.filter(i => i.checked).length;
      
      const section = document.createElement('div');
      section.className = 'checklist-category animate-fade-in';
      section.innerHTML = `
        <div class="checklist-header-row">
          <div style="font-weight: 700; font-size: 17px;">${label}</div>
          <div style="font-size: 13px; color: var(--text-tertiary); font-weight: 600; background: ${done === items.length && items.length > 0 ? '#34c759' : 'var(--ios-light-gray)'}; color: ${done === items.length && items.length > 0 ? 'white' : 'var(--text-tertiary)'}; padding: 4px 12px; border-radius: 12px;">${done}/${items.length}</div>
        </div>
        <div class="checklist-progress-bg"><div class="checklist-progress-fill" style="width: ${items.length ? (done/items.length*100) : 0}%;"></div></div>
      `;
      
      items.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'checklist-item';
        div.innerHTML = `
          <div class="checklist-checkbox ${item.checked ? 'checked' : ''}" onclick="Checklist.toggle('${key}', ${idx})">${item.checked ? '✓' : ''}</div>
          <div class="checklist-text ${item.checked ? 'checked' : ''}" style="flex: 1;">${item.text}</div>
          <button onclick="Checklist.delete('${key}', ${idx})" style="background: none; border: none; color: var(--ios-red); font-size: 18px; padding: 4px;">×</button>
        `;
        section.appendChild(div);
      });
      
      const addBtn = document.createElement('button');
      addBtn.style.cssText = 'background: none; border: none; color: var(--ios-blue); font-size: 14px; margin-top: 12px; font-weight: 600; width: 100%; text-align: left; padding: 8px 0;';
      addBtn.textContent = '+ Ajouter une tâche';
      addBtn.onclick = () => this.addItem(key);
      section.appendChild(addBtn);
      
      container.appendChild(section);
    });
    
    document.getElementById('fab-btn').onclick = () => this.addItem('preparation');
  },
  
  toggle(cat, idx) {
    const c = Storage.getChecklist(Router.currentTripId);
    c[cat][idx].checked = !c[cat][idx].checked;
    Storage.saveChecklist(Router.currentTripId, c);
    Router.renderPage();
  },
  
  delete(cat, idx) {
    const c = Storage.getChecklist(Router.currentTripId);
    c[cat].splice(idx, 1);
    Storage.saveChecklist(Router.currentTripId, c);
    Router.renderPage();
  },
  
  addItem(cat) {
    const text = prompt('Nouvelle tâche:');
    if (text && text.trim()) {
      const c = Storage.getChecklist(Router.currentTripId);
      if (!c[cat]) c[cat] = [];
      c[cat].push({ id: Date.now(), text: text.trim(), checked: false });
      Storage.saveChecklist(Router.currentTripId, c);
      Router.renderPage();
    }
  }
};

// ==========================================
// SETTINGS & FIREBASE
// ==========================================
const Settings = {
  render(container) {
    container.innerHTML = '';
    
    // User Card
    if (currentUser) {
      container.innerHTML += `
        <div class="user-card animate-fade-in">
          <div class="user-avatar">${currentUser.photoURL ? `<img src="${currentUser.photoURL}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : '👤'}</div>
          <div class="user-name">${currentUser.displayName || 'Utilisateur'}</div>
          <div class="user-email">${currentUser.email}</div>
        </div>
      `;
    } else {
      container.innerHTML += `
        <div style="background: white; padding: 24px; border-radius: 16px; margin-bottom: 24px; text-align: center; box-shadow: var(--shadow); animation: fadeIn 0.4s ease;">
          <div style="font-size: 48px; margin-bottom: 12px;">☁️</div>
          <div style="font-weight: 700; font-size: 18px; margin-bottom: 8px;">Synchronisation cloud</div>
          <div style="color: var(--text-tertiary); font-size: 14px; margin-bottom: 16px;">Connectez-vous pour sauvegarder vos voyages entre appareils</div>
          <button class="google-btn" onclick="Settings.signInWithGoogle()">
            <svg class="google-icon" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuer avec Google
          </button>
        </div>
      `;
    }
    
    // Settings sections
    container.innerHTML += `
      <div class="settings-section">
        <div class="settings-title">Données</div>
        <div class="settings-item" onclick="Settings.exportAll()">
          <span class="settings-label">💾 Exporter tout</span>
          <span style="color: var(--text-tertiary);">→</span>
        </div>
        <div class="settings-item" onclick="Settings.importData()">
          <span class="settings-label">📥 Importer</span>
          <span style="color: var(--text-tertiary);">→</span>
        </div>
        ${currentUser ? `
        <div class="settings-item" onclick="Settings.syncToCloud()">
          <span class="settings-label">☁️ Sync maintenant</span>
          <span style="color: var(--ios-green); font-size: 13px; font-weight: 600;">En ligne</span>
        </div>
        <div class="settings-item" onclick="Settings.signOut()" style="color: var(--ios-red);">
          <span class="settings-label">🚪 Déconnexion</span>
          <span>→</span>
        </div>
        ` : ''}
      </div>
      
      <div class="settings-section">
        <div class="settings-title">À propos</div>
        <div class="settings-item">
          <span class="settings-label">Version</span>
          <span class="settings-value">3.1</span>
        </div>
      </div>
    `;
  },
  
  async signInWithGoogle() {
    if (!auth) {
      alert('Firebase non configuré. Ajoutez vos clés dans app.js ligne 4-10.');
      return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await auth.signInWithPopup(provider);
      currentUser = result.user;
      await this.syncFromCloud();
      Router.renderPage();
    } catch (e) {
      alert('Erreur connexion: ' + e.message);
    }
  },
  
  async signOut() {
    if (auth) await auth.signOut();
    currentUser = null;
    Router.renderPage();
  },
  
  async syncToCloud() {
    if (!currentUser || !db) return;
    const trips = Storage.getTrips();
    await db.collection('users').doc(currentUser.uid).set({
      trips: trips,
      lastSync: new Date().toISOString()
    }, { merge: true });
    alert('✓ Synchronisé !');
  },
  
  async syncFromCloud() {
    if (!currentUser || !db) return;
    const doc = await db.collection('users').doc(currentUser.uid).get();
    if (doc.exists && doc.data().trips) {
      localStorage.setItem('trips', JSON.stringify(doc.data().trips));
    }
  },
  
  exportAll() {
    const data = {
      trips: Storage.getTrips(),
      exportDate: new Date().toISOString(),
      appVersion: '3.1'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voyage-plus-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  },
  
  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.trips && Array.isArray(data.trips)) {
            localStorage.setItem('trips', JSON.stringify(data.trips));
            alert('✓ Données importées avec succès !');
            Router.renderPage();
          } else {
            alert('Fichier invalide : format incorrect');
          }
        } catch (err) {
          alert('Fichier invalide : ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
};

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Écoute auth Firebase
  if (auth) {
    auth.onAuthStateChanged(user => {
      currentUser = user;
      if (user && Router.currentPage === 'settings') Router.renderPage();
    });
  }
  
  // Bouton réglages
  document.getElementById('settings-btn').onclick = () => Router.navigate('settings');
  
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      Router.navigate(e.currentTarget.dataset.page, Router.currentTripId);
    });
  });
  
  Router.init();
});