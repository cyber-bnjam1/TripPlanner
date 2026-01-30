// TripPlanner - Application complète en un seul fichier

// Configuration
const CONFIG = {
  mapboxToken: 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2h...', // Remplace par ton token Mapbox
  defaultCenter: [48.8566, 2.3522], // Paris
  defaultZoom: 13
};

// Données des aéroports (simplifié - top 50 mondiaux)
const AIRPORTS = [
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle', country: 'FR' },
  { code: 'ORY', city: 'Paris', name: 'Orly', country: 'FR' },
  { code: 'BVA', city: 'Paris', name: 'Beauvais', country: 'FR' },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy', country: 'US' },
  { code: 'LHR', city: 'Londres', name: 'Heathrow', country: 'GB' },
  { code: 'LGW', city: 'Londres', name: 'Gatwick', country: 'GB' },
  { code: 'FCO', city: 'Rome', name: 'Fiumicino', country: 'IT' },
  { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez', country: 'ES' },
  { code: 'BCN', city: 'Barcelone', name: 'El Prat', country: 'ES' },
  { code: 'BER', city: 'Berlin', name: 'Brandenburg', country: 'DE' },
  { code: 'MUC', city: 'Munich', name: 'Franz Josef Strauss', country: 'DE' },
  { code: 'AMS', city: 'Amsterdam', name: 'Schiphol', country: 'NL' },
  { code: 'FRA', city: 'Francfort', name: 'Rhein-Main', country: 'DE' },
  { code: 'ZRH', city: 'Zurich', name: 'Kloten', country: 'CH' },
  { code: 'GVA', city: 'Genève', name: 'Cointrin', country: 'CH' },
  { code: 'NCE', city: 'Nice', name: 'Côte d\'Azur', country: 'FR' },
  { code: 'MRS', city: 'Marseille', name: 'Provence', country: 'FR' },
  { code: 'LYS', city: 'Lyon', name: 'Saint-Exupéry', country: 'FR' },
  { code: 'TLS', city: 'Toulouse', name: 'Blagnac', country: 'FR' },
  { code: 'BOD', city: 'Bordeaux', name: 'Mérignac', country: 'FR' },
  { code: 'NTE', city: 'Nantes', name: 'Atlantique', country: 'FR' },
  { code: 'LAX', city: 'Los Angeles', name: 'International', country: 'US' },
  { code: 'SFO', city: 'San Francisco', name: 'International', country: 'US' },
  { code: 'MIA', city: 'Miami', name: 'International', country: 'US' },
  { code: 'LAS', city: 'Las Vegas', name: 'McCarran', country: 'US' },
  { code: 'DXB', city: 'Dubaï', name: 'International', country: 'AE' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda', country: 'JP' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita', country: 'JP' },
  { code: 'SIN', city: 'Singapour', name: 'Changi', country: 'SG' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi', country: 'TH' },
  { code: 'HKG', city: 'Hong Kong', name: 'International', country: 'HK' },
  { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith', country: 'AU' },
  { code: 'MEL', city: 'Melbourne', name: 'Tullamarine', country: 'AU' },
  { code: 'GRU', city: 'São Paulo', name: 'Guarulhos', country: 'BR' },
  { code: 'EZE', city: 'Buenos Aires', name: 'Ministro Pistarini', country: 'AR' },
  { code: 'CPT', city: 'Le Cap', name: 'International', country: 'ZA' },
  { code: 'CAI', city: 'Le Caire', name: 'International', country: 'EG' },
  { code: 'IST', city: 'Istanbul', name: 'International', country: 'TR' },
  { code: 'ATH', city: 'Athènes', name: 'International', country: 'GR' },
  { code: 'LIS', city: 'Lisbonne', name: 'Humberto Delgado', country: 'PT' },
  { code: 'OPO', city: 'Porto', name: 'Francisco Sá Carneiro', country: 'PT' },
  { code: 'VCE', city: 'Venise', name: 'Marco Polo', country: 'IT' },
  { code: 'MXP', city: 'Milan', name: 'Malpensa', country: 'IT' },
  { code: 'VIE', city: 'Vienne', name: 'International', country: 'AT' },
  { code: 'PRG', city: 'Prague', name: 'Václav Havel', country: 'CZ' },
  { code: 'BUD', city: 'Budapest', name: 'Ferenc Liszt', country: 'HU' },
  { code: 'WAW', city: 'Varsovie', name: 'Chopin', country: 'PL' },
  { code: 'DUB', city: 'Dublin', name: 'International', country: 'IE' },
  { code: 'OSL', city: 'Oslo', name: 'Gardermoen', country: 'NO' },
  { code: 'ARN', city: 'Stockholm', name: 'Arlanda', country: 'SE' },
  { code: 'CPH', city: 'Copenhague', name: 'Kastrup', country: 'DK' },
  { code: 'HEL', city: 'Helsinki', name: 'Vantaa', country: 'FI' },
  { code: 'KEF', city: 'Reykjavik', name: 'Keflavik', country: 'IS' }
];

// Recherche d'aéroports
const AirportSearch = {
  search(query) {
    const q = query.toLowerCase();
    return AIRPORTS.filter(a => 
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
    ).slice(0, 5);
  },
  
  getByCode(code) {
    return AIRPORTS.find(a => a.code === code.toUpperCase());
  }
};

// Stockage local
const Storage = {
  getTrips() {
    return JSON.parse(localStorage.getItem('trips') || '[]');
  },
  
  saveTrip(trip) {
    const trips = this.getTrips();
    if (trip.id) {
      const idx = trips.findIndex(t => t.id === trip.id);
      if (idx >= 0) trips[idx] = trip;
      else trips.push(trip);
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
    // Supprimer aussi toutes les données associées
    localStorage.removeItem(`transport_${id}`);
    localStorage.removeItem(`hotel_${id}`);
    localStorage.removeItem(`days_${id}`);
    localStorage.removeItem(`map_${id}`);
    localStorage.removeItem(`budget_${id}`);
    localStorage.removeItem(`checklist_${id}`);
  },
  
  getTrip(id) {
    return this.getTrips().find(t => t.id === id);
  },
  
  getTransport(tripId) {
    return JSON.parse(localStorage.getItem(`transport_${tripId}`) || '{"outbound":null}');
  },
  
  saveTransport(tripId, transport) {
    localStorage.setItem(`transport_${tripId}`, JSON.stringify(transport));
  },
  
  getHotel(tripId) {
    return JSON.parse(localStorage.getItem(`hotel_${tripId}`) || 'null');
  },
  
  saveHotel(tripId, hotel) {
    localStorage.setItem(`hotel_${tripId}`, JSON.stringify(hotel));
  },
  
  getDays(tripId) {
    return JSON.parse(localStorage.getItem(`days_${tripId}`) || '[]');
  },
  
  saveDays(tripId, days) {
    localStorage.setItem(`days_${tripId}`, JSON.stringify(days));
  },
  
  getMapSpots(tripId) {
    return JSON.parse(localStorage.getItem(`map_${tripId}`) || '[]');
  },
  
  saveMapSpots(tripId, spots) {
    localStorage.setItem(`map_${tripId}`, JSON.stringify(spots));
  },
  
  getBudget(tripId) {
    return JSON.parse(localStorage.getItem(`budget_${tripId}`) || '{"categories":{}}');
  },
  
  saveBudget(tripId, budget) {
    localStorage.setItem(`budget_${tripId}`, JSON.stringify(budget));
  },
  
  getChecklist(tripId) {
    return JSON.parse(localStorage.getItem(`checklist_${tripId}`) || '{"preparation":[],"reservations":[],"bagage":[],"documents":[],"avantDepart":[]}');
  },
  
  saveChecklist(tripId, checklist) {
    localStorage.setItem(`checklist_${tripId}`, JSON.stringify(checklist));
  }
};

// Router
const Router = {
  currentPage: 'home',
  currentTripId: null,
  
  navigate(page, tripId = null) {
    this.currentPage = page;
    this.currentTripId = tripId;
    this.renderPage();
  },
  
  renderPage() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    
    switch(this.currentPage) {
      case 'home':
        Trips.render(app);
        break;
      case 'overview':
        Overview.render(app, this.currentTripId);
        break;
      case 'transport':
        TransportPage.render(app, this.currentTripId);
        break;
      case 'hebergement':
        Hebergement.render(app, this.currentTripId);
        break;
      case 'planning':
        Planning.render(app, this.currentTripId);
        break;
      case 'carte':
        Carte.render(app, this.currentTripId);
        break;
      case 'budget':
        BudgetPage.render(app, this.currentTripId);
        break;
      case 'checklist':
        ChecklistPage.render(app, this.currentTripId);
        break;
    }
    
    this.updateNav();
  },
  
  updateNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.page === this.currentPage) item.classList.add('active');
    });
    
    const fab = document.getElementById('fab-btn');
    fab.classList.toggle('hidden', this.currentPage === 'home');
    
    // Mise à jour du gestionnaire FAB selon la page
    if (this.currentPage !== 'home') {
      setTimeout(() => {
        switch(this.currentPage) {
          case 'transport':
            fab.onclick = () => Transport.edit();
            break;
          case 'hebergement':
            fab.onclick = () => Hotel.edit();
            break;
          case 'planning':
            fab.onclick = () => Planning.addDay();
            break;
          case 'carte':
            fab.onclick = () => Carte.addSpot();
            break;
          case 'budget':
            fab.onclick = () => Budget.addExpense();
            break;
          case 'checklist':
            fab.onclick = () => Checklist.addItem();
            break;
        }
      }, 0);
    }
  }
};

