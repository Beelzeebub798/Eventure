// Render User Dashboard (Image 2 logic)
function renderUserDashboard() {
  const grid = document.getElementById('featured-events-grid');
  grid.innerHTML = '';

  eventsData.slice(0, 2).forEach(ev => {
    grid.innerHTML += `
      <div class="bg-slate-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition">
        <div>
          <img src="${ev.image}" class="w-full h-32 object-cover" />
          <div class="p-4">
            <h3 class="font-bold text-gray-900 text-base leading-tight">${ev.title}</h3>
            <p class="text-xs text-gray-500 mt-0.5">${ev.tagline}</p>
            <div class="mt-3 space-y-1 text-xs text-gray-600 font-medium">
              <p class="flex items-center gap-1.5"><i data-lucide="calendar" class="w-3.5 h-3.5 text-blue-500"></i> ${ev.date}</p>
              <p class="flex items-center gap-1.5"><i data-lucide="clock" class="w-3.5 h-3.5 text-blue-500"></i> ${ev.time}</p>
            </div>
          </div>
        </div>
        <div class="p-4 pt-0">
          <button onclick="openBookingModal(${ev.id})" class="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl font-bold text-xs transition">
            Book Ticket
          </button>
        </div>
      </div>
    `;
  });

  // Upcoming Event Widget on right sidebar
  const upcomingWidget = document.getElementById('user-upcoming-widget');
  if(userBookings.length > 0) {
    const first = userBookings[0];
    upcomingWidget.innerHTML = `
      <div class="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
        <span class="px-2.5 py-1 bg-blue-500 text-white font-bold text-[10px] rounded-full uppercase">Confirmed Ticket</span>
        <h3 class="font-extrabold text-base leading-tight">${first.eventTitle}</h3>
        <p class="text-xs text-gray-300">${first.date}</p>
        <button onclick="openTicketModal('${first.id}')" class="w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold backdrop-blur-sm transition">
          View Ticket QR
        </button>
      </div>
    `;
  } else {
    upcomingWidget.innerHTML = `<p class="text-xs text-gray-400">No active bookings yet.</p>`;
  }

  // Recent activities list
  const activitiesList = document.getElementById('recent-activities-list');
  activitiesList.innerHTML = userBookings.map(b => `
    <div class="flex items-start gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
      <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
        <i data-lucide="ticket" class="w-4 h-4"></i>
      </div>
      <div>
        <p class="text-xs font-bold text-gray-900">Ticket confirmed for ${b.eventTitle}</p>
        <span class="text-[10px] text-gray-400">Recently booked</span>
      </div>
    </div>
  `).join('');
}

// Render Discover Events Module
function renderEventsGrid(filterCategory = 'All') {
  const grid = document.getElementById('all-events-grid');
  grid.innerHTML = '';

  const filtered = filterCategory === 'All' ? eventsData : eventsData.filter(e => e.category === filterCategory);

  filtered.forEach(ev => {
    const isSaved = savedEventIds.includes(ev.id);
    grid.innerHTML += `
      <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div>
          <div class="relative">
            <img src="${ev.image}" class="w-full h-40 object-cover" />
            <button onclick="toggleBookmark(${ev.id})" class="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:text-blue-600 shadow transition">
              <i data-lucide="bookmark" class="w-4 h-4 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}"></i>
            </button>
            <span class="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-full">
              ${ev.category}
            </span>
          </div>
          <div class="p-5">
            <h3 class="font-bold text-gray-900 text-lg leading-tight">${ev.title}</h3>
            <p class="text-xs text-gray-500 mt-1">${ev.tagline}</p>

            <div class="mt-4 space-y-1.5 text-xs text-gray-600 font-medium">
              <p class="flex items-center gap-2"><i data-lucide="calendar" class="w-4 h-4 text-blue-600"></i> ${ev.date}</p>
              <p class="flex items-center gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-blue-600"></i> ${ev.venue}</p>
              <p class="flex items-center gap-2"><i data-lucide="tag" class="w-4 h-4 text-blue-600"></i> ₱${ev.price} / ticket</p>
            </div>
          </div>
        </div>

        <div class="p-5 pt-0">
          <button onclick="openBookingModal(${ev.id})" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition">
            Reserve Seats & Pay
          </button>
        </div>
      </div>
    `;
  });
  lucide.createIcons();
}