// Composant: Liste des voyages
const Trips = {
  currentFilter: 'template',
  
  render(container) {
    const filterDiv = document.createElement('div');
    filterDiv.className = 'segmented-control animate-fade-in';
    filterDiv.innerHTML = `
      <div class="segment ${this.currentFilter === 'template' ? 'active' : ''}" onclick="Trips.setFilter('template')">Idées</div>
      <div class="segment ${this.currentFilter === 'active' ? 'active' : ''}" onclick="Trips.setFilter('active')">Actifs</div>
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
            <div style="display: flex; gap: 8px; align-items: center;">
              <span class="card-status status-${trip.status}">${this.getStatusLabel(trip.status)}</span>
              <button onclick="event.stopPropagation(); Trips.showTripMenu('${trip.id}')" style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 4px; color: var(--text-secondary);">⋮</button>
            </div>
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
    
    document.getElementById('fab-btn').onclick = () => this.showAddModal();
  },
  
  showTripMenu(tripId) {
    const trip = Storage.getTrip(tripId);
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">${trip.name}</h2>
        <button class="modal-close" onclick="Trips.closeModal()">×</button>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button class="btn-secondary" onclick="Trips.editTrip('${tripId}')">✏️ Modifier le voyage</button>
        <button class="btn-secondary" onclick="Trips.changeStatus('${tripId}')">🔄 Changer le statut</button>
        <button class="btn-danger" onclick="Trips.deleteTrip('${tripId}')">🗑️ Supprimer le voyage</button>
      </div>
    `;
    modal.classList.remove('hidden');
  },
  
  editTrip(tripId) {
    const trip = Storage.getTrip(tripId);
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Modifier le voyage</h2>
        <button class="modal-close" onclick="Trips.closeModal()">×</button>
      </div>
      <form id="edit-trip-form">
        <div class="form-group"><label class="form-label">Nom</label><input type="text" class="form-input" id="edit-trip-name" value="${trip.name}" required></div>
        <div class="form-group"><label class="form-label">Destination</label><input type="text" class="form-input" id="edit-trip-destination" value="${trip.destination}" required></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Durée (j)</label><input type="number" class="form-input" id="edit-trip-duration" value="${trip.duration || ''}"></div>
          <div class="form-group"><label class="form-label">Budget (€)</label><input type="number" class="form-input" id="edit-trip-budget" value="${trip.budget || ''}"></div>
        </div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="edit-trip-notes">${trip.notes || ''}</textarea></div>
        <button type="submit" class="btn-primary">Sauvegarder</button>
      </form>
    `;
    
    document.getElementById('edit-trip-form').onsubmit = (e) => {
      e.preventDefault();
      trip.name = document.getElementById('edit-trip-name').value;
      trip.destination = document.getElementById('edit-trip-destination').value;
      trip.duration = parseInt(document.getElementById('edit-trip-duration').value) || null;
      trip.budget = parseFloat(document.getElementById('edit-trip-budget').value) || 0;
      trip.notes = document.getElementById('edit-trip-notes').value;
      Storage.saveTrip(trip);
      this.closeModal();
      Router.renderPage();
    };
  },
  
  changeStatus(tripId) {
    const trip = Storage.getTrip(tripId);
    const statuses = [
      { value: 'template', label: '💡 Idée' },
      { value: 'active', label: '✈️ En cours' },
      { value: 'completed', label: '🏆 Fait' }
    ];
    
    const choice = prompt(
      'Nouveau statut:\n' + 
      statuses.map((s, i) => `${i+1}. ${s.label}`).join('\n') + 
      '\n\nNuméro:'
    );
    const idx = parseInt(choice) - 1;
    if (idx >= 0 && idx < statuses.length) {
      trip.status = statuses[idx].value;
      Storage.saveTrip(trip);
      this.closeModal();
      Router.renderPage();
    }
  },
  
  deleteTrip(tripId) {
    if (confirm('⚠️ Supprimer définitivement ce voyage ?\n\nToutes les données (vols, hôtel, activités, budget) seront perdues.')) {
      Storage.deleteTrip(tripId);
      this.closeModal();
      Router.renderPage();
    }
  },
  
  setFilter(f) { 
    this.currentFilter = f; 
    Router.renderPage(); 
  },
  
  getStatusLabel(s) { 
    return { template: 'Idée', active: 'Actif', completed: 'Fait' }[s]; 
  },
  
  showAddModal() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Nouveau voyage</h2>
        <button class="modal-close" onclick="Trips.closeModal()">×</button>
      </div>
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
        preparation: [],
        reservations: [],
        bagage: [],
        documents: [],
        avantDepart: []
      });
      this.closeModal();
      Router.navigate('overview', saved.id);
    };
  },
  
  closeModal() { 
    document.getElementById('modal-overlay').classList.add('hidden'); 
  }
};

// Composant: Vue d'ensemble
const Overview = {
  render(container, tripId) {
    const trip = Storage.getTrip(tripId);
    if (!trip) return Router.navigate('home');
    
    const transport = Storage.getTransport(tripId);
    const hotel = Storage.getHotel(tripId);
    const days = Storage.getDays(tripId);
    
    const header = document.createElement('div');
    header.className = 'page-header animate-fade-in';
    header.innerHTML = `
      <button class="back-btn" onclick="Router.navigate('home')">←</button>
      <h1 class="page-title">${trip.name}</h1>
      <p style="color: var(--text-secondary); margin-top: 4px;">${trip.destination}</p>
    `;
    container.appendChild(header);
    
    const grid = document.createElement('div');
    grid.className = 'grid-2 animate-fade-in';
    grid.style.animationDelay = '0.1s';
    
    const modules = [
      { id: 'transport', icon: '✈️', title: 'Transport', subtitle: transport.outbound ? `${transport.outbound.fromCode}→${transport.outbound.toCode}` : 'Non défini', color: 'var(--ios-blue)' },
      { id: 'hebergement', icon: '🏨', title: 'Hébergement', subtitle: hotel ? hotel.name : 'Non défini', color: 'var(--ios-orange)' },
      { id: 'planning', icon: '📅', title: 'Planning', subtitle: `${days.length} jour(s)`, color: 'var(--ios-green)' },
      { id: 'carte', icon: '🗺️', title: 'Carte', subtitle: 'Spots', color: 'var(--ios-red)' },
      { id: 'budget', icon: '💰', title: 'Budget', subtitle: `${trip.budget || 0}€`, color: 'var(--ios-teal)' },
      { id: 'checklist', icon: '✅', title: 'Checklist', subtitle: 'À faire', color: 'var(--ios-indigo)' }
    ];
    
    modules.forEach((m, i) => {
      const card = document.createElement('div');
      card.className = 'module-card';
      card.style.animationDelay = `${0.1 + i * 0.05}s`;
      card.innerHTML = `
        <div class="module-icon" style="background: ${m.color}20; color: ${m.color};">${m.icon}</div>
        <div class="module-title">${m.title}</div>
        <div class="module-subtitle">${m.subtitle}</div>
      `;
      card.onclick = () => Router.navigate(m.id, tripId);
      grid.appendChild(card);
    });
    
    container.appendChild(grid);
    
    // Résumé rapide
    const summary = document.createElement('div');
    summary.className = 'card animate-fade-in';
    summary.style.animationDelay = '0.4s';
    summary.style.marginTop = '24px';
    summary.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 16px;">📊 Résumé</div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
        <div>
          <div style="font-size: 24px; font-weight: 700; color: var(--ios-blue);">${trip.duration || '?'}</div>
          <div style="font-size: 12px; color: var(--text-tertiary);">Jours</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: 700; color: var(--ios-green);">${days.reduce((acc, d) => acc + (d.activities?.length || 0), 0)}</div>
          <div style="font-size: 12px; color: var(--text-tertiary);">Activités</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: 700; color: var(--ios-orange);">${trip.budget || 0}€</div>
          <div style="font-size: 12px; color: var(--text-tertiary);">Budget</div>
        </div>
      </div>
    `;
    container.appendChild(summary);
  }
};