function filterCategory(cat) {
  document.querySelectorAll('.cat-pill').forEach(btn => {
    if(btn.innerText === cat) {
      btn.classList.add('bg-blue-600', 'text-white');
      btn.classList.remove('bg-gray-200', 'text-gray-700');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('bg-gray-200', 'text-gray-700');
    }
  });
  renderEventsGrid(cat);
}

// Toggle Save Later (Bookmarking)
function toggleBookmark(eventId) {
  const event = eventsData.find(item => item.id === eventId);
  if (!event) return;

  if(savedEventIds.includes(eventId)) {
    savedEventIds = savedEventIds.filter(id => id !== eventId);
    showToast(`${currentUser.name} removed "${event.title}" from saved events`, "info");
  } else {
    savedEventIds.push(eventId);
    showToast(`${currentUser.name} saved "${event.title}" for later`, "success");
  }
  renderAll();
}

function renderSavedEvents() {
  const container = document.getElementById('saved-events-grid');
  const savedEvents = eventsData.filter(e => savedEventIds.includes(e.id));
  
  if(savedEvents.length === 0) {
    container.innerHTML = `<p class="text-sm text-gray-500 col-span-full">No saved events yet. Bookmark events to see them here.</p>`;
    return;
  }

  container.innerHTML = savedEvents.map(ev => `
    <div class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-bold text-gray-900">${ev.title}</h3>
          <p class="text-xs text-gray-500">${ev.date} · ${ev.venue}</p>
        </div>
        <button onclick="toggleBookmark(${ev.id})" class="text-red-500 hover:text-red-700">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
      <button onclick="openBookingModal(${ev.id})" class="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
        Book Now
      </button>
    </div>
  `).join('');
}

// Ticket History / Bookings Render
function renderBookings() {
  const container = document.getElementById('bookings-list-container');
  if(userBookings.length === 0) {
    container.innerHTML = `<p class="text-sm text-gray-500">No ticket history found.</p>`;
    return;
  }

  container.replaceChildren();
  userBookings.forEach(booking => {
    const status = registrationsData.find(registration => registration.id === booking.registrationId)?.status || booking.status || 'Confirmed';
    const card = document.createElement('div');
    card.className = 'flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row';

    const details = document.createElement('div');
    details.className = 'flex items-center gap-4';
    const icon = document.createElement('div');
    icon.className = 'flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 font-bold text-blue-600';
    icon.innerHTML = '<i data-lucide="ticket" class="h-6 w-6"></i>';
    const text = document.createElement('div');
    const statusLabel = document.createElement('span');
    statusLabel.className = `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
      status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
      status === 'Canceled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
    }`;
    statusLabel.textContent = status;
    const title = document.createElement('h3');
    title.className = 'text-base font-bold text-gray-900';
    title.textContent = booking.eventTitle;
    const description = document.createElement('p');
    description.className = 'text-xs text-gray-500';
    description.textContent = `${booking.date} · ${booking.tier} (${booking.qty} tickets)`;
    text.append(statusLabel, title, description);
    details.append(icon, text);

    const actions = document.createElement('div');
    actions.className = 'flex items-center gap-4';
    const total = document.createElement('span');
    total.className = 'text-base font-extrabold text-gray-900';
    total.textContent = `₱${booking.total}`;
    actions.appendChild(total);
    if (status === 'Confirmed') {
      const ticketButton = document.createElement('button');
      ticketButton.className = 'rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800';
      ticketButton.textContent = 'View Ticket & QR';
      ticketButton.addEventListener('click', () => openTicketModal(booking.id));
      actions.appendChild(ticketButton);
    }

    card.append(details, actions);
    container.appendChild(card);
  });
  lucide.createIcons();
}