// Composant: Transport (avec vol retour)
const Transport = {
  edit() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    const current = Storage.getTransport(Router.currentTripId);
    
    content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">✈️ Transport Aérien</h2>
        <button class="modal-close" onclick="Trips.closeModal()">×</button>
      </div>
      <form id="transport-form">
        <!-- VOL ALLER -->
        <div style="background: rgba(0,122,255,0.05); padding: 16px; border-radius: 12px; margin-bottom: 20px;">
          <div style="font-weight: 700; margin-bottom: 12px; color: var(--ios-blue);">✈️ Vol Aller</div>
          <div class="form-group" style="position: relative;">
            <label class="form-label">De (aéroport)</label>
            <input type="text" class="form-input" id="from-search" placeholder="CDG, Paris..." value="${current?.outbound?.fromCode ? current.outbound.fromCode + ' - ' + (current.outbound.from || current.outbound.fromCode) : ''}" autocomplete="off">
            <input type="hidden" id="from-code" value="${current?.outbound?.fromCode || ''}">
            <input type="hidden" id="from-name" value="${current?.outbound?.from || ''}">
            <div id="from-suggestions" class="autocomplete-suggestions"></div>
          </div>
          <div class="form-group" style="position: relative;">
            <label class="form-label">Vers (aéroport)</label>
            <input type="text" class="form-input" id="to-search" placeholder="JFK, New York..." value="${current?.outbound?.toCode ? current.outbound.toCode + ' - ' + (current.outbound.to || current.outbound.toCode) : ''}" autocomplete="off">
            <input type="hidden" id="to-code" value="${current?.outbound?.toCode || ''}">
            <input type="hidden" id="to-name" value="${current?.outbound?.to || ''}">
            <div id="to-suggestions" class="autocomplete-suggestions"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Date départ</label><input type="date" class="form-input" id="outbound-date" value="${current?.outbound?.date || ''}"></div>
            <div class="form-group"><label class="form-label">Heure</label><input type="time" class="form-input" id="outbound-time" value="${current?.outbound?.time || ''}"></div>
          </div>
        </div>

        <!-- VOL RETOUR -->
        <div style="background: rgba(175,82,222,0.05); padding: 16px; border-radius: 12px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="font-weight: 700; color: var(--ios-purple);">🔄 Vol Retour</div>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="has-return" ${current?.return ? 'checked' : ''} onchange="Transport.toggleReturn()">
              <span style="font-size: 13px;">Ajouter un retour</span>
            </label>
          </div>
          <div id="return-section" style="${current?.return ? '' : 'display: none;'}">
            <div class="form-group" style="position: relative;">
              <label class="form-label">De (aéroport)</label>
              <input type="text" class="form-input" id="return-from-search" placeholder="JFK, New York..." value="${current?.return?.fromCode ? current.return.fromCode + ' - ' + (current.return.from || current.return.fromCode) : ''}" autocomplete="off">
              <input type="hidden" id="return-from-code" value="${current?.return?.fromCode || ''}">
              <input type="hidden" id="return-from-name" value="${current?.return?.from || ''}">
              <div id="return-from-suggestions" class="autocomplete-suggestions"></div>
            </div>
            <div class="form-group" style="position: relative;">
              <label class="form-label">Vers (aéroport)</label>
              <input type="text" class="form-input" id="return-to-search" placeholder="CDG, Paris..." value="${current?.return?.toCode ? current.return.toCode + ' - ' + (current.return.to || current.return.toCode) : ''}" autocomplete="off">
              <input type="hidden" id="return-to-code" value="${current?.return?.toCode || ''}">
              <input type="hidden" id="return-to-name" value="${current?.return?.to || ''}">
              <div id="return-to-suggestions" class="autocomplete-suggestions"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label class="form-label">Date retour</label><input type="date" class="form-input" id="return-date" value="${current?.return?.date || ''}"></div>
              <div class="form-group"><label class="form-label">Heure</label><input type="time" class="form-input" id="return-time" value="${current?.return?.time || ''}"></div>
            </div>
          </div>
        </div>

        <!-- INFOS COMMUNES -->
        <div class="form-row">
          <div class="form-group"><label class="form-label">Compagnie</label><input type="text" class="form-input" id="trans-company" value="${current?.outbound?.company || ''}" placeholder="Air France"></div>
          <div class="form-group"><label class="form-label">N° Vol</label><input type="text" class="form-input" id="trans-flight" value="${current?.outbound?.flightNumber || ''}" placeholder="AF023"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Prix total (€)</label>
          <input type="number" class="form-input" id="trans-price" value="${current?.outbound?.price || ''}" placeholder="Prix aller + retour">
        </div>
        
        <button type="submit" class="btn-primary">Sauvegarder</button>
        ${current?.outbound ? `<button type="button" class="btn-danger" onclick="Transport.delete()" style="margin-top: 12px;">Supprimer les vols</button>` : ''}
      </form>
    `;
    
    this.setupAirportAutocomplete('from');
    this.setupAirportAutocomplete('to');
    this.setupAirportAutocomplete('return-from');
    this.setupAirportAutocomplete('return-to');
    
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
          date: document.getElementById('outbound-date').value,
          time: document.getElementById('outbound-time').value,
          type: 'avion'
        }
      };
      
      // Ajouter le retour si coché
      if (document.getElementById('has-return').checked) {
        transport.return = {
          fromCode: document.getElementById('return-from-code').value,
          from: document.getElementById('return-from-name').value,
          toCode: document.getElementById('return-to-code').value,
          to: document.getElementById('return-to-name').value,
          company: document.getElementById('trans-company').value,
          flightNumber: document.getElementById('trans-flight').value,
          date: document.getElementById('return-date').value,
          time: document.getElementById('return-time').value,
          type: 'avion'
        };
      }
      
      Storage.saveTransport(Router.currentTripId, transport);
      Trips.closeModal();
      Router.renderPage();
    };
  },
  
  toggleReturn() {
    const checked = document.getElementById('has-return').checked;
    document.getElementById('return-section').style.display = checked ? 'block' : 'none';
    // Pré-remplir avec les aéroports inversés
    if (checked) {
      const fromCode = document.getElementById('from-code').value;
      const fromName = document.getElementById('from-name').value;
      const toCode = document.getElementById('to-code').value;
      const toName = document.getElementById('to-name').value;
      if (toCode && !document.getElementById('return-from-code').value) {
        document.getElementById('return-from-search').value = `${toCode} - ${toName || toCode}`;
        document.getElementById('return-from-code').value = toCode;
        document.getElementById('return-from-name').value = toName;
      }
      if (fromCode && !document.getElementById('return-to-code').value) {
        document.getElementById('return-to-search').value = `${fromCode} - ${fromName || fromCode}`;
        document.getElementById('return-to-code').value = fromCode;
        document.getElementById('return-to-name').value = fromName;
      }
    }
  },
  
  delete() {
    if (confirm('Supprimer tous les vols ?')) {
      Storage.saveTransport(Router.currentTripId, { outbound: null });
      Trips.closeModal();
      Router.renderPage();
    }
  },
  
  setupAirportAutocomplete(direction) {
    const input = document.getElementById(`${direction}-search`);
    const suggestions = document.getElementById(`${direction}-suggestions`);
    const codeInput = document.getElementById(`${direction}-code`);
    const nameInput = document.getElementById(`${direction}-name`);
    
    if (!input) return;
    
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

// Page Transport
const TransportPage = {
  render(container, tripId) {
    const trip = Storage.getTrip(tripId);
    const transport = Storage.getTransport(tripId);
    
    const header = document.createElement('div');
    header.className = 'page-header animate-fade-in';
    header.innerHTML = `
      <button class="back-btn" onclick="Router.navigate('overview', '${tripId}')">←</button>
      <h1 class="page-title">✈️ Transport</h1>
    `;
    container.appendChild(header);
    
    if (!transport.outbound) {
      const empty = document.createElement('div');
      empty.className = 'empty-state animate-fade-in';
      empty.innerHTML = `
        <div class="empty-state-icon">✈️</div>
        <h2>Aucun vol</h2>
        <p>Ajoute ton vol aller (et retour)</p>
      `;
      container.appendChild(empty);
    } else {
      // Vol aller
      const outboundCard = document.createElement('div');
      outboundCard.className = 'card animate-fade-in';
      outboundCard.style.borderLeft = '4px solid var(--ios-blue)';
      outboundCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="font-weight: 700; color: var(--ios-blue);">✈️ Vol Aller</div>
          <div style="font-size: 13px; color: var(--text-tertiary);">${transport.outbound.date || 'Date non définie'}</div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div style="text-align: center;">
            <div style="font-size: 28px; font-weight: 700;">${transport.outbound.fromCode}</div>
            <div style="font-size: 12px; color: var(--text-tertiary);">${transport.outbound.time || '--:--'}</div>
          </div>
          <div style="flex: 1; text-align: center; padding: 0 16px;">
            <div style="border-bottom: 2px dashed var(--border-color); position: relative;">
              <div style="position: absolute; right: -4px; top: -6px; font-size: 12px;">✈️</div>
            </div>
            <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 4px;">${transport.outbound.company || ''}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 28px; font-weight: 700;">${transport.outbound.toCode}</div>
            <div style="font-size: 12px; color: var(--text-tertiary);">Arrivée</div>
          </div>
        </div>
        ${transport.outbound.flightNumber ? `<div style="font-size: 13px; color: var(--text-secondary);">Vol ${transport.outbound.flightNumber}</div>` : ''}
      `;
      container.appendChild(outboundCard);
      
      // Vol retour
      if (transport.return) {
        const returnCard = document.createElement('div');
        returnCard.className = 'card animate-fade-in';
        returnCard.style.animationDelay = '0.1s';
        returnCard.style.borderLeft = '4px solid var(--ios-purple)';
        returnCard.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div style="font-weight: 700; color: var(--ios-purple);">🔄 Vol Retour</div>
            <div style="font-size: 13px; color: var(--text-tertiary);">${transport.return.date || 'Date non définie'}</div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700;">${transport.return.fromCode}</div>
              <div style="font-size: 12px; color: var(--text-tertiary);">${transport.return.time || '--:--'}</div>
            </div>
            <div style="flex: 1; text-align: center; padding: 0 16px;">
              <div style="border-bottom: 2px dashed var(--border-color); position: relative;">
                <div style="position: absolute; right: -4px; top: -6px; font-size: 12px;">✈️</div>
              </div>
              <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 4px;">${transport.return.company || ''}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 28px; font-weight: 700;">${transport.return.toCode}</div>
              <div style="font-size: 12px; color: var(--text-tertiary);">Arrivée</div>
            </div>
          </div>
          ${transport.return.flightNumber ? `<div style="font-size: 13px; color: var(--text-secondary);">Vol ${transport.return.flightNumber}</div>` : ''}
        `;
        container.appendChild(returnCard);
      }
      
      // Prix total
      if (transport.outbound.price) {
        const priceCard = document.createElement('div');
        priceCard.className = 'card animate-fade-in';
        priceCard.style.animationDelay = '0.2s';
        priceCard.style.background = 'linear-gradient(135deg, rgba(52,199,89,0.1), rgba(48,179,80,0.05))';
        priceCard.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 13px; color: var(--text-secondary);">Prix total payé</div>
              <div style="font-size: 24px; font-weight: 700; color: var(--ios-green);">${transport.outbound.price}€</div>
            </div>
            <div style="font-size: 40px;">💰</div>
          </div>
        `;
        container.appendChild(priceCard);
      }
    }
    
    document.getElementById('fab-btn').onclick = () => Transport.edit();
  }
};

// Composant: Hébergement
const Hotel = {
  edit() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    const current = Storage.getHotel(Router.currentTripId);
    
    content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">🏨 Hébergement</h2>
        <button class="modal-close" onclick="Trips.closeModal()">×</button>
      </div>
      <form id="hotel-form">
        <div class="form-group"><label class="form-label">Nom</label><input type="text" class="form-input" id="hotel-name" value="${current?.name || ''}" placeholder="Hôtel..." required></div>
        <div class="form-group"><label class="form-label">Adresse</label><input type="text" class="form-input" id="hotel-address" value="${current?.address || ''}" placeholder="123 rue..."></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Check-in</label><input type="date" class="form-input" id="hotel-checkin" value="${current?.checkin || ''}"></div>
          <div class="form-group"><label class="form-label">Check-out</label><input type="date" class="form-input" id="hotel-checkout" value="${current?.checkout || ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Prix (€)</label><input type="number" class="form-input" id="hotel-price" value="${current?.price || ''}" placeholder="Total"></div>
          <div class="form-group"><label class="form-label">Téléphone</label><input type="tel" class="form-input" id="hotel-phone" value="${current?.phone || ''}"></div>
        </div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="hotel-notes">${current?.notes || ''}</textarea></div>
        <button type="submit" class="btn-primary">Sauvegarder</button>
        ${current ? `<button type="button" class="btn-danger" onclick="Hotel.delete()" style="margin-top: 12px;">Supprimer</button>` : ''}
      </form>
    `;
    modal.classList.remove('hidden');
    document.getElementById('hotel-form').onsubmit = (e) => {
      e.preventDefault();
      const hotel = {
        name: document.getElementById('hotel-name').value,
        address: document.getElementById('hotel-address').value,
        checkin: document.getElementById('hotel-checkin').value,
        checkout: document.getElementById('hotel-checkout').value,
        price: document.getElementById('hotel-price').value,
        phone: document.getElementById('hotel-phone').value,
        notes: document.getElementById('hotel-notes').value
      };
      Storage.saveHotel(Router.currentTripId, hotel);
      Trips.closeModal();
      Router.renderPage();
    };
  },
  
  delete() {
    if (confirm('Supprimer l\'hébergement ?')) {
      Storage.saveHotel(Router.currentTripId, null);
      Trips.closeModal();
      Router.renderPage();
    }
  }
};

const Hebergement = {
  render(container, tripId) {
    const trip = Storage.getTrip(tripId);
    const hotel = Storage.getHotel(tripId);
    
    const header = document.createElement('div');
    header.className = 'page-header animate-fade-in';
    header.innerHTML = `
      <button class="back-btn" onclick="Router.navigate('overview', '${tripId}')">←</button>
      <h1 class="page-title">🏨 Hébergement</h1>
    `;
    container.appendChild(header);
    
    if (!hotel) {
      const empty = document.createElement('div');
      empty.className = 'empty-state animate-fade-in';
      empty.innerHTML = `
        <div class="empty-state-icon">🏨</div>
        <h2>Pas d'hébergement</h2>
        <p>Ajoute ton hôtel ou Airbnb</p>
      `;
      container.appendChild(empty);
    } else {
      const card = document.createElement('div');
      card.className = 'card animate-fade-in';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <div>
            <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">${hotel.name}</div>
            <div style="color: var(--text-secondary); font-size: 14px;">📍 ${hotel.address || 'Adresse non renseignée'}</div>
          </div>
          <div style="font-size: 40px;">🏨</div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">Arrivée</div>
            <div style="font-weight: 600;">${hotel.checkin || 'Non défini'}</div>
          </div>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 4px;">Départ</div>
            <div style="font-weight: 600;">${hotel.checkout || 'Non défini'}</div>
          </div>
        </div>
        ${hotel.price ? `<div style="font-size: 18px; font-weight: 700; color: var(--ios-green); margin-bottom: 8px;">${hotel.price}€</div>` : ''}
        ${hotel.phone ? `<div style="margin-bottom: 8px;">📞 <a href="tel:${hotel.phone}" style="color: var(--ios-blue);">${hotel.phone}</a></div>` : ''}
        ${hotel.notes ? `<div style="background: #f8f9fa; padding: 12px; border-radius: 8px; font-size: 14px; color: var(--text-secondary);">${hotel.notes}</div>` : ''}
      `;
      container.appendChild(card);
    }
    
    document.getElementById('fab-btn').onclick = () => Hotel.edit();
  }
};

// Composant: Planning
const Planning = {
  render(container, tripId) {
    const trip = Storage.getTrip(tripId);
    let days = Storage.getDays(tripId);
    
    const header = document.createElement('div');
    header.className = 'page-header animate-fade-in';
    header.innerHTML = `
      <button class="back-btn" onclick="Router.navigate('overview', '${tripId}')">←</button>
      <h1 class="page-title">📅 Planning</h1>
    `;
    container.appendChild(header);
    
    if (days.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state animate-fade-in';
      empty.innerHTML = `
        <div class="empty-state-icon">📅</div>
        <h2>Aucun jour planifié</h2>
        <p>Ajoute tes journées une par une</p>
      `;
      container.appendChild(empty);
    } else {
      days.forEach((day, i) => {
        const card = document.createElement('div');
        card.className = 'card animate-fade-in';
        card.style.animationDelay = `${i * 0.05}s`;
        
        let activitiesHtml = '';
        if (day.activities && day.activities.length > 0) {
          activitiesHtml = day.activities.map((act, j) => `
            <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0; ${j < day.activities.length - 1 ? 'border-bottom: 1px solid #f2f2f7;' : ''}">
              <div style="background: var(--ios-blue); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${act.time || '--:--'}</div>
              <div style="flex: 1;">${act.name}</div>
              <button onclick="event.stopPropagation(); Planning.deleteActivity(${i}, ${j})" style="background: none; border: none; color: var(--ios-red); cursor: pointer; font-size: 18px;">×</button>
            </div>
          `).join('');
        } else {
          activitiesHtml = '<div style="color: var(--text-tertiary); font-size: 14px; padding: 8px 0;">Aucune activité</div>';
        }
        
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="font-weight: 700; font-size: 16px;">Jour ${day.number || i + 1}</div>
            <div style="display: flex; gap: 8px;">
              <button onclick="event.stopPropagation(); Planning.editDay(${i})" style="background: none; border: none; color: var(--ios-blue); cursor: pointer; font-size: 16px;">✏️</button>
              <button onclick="event.stopPropagation(); Planning.deleteDay(${i})" style="background: none; border: none; color: var(--ios-red); cursor: pointer; font-size: 16px;">🗑️</button>
            </div>
          </div>
          <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">${day.date || 'Date non définie'}</div>
          ${day.notes ? `<div style="font-size: 13px; color: var(--text-tertiary); margin-bottom: 12px; font-style: italic;">${day.notes}</div>` : ''}
          <div style="margin-top: 12px;">
            <div style="font-size: 12px; font-weight: 600; color: var(--text-tertiary); margin-bottom: 8px; text-transform: uppercase;">Activités</div>
            ${activitiesHtml}
          </div>
          <button class="btn-secondary" onclick="event.stopPropagation(); Planning.addActivity(${i})" style="margin-top: 12px; width: 100%;">+ Ajouter une activité</button>
        `;
        container.appendChild(card);
      });
    }
    
    document.getElementById('fab-btn').onclick = () => this.addDay();
  },
  
  addDay() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    const days = Storage.getDays(Router.currentTripId);
    
    content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Ajouter un jour</h2>
        <button class="modal-close" onclick="Trips.closeModal()">×</button>
      </div>
      <form id="day-form">
        <div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input" id="day-date" required></div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="day-notes" placeholder="Thème de la journée..."></textarea></div>
        <button type="submit" class="btn-primary">Ajouter</button>
      </form>
    `;
    modal.classList.remove('hidden');
    document.getElementById('day-form').onsubmit = (e) => {
      e.preventDefault();
      const day = {
        date: document.getElementById('day-date').value,
        notes: document.getElementById('day-notes').value,
        number: days.length + 1,
        activities: []
      };
      days.push(day);
      Storage.saveDays(Router.currentTripId, days);
      Trips.closeModal();
      Router.renderPage();
    };
  },
  
  editDay(index) {
    const days = Storage.getDays(Router.currentTripId);
    const day = days[index];
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Modifier le jour ${day.number}</h2>
        <button class="modal-close" onclick="Trips.closeModal()">×</button>
      </div>
      <form id="edit-day-form">
        <div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input" id="edit-day-date" value="${day.date}" required></div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="edit-day-notes">${day.notes || ''}</textarea></div>
        <button type="submit" class="btn-primary">Sauvegarder</button>
      </form>
    `;
    modal.classList.remove('hidden');
    document.getElementById('edit-day-form').onsubmit = (e) => {
      e.preventDefault();
      day.date = document.getElementById('edit-day-date').value;
      day.notes = document.getElementById('edit-day-notes').value;
      Storage.saveDays(Router.currentTripId, days);
      Trips.closeModal();
      Router.renderPage();
    };
  },
  
  deleteDay(index) {
    if (!confirm('Supprimer ce jour et toutes ses activités ?')) return;
    const days = Storage.getDays(Router.currentTripId);
    days.splice(index, 1);
    // Recalculer les numéros
    days.forEach((d, i) => d.number = i + 1);
    Storage.saveDays(Router.currentTripId, days);
    Router.renderPage();
  },
  
  addActivity(dayIndex) {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Ajouter une activité</h2>
        <button class="modal-close" onclick="Trips.closeModal()">×</button>
      </div>
      <form id="activity-form">
        <div class="form-row">
          <div class="form-group" style="flex: 0 0 100px;"><label class="form-label">Heure</label><input type="time" class="form-input" id="act-time" required></div>
          <div class="form-group" style="flex: 1;"><label class="form-label">Activité</label><input type="text" class="form-input" id="act-name" placeholder="Visite musée..." required></div>
        </div>
        <div class="form-group"><label class="form-label">Lieu</label><input type="text" class="form-input" id="act-place" placeholder="Adresse ou lieu"></div>
        <div class="form-group"><label class="form-label">Prix estimé (€)</label><input type="number" class="form-input" id="act-price" placeholder="0"></div>
        <button type="submit" class="btn-primary">Ajouter</button>
      </form>
    `;
    modal.classList.remove('hidden');
    document.getElementById('activity-form').onsubmit = (e) => {
      e.preventDefault();
      const days = Storage.getDays(Router.currentTripId);
      if (!days[dayIndex].activities) days[dayIndex].activities = [];
      days[dayIndex].activities.push({
        time: document.getElementById('act-time').value,
        name: document.getElementById('act-name').value,
        place: document.getElementById('act-place').value,
        price: document.getElementById('act-price').value
      });
      // Trier par heure
      days[dayIndex].activities.sort((a, b) => a.time.localeCompare(b.time));
      Storage.saveDays(Router.currentTripId, days);
      Trips.closeModal();
      Router.renderPage();
    };
  },
  
  deleteActivity(dayIndex, actIndex) {
    const days = Storage.getDays(Router.currentTripId);
    days[dayIndex].activities.splice(actIndex, 1);
    Storage.saveDays(Router.currentTripId, days);
    Router.renderPage();
  }
};

// Composant: Carte
const Carte = {
  map: null,
  markers: [],
  
  render(container, tripId) {
    const trip = Storage.getTrip(tripId);
    const spots = Storage.getMapSpots(tripId);
    
    const header = document.createElement('div');
    header.className = 'page-header animate-fade-in';
    header.innerHTML = `
      <button class="back-btn" onclick="Router.navigate('overview', '${tripId}')">←</button>
      <h1 class="page-title">🗺️ Carte</h1>
    `;
    container.appendChild(header);
    
    const mapContainer = document.createElement('div');
    mapContainer.id = 'map';
    mapContainer.style.cssText = 'height: 400px; border-radius: 12px; margin-bottom: 20px; box-shadow: var(--shadow);';
    container.appendChild(mapContainer);
    
    // Initialiser la carte
    setTimeout(() => this.initMap(tripId), 100);
    
    // Liste des spots
    if (spots.length > 0) {
      const list = document.createElement('div');
      list.className = 'animate-fade-in';
      spots.forEach((spot, i) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.marginBottom = '12px';
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600;">${spot.name}</div>
              <div style="font-size: 13px; color: var(--text-tertiary);">${spot.type || 'Lieu'}</div>
            </div>
            <button onclick="Carte.deleteSpot(${i})" style="background: none; border: none; color: var(--ios-red); cursor: pointer; font-size: 18px;">×</button>
          </div>
        `;
        list.appendChild(card);
      });
      container.appendChild(list);
    }
    
    document.getElementById('fab-btn').onclick = () => this.addSpot();
  },
  
  initMap(tripId) {
    const trip = Storage.getTrip(tripId);
    const spots = Storage.getMapSpots(tripId);
    
    // Utiliser OpenStreetMap (gratuit) au lieu de Mapbox
    this.map = L.map('map').setView(CONFIG.defaultCenter, CONFIG.defaultZoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    // Ajouter les marqueurs existants
    this.markers = [];
    spots.forEach(spot => {
      if (spot.lat && spot.lng) {
        const marker = L.marker([spot.lat, spot.lng]).addTo(this.map);
        marker.bindPopup(spot.name);
        this.markers.push(marker);
      }
    });
    
    // Ajuster la vue si des marqueurs existent
    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  },
  
  addSpot() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">Ajouter un lieu</h2>
        <button class="modal-close" onclick="Trips.closeModal()">×</button>
      </div>
      <form id="spot-form">
        <div class="form-group"><label class="form-label">Nom du lieu</label><input type="text" class="form-input" id="spot-name" placeholder="Tour Eiffel..." required></div>
        <div class="form-group"><label class="form-label">Type</label>
          <select class="form-input" id="spot-type">
            <option value="sight">🏛️ Monument</option>
            <option value="restaurant">🍽️ Restaurant</option>
            <option value="hotel">🏨 Hôtel</option>
            <option value="shop">🛍️ Shopping</option>
            <option value="nature">🌳 Nature</option>
            <option value="other">📍 Autre</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Latitude</label><input type="number" step="any" class="form-input" id="spot-lat" placeholder="48.8566"></div>
        <div class="form-group"><label class="form-label">Longitude</label><input type="number" step="any" class="form-input" id="spot-lng" placeholder="2.3522"></div>
        <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: var(--text-secondary);">
          💡 Pour trouver les coordonnées, cherche sur Google Maps, clique droit sur le lieu et copie les coordonnées.
        </div>
        <button type="submit" class="btn-primary">Ajouter</button>
      </form>
    `;
    modal.classList.remove('hidden');
    document.getElementById('spot-form').onsubmit = (e) => {
      e.preventDefault();
      const spots = Storage.getMapSpots(Router.currentTripId);
      spots.push({
        name: document.getElementById('spot-name').value,
        type: document.getElementById('spot-type').value,
        lat: parseFloat(document.getElementById('spot-lat').value),
        lng: parseFloat(document.getElementById('spot-lng').value)
      });
      Storage.saveMapSpots(Router.currentTripId, spots);
      Trips.closeModal();
      Router.renderPage();
    };
  },
  
  deleteSpot(index) {
    const spots = Storage.getMapSpots(Router.currentTripId);
    spots.splice(index, 1);
    Storage.saveMapSpots(Router.currentTripId, spots);
    Router.renderPage();
  }
};

// Composant: Budget (avec calcul auto)
const Budget = {
  categories: { transport: '✈️', hebergement: '🏨', activites: '🎭', nourriture: '🍽️', shopping: '🛍️', divers: '📦' },
  
  // Calculer le budget automatiquement depuis les données
  calculateAutoBudget(tripId) {
    const budget = Storage.getBudget(tripId);
    const transport = Storage.getTransport(tripId);
    const hotel = Storage.getHotel(tripId);
    const days = Storage.getDays(tripId);
    
    // Initialiser les catégories si pas existantes
    if (!budget.categories) budget.categories = {};
    
    // Transport (vols)
    const flightPrice = parseFloat(transport?.outbound?.price) || 0;
    if (flightPrice > 0) {
      if (!budget.categories.transport) budget.categories.transport = { estimated: 0, spent: 0, auto: true };
      budget.categories.transport.estimated = flightPrice;
      budget.categories.transport.auto = true;
    }
    
    // Hébergement
    const hotelPrice = parseFloat(hotel?.price) || 0;
    if (hotelPrice > 0) {
      if (!budget.categories.hebergement) budget.categories.hebergement = { estimated: 0, spent: 0, auto: true };
      budget.categories.hebergement.estimated = hotelPrice;
      budget.categories.hebergement.auto = true;
    }
    
    // Activités (compter les activités dans l'itinéraire)
    let activitiesCount = 0;
    let activitiesPrice = 0;
    days.forEach(day => {
      activitiesCount += (day.activities || []).length;
      (day.activities || []).forEach(act => {
        if (act.price) activitiesPrice += parseFloat(act.price);
      });
    });
    if (activitiesCount > 0) {
      if (!budget.categories.activites) budget.categories.activites = { estimated: 0, spent: 0 };
      // Prendre le max entre le prix estimé et le prix des activités saisies
      const estimatedPrice = activitiesCount * 30; // 30€ par activité estimée
      budget.categories.activites.estimated = Math.max(estimatedPrice, activitiesPrice);
    }
    
    Storage.saveBudget(tripId, budget);
    return budget;
  },
  
  render(container, tripId) {
    // Calculer automatiquement avant d'afficher
    const budget = this.calculateAutoBudget(tripId);
    
    let total = 0;
    let spent = 0;
    let autoTotal = 0;
    
    Object.entries(budget.categories || {}).forEach(([key, c]) => {
      total += c.estimated || 0;
      spent += c.spent || 0;
      if (c.auto) autoTotal += c.estimated || 0;
    });
    
    const trip = Storage.getTrip(tripId);
    const tripBudget = trip?.budget || 0;
    
    const header = document.createElement('div');
    header.style.cssText = 'background: linear-gradient(135deg, var(--ios-green), #30b350); color: white; padding: 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(52,199,89,0.3);';
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">Budget total estimé</div>
          <div style="font-size: 36px; font-weight: 700;">${total}€</div>
          ${tripBudget > 0 ? `<div style="font-size: 13px; opacity: 0.8; margin-top: 4px;">Budget initial: ${tripBudget}€</div>` : ''}
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px;">Dépensé</div>
          <div style="font-size: 24px; font-weight: 600; ${spent > total ? 'color: #ffeb3b;' : ''}">${spent}€</div>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.2); height: 6px; border-radius: 3px; overflow: hidden;">
        <div style="background: white; height: 100%; width: ${total > 0 ? Math.min((spent/total)*100, 100) : 0}%; transition: width 0.5s ease;"></div>
      </div>
      ${autoTotal > 0 ? `<div style="margin-top: 12px; font-size: 12px; opacity: 0.9;">🔄 ${autoTotal}€ calculés auto (vols + hôtel)</div>` : ''}
    `;
    container.appendChild(header);
    
    // Récap des sources automatiques
    const transport = Storage.getTransport(tripId);
    const hotel = Storage.getHotel(tripId);
    
    if (transport?.outbound || hotel) {
      const sources = document.createElement('div');
      sources.style.cssText = 'background: white; padding: 16px; border-radius: 12px; margin-bottom: 20px; box-shadow: var(--shadow);';
      sources.innerHTML = `<div style="font-weight: 600; margin-bottom: 12px; font-size: 15px;">📊 Sources du budget</div>`;
      
      if (transport?.outbound) {
        const price = transport.outbound.price || 0;
        sources.innerHTML += `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f2f2f7;">
            <div style="display: flex; align-items: center; gap: 8px;"><span>✈️</span> Vol ${transport.outbound.fromCode}→${transport.outbound.toCode}</div>
            <div style="font-weight: 600; color: var(--ios-blue);">${price}€</div>
          </div>
        `;
      }
      if (transport?.return) {
        sources.innerHTML += `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f2f2f7;">
            <div style="display: flex; align-items: center; gap: 8px;"><span>🔄</span> Vol retour ${transport.return.fromCode}→${transport.return.toCode}</div>
            <div style="font-size: 12px; color: var(--text-tertiary);">inclus dans le prix total</div>
          </div>
        `;
      }
      if (hotel) {
        sources.innerHTML += `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
            <div style="display: flex; align-items: center; gap: 8px;"><span>🏨</span> ${hotel.name}</div>
            <div style="font-weight: 600; color: var(--ios-orange);">${hotel.price || 0}€</div>
          </div>
        `;
      }
      container.appendChild(sources);
    }
    
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px;';
    Object.entries(this.categories).forEach(([key, icon]) => {
      const cat = budget.categories?.[key] || { estimated: 0, spent: 0 };
      const percent = cat.estimated > 0 ? Math.round((cat.spent || 0) / cat.estimated * 100) : 0;
      const isAuto = cat.auto ? '🔄 ' : '';
      grid.innerHTML += `
        <div class="card" onclick="Budget.editCategory('${key}')" style="text-align: center; padding: 20px; cursor: pointer; ${cat.auto ? 'border: 2px solid var(--ios-blue);' : ''}">
          <div style="font-size: 32px; margin-bottom: 8px;">${icon}</div>
          <div style="font-size: 13px; color: var(--text-tertiary); margin-bottom: 4px; text-transform: capitalize;">${isAuto}${key}</div>
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
    const isAuto = current.auto;
    
    const estimated = prompt(
      `Budget estimé pour ${key}${isAuto ? ' (🔄 auto)' : ''} (€):`, 
      current.estimated || 0
    );
    if (estimated === null) return;
    
    const spent = prompt('Déjà dépensé (€):', current.spent || 0);
    if (spent === null) return;
    
    budget.categories[key] = { 
      estimated: parseFloat(estimated) || 0,
      spent: parseFloat(spent) || 0,
      auto: isAuto // Garder le flag auto
    };
    Storage.saveBudget(Router.currentTripId, budget);
    Router.renderPage();
  },
  
  addExpense() {
    const categories = Object.keys(this.categories);
    const choice = prompt('Catégorie:\n' + categories.map((c, i) => `${i+1}. ${c}`).join('\n') + '\n\nNuméro:');
    const idx = parseInt(choice) - 1;
    if (idx >= 0 && idx < categories.length) {
      this.editCategory(categories[idx]);
    }
  }
};

// Page Budget
const BudgetPage = {
  render(container, tripId) {
    const header = document.createElement('div');
    header.className = 'page-header animate-fade-in';
    header.innerHTML = `
      <button class="back-btn" onclick="Router.navigate('overview', '${tripId}')">←</button>
      <h1 class="page-title">💰 Budget</h1>
    `;
    container.appendChild(header);
    
    Budget.render(container, tripId);
  }
};

// Composant: Checklist
const Checklist = {
  categories: {
    preparation: { icon: '📝', title: 'Préparation' },
    reservations: { icon: '📅', title: 'Réservations' },
    bagage: { icon: '🎒', title: 'Bagage' },
    documents: { icon: '📄', title: 'Documents' },
    avantDepart: { icon: '⏰', title: 'Avant le départ' }
  },
  
  render(container, tripId) {
    const checklist = Storage.getChecklist(tripId);
    
    const header = document.createElement('div');
    header.className = 'page-header animate-fade-in';
    header.innerHTML = `
      <button class="back-btn" onclick="Router.navigate('overview', '${tripId}')">←</button>
      <h1 class="page-title">✅ Checklist</h1>
    `;
    container.appendChild(header);
    
    Object.entries(this.categories).forEach(([key, info], i) => {
      const section = document.createElement('div');
      section.className = 'card animate-fade-in';
      section.style.animationDelay = `${i * 0.05}s`;
      section.style.marginBottom = '16px';
      
      const items = checklist[key] || [];
      const checked = items.filter(item => item.checked).length;
      const total = items.length;
      const progress = total > 0 ? Math.round(checked / total * 100) : 0;
      
      let itemsHtml = '';
      if (items.length === 0) {
        itemsHtml = '<div style="color: var(--text-tertiary); font-size: 14px; padding: 8px 0;">Aucun élément</div>';
      } else {
        itemsHtml = items.map((item, idx) => `
          <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0; ${idx < items.length - 1 ? 'border-bottom: 1px solid #f2f2f7;' : ''}">
            <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="Checklist.toggleItem('${key}', ${idx})" style="width: 20px; height: 20px; accent-color: var(--ios-blue);">
            <span style="${item.checked ? 'text-decoration: line-through; color: var(--text-tertiary);' : ''}">${item.text}</span>
            <button onclick="Checklist.deleteItem('${key}', ${idx})" style="margin-left: auto; background: none; border: none; color: var(--ios-red); cursor: pointer; font-size: 16px;">×</button>
          </div>
        `).join('');
      }
      
      section.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-weight: 700; font-size: 16px;">${info.icon} ${info.title}</div>
          <div style="font-size: 13px; color: var(--text-tertiary);">${checked}/${total}</div>
        </div>
        <div style="background: #f8f9fa; height: 4px; border-radius: 2px; margin-bottom: 12px; overflow: hidden;">
          <div style="background: var(--ios-blue); height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
        </div>
        ${itemsHtml}
        <button class="btn-secondary" onclick="Checklist.addItemToCategory('${key}')" style="margin-top: 12px; width: 100%;">+ Ajouter</button>
      `;
      container.appendChild(section);
    });
    
    document.getElementById('fab-btn').onclick = () => this.addItem();
  },
  
  addItem() {
    const cats = Object.keys(this.categories);
    const choice = prompt('Catégorie:\n' + cats.map((c, i) => `${i+1}. ${this.categories[c].title}`).join('\n') + '\n\nNuméro:');
    const idx = parseInt(choice) - 1;
    if (idx >= 0 && idx < cats.length) {
      this.addItemToCategory(cats[idx]);
    }
  },
  
  addItemToCategory(category) {
    const text = prompt('Nouvel élément:');
    if (!text) return;
    const checklist = Storage.getChecklist(Router.currentTripId);
    if (!checklist[category]) checklist[category] = [];
    checklist[category].push({ text, checked: false });
    Storage.saveChecklist(Router.currentTripId, checklist);
    Router.renderPage();
  },
  
  toggleItem(category, index) {
    const checklist = Storage.getChecklist(Router.currentTripId);
    if (checklist[category] && checklist[category][index]) {
      checklist[category][index].checked = !checklist[category][index].checked;
      Storage.saveChecklist(Router.currentTripId, checklist);
      Router.renderPage();
    }
  },
  
  deleteItem(category, index) {
    const checklist = Storage.getChecklist(Router.currentTripId);
    if (checklist[category]) {
      checklist[category].splice(index, 1);
      Storage.saveChecklist(Router.currentTripId, checklist);
      Router.renderPage();
    }
  }
};

const ChecklistPage = {
  render(container, tripId) {
    Checklist.render(container, tripId);
  }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page === 'home') Router.navigate('home');
      else if (Router.currentTripId) Router.navigate(page, Router.currentTripId);
    });
  });
  
  // Premier rendu
  Router.renderPage();
});

