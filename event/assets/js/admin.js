// ADMIN EVENTS MANAGEMENT (Image 3 & PDF specs)
function renderAdminEvents() {
  // Metric counters
  document.getElementById('metric-total').innerText = eventsData.length;
  document.getElementById('metric-upcoming').innerText = eventsData.filter(e => e.status === 'Upcoming').length;
  document.getElementById('metric-ongoing').innerText = eventsData.filter(e => e.status === 'Ongoing').length;
  document.getElementById('metric-completed').innerText = eventsData.filter(e => e.status === 'Completed').length;
  document.getElementById('metric-canceled').innerText = eventsData.filter(e => e.status === 'Canceled').length;

  const categoryFilter = document.getElementById('admin-event-category-filter');
  const selectedCategory = categoryFilter?.value || 'all';
  if (categoryFilter) {
    categoryFilter.replaceChildren(new Option('All categories', 'all'));
    [...new Set(eventsData.map(event => event.category).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
      .forEach(category => categoryFilter.add(new Option(category, category)));
    categoryFilter.value = [...categoryFilter.options].some(option => option.value === selectedCategory)
      ? selectedCategory
      : 'all';
  }
  const visibleEvents = eventsData.filter(event =>
    !categoryFilter || categoryFilter.value === 'all' || event.category === categoryFilter.value
  );
  const filterCount = document.getElementById('admin-events-filter-count');
  if (filterCount) {
    filterCount.textContent = `Showing ${visibleEvents.length} of ${eventsData.length} events`;
  }

  // Table body
  const tbody = document.getElementById('admin-events-table-body');
  tbody.innerHTML = visibleEvents.length ? visibleEvents.map(ev => `
    <tr class="hover:bg-gray-50 transition">
      <td class="px-6 py-4 flex items-center gap-3">
        <img src="${ev.image}" class="w-10 h-10 rounded-xl object-cover" />
        <div>
          <p class="font-bold text-gray-900">${ev.title}</p>
          <p class="text-xs text-gray-400">${ev.tagline}</p>
        </div>
      </td>
      <td class="px-6 py-4 font-semibold text-xs text-gray-600">${ev.category}</td>
      <td class="px-6 py-4 text-xs text-gray-600">${ev.venue}</td>
      <td class="px-6 py-4 text-xs text-gray-600">${ev.date}</td>
      <td class="px-6 py-4 font-bold text-gray-900">₱${ev.price}</td>
      <td class="px-6 py-4">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
          ev.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
          ev.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
          ev.status === 'Ongoing' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
        }">${ev.status}</span>
      </td>
      <td class="px-6 py-4 text-right space-x-2">
        <button onclick="viewEventRegistrations(${ev.id})" class="text-emerald-600 hover:text-emerald-800 font-bold text-xs">Registrations</button>
        <button onclick="editAdminEvent(${ev.id})" class="text-blue-600 hover:text-blue-800 font-bold text-xs">Edit</button>
        <button onclick="deleteAdminEvent(${ev.id})" class="text-red-500 hover:text-red-700 font-bold text-xs">Delete</button>
      </td>
    </tr>
  `).join('') : `
    <tr>
      <td colspan="7" class="px-6 py-10 text-center text-sm text-gray-500">No events found in this category.</td>
    </tr>
  `;

  // Admin Dashboard Row List (Matching Image 3)
  const dashList = document.getElementById('admin-dashboard-events-list');
  dashList.innerHTML = eventsData.slice(0, 3).map(ev => `
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200/70 gap-3">
      <div class="flex items-center gap-3">
        <img src="${ev.image}" class="w-12 h-12 rounded-xl object-cover" />
        <div>
          <h4 class="font-bold text-gray-900 text-sm leading-tight">${ev.title}</h4>
          <p class="text-xs text-gray-500">${ev.tagline}</p>
        </div>
      </div>
      <div class="flex items-center gap-4 text-xs text-gray-500">
        <span><i data-lucide="map-pin" class="w-3.5 h-3.5 inline text-gray-400"></i> ${ev.venue}</span>
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
          ev.status === 'Canceled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
        }">${ev.status}</span>
      </div>
    </div>
  `).join('');
}

const registrationStatuses = ['Pending confirmation', 'Confirmed', 'Canceled'];

function loadRegisteredPeople() {
  try {
    const savedRegistrations = localStorage.getItem('eventure-registrations');
    if (!savedRegistrations) return;
    const registrations = JSON.parse(savedRegistrations);
    const valid = Array.isArray(registrations) && registrations.every(registration =>
      registration &&
      typeof registration.id === 'string' &&
      Number.isInteger(registration.eventId) &&
      typeof registration.name === 'string' &&
      typeof registration.email === 'string' &&
      Number.isInteger(registration.qty) &&
      registration.qty > 0 &&
      registrationStatuses.includes(registration.status) &&
      typeof registration.date === 'string' &&
      (registration.transactionId === undefined || typeof registration.transactionId === 'string') &&
      (registration.paymentStatus === undefined || typeof registration.paymentStatus === 'string') &&
      (registration.paymentAmount === undefined || typeof registration.paymentAmount === 'number') &&
      (registration.paymentMethod === undefined || typeof registration.paymentMethod === 'string')
    );
    if (!valid) throw new Error('Saved registrations have an invalid format.');
    registrationsData = registrations;

    registrationsData.forEach(registration => {
      let payment = transactionLogs.find(transaction =>
        transaction.id === registration.transactionId ||
        transaction.registrationId === registration.id
      );
      if (!payment) {
        const event = eventsData.find(item => item.id === registration.eventId);
        payment = transactionLogs.find(transaction =>
          transaction.user === registration.name &&
          event &&
          transaction.event === event.title
        );
        if (payment) registration.transactionId = payment.id;
      }
      if (payment) {
        registration.paymentStatus = payment.status.toLowerCase() === 'completed' ? 'Paid' : payment.status;
        registration.paymentAmount = Number(payment.amount);
        registration.paymentMethod = payment.method;
      }
      if (registration.status === 'Confirmed' && registration.paymentStatus !== 'Paid') {
        registration.status = 'Pending confirmation';
      }
    });
  } catch (error) {
    console.error('Unable to load saved event registrations.', error);
    showToast('Saved registrations could not be loaded.', 'error');
  }
}

function getRegistrationPayment(registration) {
  const transaction = transactionLogs.find(item =>
    item.id === registration.transactionId ||
    item.registrationId === registration.id
  );
  if (transaction) {
    return {
      status: transaction.status.toLowerCase() === 'completed' ? 'Paid' : transaction.status,
      id: transaction.id,
      amount: Number(transaction.amount),
      method: transaction.method
    };
  }
  if (registration.paymentStatus === 'Paid') {
    return {
      status: 'Paid',
      id: registration.transactionId,
      amount: registration.paymentAmount,
      method: registration.paymentMethod
    };
  }
  return null;
}

function saveRegisteredPeople() {
  try {
    localStorage.setItem('eventure-registrations', JSON.stringify(registrationsData));
    return true;
  } catch (error) {
    console.error('Unable to save event registrations.', error);
    showToast('Registration changes could not be saved in this browser.', 'error');
    return false;
  }
}

function viewEventRegistrations(eventId) {
  switchView('admin-registrations');
  document.getElementById('registration-event-filter').value = String(eventId);
  renderRegistrations();
}

function renderRegistrations() {
  const eventFilter = document.getElementById('registration-event-filter');
  const previousEvent = eventFilter.value;
  eventFilter.replaceChildren(new Option('All events', 'all'));
  eventsData.forEach(event => eventFilter.add(new Option(event.title, String(event.id))));
  eventFilter.value = [...eventFilter.options].some(option => option.value === previousEvent) ? previousEvent : 'all';

  const selectedEventId = eventFilter.value;
  const selectedStatus = document.getElementById('registration-status-filter').value;
  const eventRegistrations = registrationsData.filter(registration =>
    selectedEventId === 'all' || registration.eventId === Number(selectedEventId)
  );
  const countPeople = status => eventRegistrations
    .filter(registration => !status || registration.status === status)
    .reduce((total, registration) => total + registration.qty, 0);

  document.getElementById('registration-total-count').textContent = String(countPeople());
  document.getElementById('registration-confirmed-count').textContent = String(countPeople('Confirmed'));
  document.getElementById('registration-pending-count').textContent = String(countPeople('Pending confirmation'));
  document.getElementById('registration-canceled-count').textContent = String(countPeople('Canceled'));
  const selectedEvent = eventsData.find(event => String(event.id) === selectedEventId);
  document.getElementById('registration-summary-caption').textContent =
    `${selectedEvent ? selectedEvent.title : 'All events'} · Counts reflect people, not registration records.`;

  const body = document.getElementById('registrations-table-body');
  body.replaceChildren();
  const visibleRegistrations = registrationsData
    .filter(registration =>
      (selectedEventId === 'all' || registration.eventId === Number(selectedEventId)) &&
      (selectedStatus === 'all' || registration.status === selectedStatus)
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!visibleRegistrations.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'px-5 py-10 text-center text-sm text-gray-500';
    cell.textContent = 'No registrations match these filters.';
    row.appendChild(cell);
    body.appendChild(row);
    lucide.createIcons();
    return;
  }

  visibleRegistrations.forEach(registration => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';
    const attendee = document.createElement('td');
    attendee.className = 'px-5 py-4';
    const name = document.createElement('p');
    name.className = 'font-semibold text-gray-900';
    name.textContent = registration.name;
    const email = document.createElement('p');
    email.className = 'mt-0.5 text-xs text-gray-500';
    email.textContent = registration.email;
    attendee.append(name, email);

    const eventCell = document.createElement('td');
    eventCell.className = 'px-5 py-4 text-gray-700';
    eventCell.textContent = eventsData.find(event => event.id === registration.eventId)?.title || 'Event removed';
    const people = document.createElement('td');
    people.className = 'px-5 py-4 text-gray-700';
    people.textContent = String(registration.qty);
    const date = document.createElement('td');
    date.className = 'px-5 py-4 text-gray-500';
    date.textContent = registration.date;
    const payment = getRegistrationPayment(registration);
    const isPaid = payment?.status === 'Paid';
    const paymentLabel = payment?.status || 'Unpaid';
    const paymentCell = document.createElement('td');
    paymentCell.className = 'px-5 py-4';
    const paymentStatus = document.createElement('span');
    const paymentIsFailed = ['failed', 'canceled', 'cancelled'].includes(paymentLabel.toLowerCase());
    paymentStatus.className = `rounded-full px-2.5 py-1 text-[10px] font-bold ${
      isPaid ? 'bg-emerald-100 text-emerald-700' :
      paymentIsFailed ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
    }`;
    paymentStatus.textContent = paymentLabel;
    paymentCell.appendChild(paymentStatus);
    if (payment?.id) {
      const paymentDetails = document.createElement('p');
      paymentDetails.className = 'mt-1 text-xs text-gray-500';
      paymentDetails.textContent = `${payment.id} · ₱${Number(payment.amount || 0).toLocaleString('en-PH')}`;
      if (payment.method) paymentDetails.textContent += ` · ${payment.method}`;
      paymentCell.appendChild(paymentDetails);
    }

    const statusCell = document.createElement('td');
    statusCell.className = 'px-5 py-4';
    const status = document.createElement('span');
    status.className = `rounded-full px-2.5 py-1 text-[10px] font-bold ${
      registration.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
      registration.status === 'Canceled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
    }`;
    status.textContent = registration.status;
    statusCell.appendChild(status);

    const actions = document.createElement('td');
    actions.className = 'space-x-3 px-5 py-4 text-right';
    if (registration.status === 'Pending confirmation') {
      if (isPaid) {
        const confirm = document.createElement('button');
        confirm.className = 'font-bold text-xs text-emerald-600 hover:text-emerald-800';
        confirm.textContent = 'Confirm';
        confirm.addEventListener('click', () => updateRegistrationStatus(registration.id, 'Confirmed'));
        actions.appendChild(confirm);
      } else {
        const awaitingPayment = document.createElement('span');
        awaitingPayment.className = 'text-xs text-gray-400';
        awaitingPayment.textContent = 'Awaiting payment';
        actions.appendChild(awaitingPayment);
      }
    }
    if (registration.status !== 'Canceled') {
      const cancel = document.createElement('button');
      cancel.className = 'font-bold text-xs text-red-500 hover:text-red-700';
      cancel.textContent = 'Cancel';
      cancel.addEventListener('click', () => updateRegistrationStatus(registration.id, 'Canceled'));
      actions.appendChild(cancel);
    }
    if (!actions.childElementCount) {
      actions.textContent = '—';
      actions.classList.add('text-gray-400');
    }

    row.append(attendee, eventCell, people, date, paymentCell, statusCell, actions);
    body.appendChild(row);
  });
  lucide.createIcons();
}

function updateRegistrationStatus(registrationId, status) {
  if (!registrationStatuses.includes(status)) {
    showToast('Invalid registration status.', 'error');
    return;
  }

  const registration = registrationsData.find(item => item.id === registrationId);
  if (!registration) {
    showToast('Registration could not be found.', 'error');
    return;
  }
  if (status === 'Confirmed') {
    if (getRegistrationPayment(registration)?.status !== 'Paid') {
      showToast('This registration cannot be confirmed until its payment is completed.', 'error');
      return;
    }
  }
  const previousStatus = registration.status;
  registration.status = status;
  const booking = userBookings.find(item => item.registrationId === registrationId);
  if (!saveRegisteredPeople()) {
    registration.status = previousStatus;
    renderRegistrations();
    return;
  }
  if (status === 'Canceled' && previousStatus !== 'Canceled') {
    addTransactionActivity(registration, 'Canceled', { amount: 0 });
    if (!saveTransactionHistory()) {
      transactionLogs.shift();
      registration.status = previousStatus;
      saveRegisteredPeople();
      renderRegistrations();
      return;
    }
  }
  if (booking) booking.status = status;
  renderRegistrations();
  renderBookings();
  showToast(`${registration.name}'s registration was ${status.toLowerCase()}.`, 'success');
}

function openCreateEventModal() {
  document.getElementById('event-form-id').value = "";
  document.getElementById('eventForm').reset();
  document.getElementById('modal-admin-event').classList.remove('hidden');
}

function editAdminEvent(id) {
  const ev = eventsData.find(e => e.id === id);
  if(!ev) return;

  document.getElementById('event-form-id').value = ev.id;
  document.getElementById('event-form-title').value = ev.title;
  document.getElementById('event-form-category').value = ev.category;
  document.getElementById('event-form-price').value = ev.price;
  document.getElementById('event-form-date').value = ev.date;
  document.getElementById('event-form-venue').value = ev.venue;
  document.getElementById('event-form-status').value = ev.status;
  document.getElementById('event-form-img').value = ev.image;

  document.getElementById('modal-admin-event').classList.remove('hidden');
}

function saveAdminEvent(e) {
  e.preventDefault();
  const id = document.getElementById('event-form-id').value;
  const title = document.getElementById('event-form-title').value;
  const category = document.getElementById('event-form-category').value;
  const price = parseInt(document.getElementById('event-form-price').value);
  const date = document.getElementById('event-form-date').value;
  const venue = document.getElementById('event-form-venue').value;
  const status = document.getElementById('event-form-status').value;
  const image = document.getElementById('event-form-img').value || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80";

  if(id) {
    // Edit existing
    const ev = eventsData.find(e => e.id === parseInt(id));
    if(ev) {
      ev.title = title; ev.category = category; ev.price = price;
      ev.date = date; ev.venue = venue; ev.status = status; ev.image = image;
      showToast(`${currentUser.name} updated event "${title}"`, "success");
    }
  } else {
    // Create new
    eventsData.push({
      id: Date.now(),
      title: title,
      tagline: "Custom Organized Event",
      date: date,
      time: "7:00 PM - 10:00 PM",
      venue: venue,
      category: category,
      price: price,
      status: status,
      image: image
    });
    showToast(`${currentUser.name} created event "${title}"`, "success");
  }

  closeModal('modal-admin-event');
  renderAll();
}

function deleteAdminEvent(id) {
  const event = eventsData.find(item => item.id === id);
  if (!event) return;
  eventsData = eventsData.filter(e => e.id !== id);
  showToast(`${currentUser.name} deleted event "${event.title}"`, "info");
  renderAll();
}

// ADMIN TRANSACTION LOGS
function renderTransactions() {
  const tbody = document.getElementById('transactions-table-body');
  tbody.innerHTML = transactionLogs.map(t => `
    <tr class="hover:bg-gray-50 font-medium">
      <td class="px-6 py-4 font-mono text-xs text-blue-600 font-bold">${t.id}</td>
      <td class="px-6 py-4 text-xs text-gray-900 font-bold">${t.user}</td>
      <td class="px-6 py-4 text-xs text-gray-600">${t.event}</td>
      <td class="px-6 py-4 text-xs font-black text-gray-900">₱${t.amount}</td>
      <td class="px-6 py-4 text-xs text-gray-500">${t.method || '—'}</td>
      <td class="px-6 py-4">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
          t.activity === 'Canceled' || t.status === 'Canceled' ? 'bg-red-100 text-red-700' :
          t.activity === 'Reserved' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
        }">${t.activity || (t.status === 'Completed' ? 'Payment' : t.status)} · ${t.status}</span>
      </td>
      <td class="px-6 py-4 text-xs text-gray-400">${t.date}</td>
    </tr>
  `).join('');
}

// Search Filter Trigger
function handleSearch(query) {
  const q = query.toLowerCase();
  renderEventsGrid('All');
}

const reportCurrencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0
});

const transactionActivities = ['Reserved', 'Payment', 'Canceled'];

function loadTransactionHistory() {
  try {
    const savedTransactions = localStorage.getItem('eventure-transactions');
    if (!savedTransactions) return;

    const transactions = JSON.parse(savedTransactions);
    const valid = Array.isArray(transactions) && transactions.every(transaction =>
      transaction &&
      typeof transaction.id === 'string' &&
      typeof transaction.user === 'string' &&
      typeof transaction.event === 'string' &&
      typeof transaction.status === 'string' &&
      typeof transaction.date === 'string' &&
      Number.isFinite(Number(transaction.amount)) &&
      (transaction.activity === undefined || transactionActivities.includes(transaction.activity)) &&
      (transaction.registrationId === undefined || typeof transaction.registrationId === 'string') &&
      (transaction.method === undefined || typeof transaction.method === 'string')
    );
    if (!valid) throw new Error('Saved transaction history has an invalid format.');
    transactionLogs = transactions;
  } catch (error) {
    console.error('Unable to load transaction history.', error);
    showToast('Saved transaction history could not be loaded.', 'error');
  }
}

function saveTransactionHistory() {
  try {
    localStorage.setItem('eventure-transactions', JSON.stringify(transactionLogs));
    return true;
  } catch (error) {
    console.error('Unable to save transaction history.', error);
    showToast('Transaction activity could not be saved in this browser.', 'error');
    return false;
  }
}

function addTransactionActivity(registration, activity, details = {}) {
  const timestamp = new Date();
  const entry = {
    id: details.id || `${activity === 'Payment' ? 'TXN' : 'ACT'}-${timestamp.getTime()}-${Math.floor(Math.random() * 1000)}`,
    registrationId: registration.id,
    user: registration.name,
    event: eventsData.find(event => event.id === registration.eventId)?.title || 'Event removed',
    activity,
    amount: Number(details.amount ?? registration.paymentAmount ?? 0),
    method: details.method ?? registration.paymentMethod ?? '',
    status: details.status || (activity === 'Payment' ? 'Completed' : activity),
    date: timestamp.toISOString().slice(0, 16).replace('T', ' ')
  };
  transactionLogs.unshift(entry);
  return entry;
}

function getTransactionHistoryForReport() {
  const period = document.getElementById('report-period')?.value || '30';
  const now = new Date();
  const startDate = period === 'all' ? null : new Date(now);
  const endDate = period === 'all' ? null : new Date(now);

  if (startDate) {
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - Number(period) + 1);
    endDate.setHours(23, 59, 59, 999);
  }

  return transactionLogs
    .map(transaction => {
      const date = new Date(transaction.date.replace(' ', 'T'));
      return {
        ...transaction,
        activity: transaction.activity || (transaction.status.toLowerCase() === 'completed' ? 'Payment' : 'Transaction'),
        parsedDate: Number.isNaN(date.getTime()) ? null : date
      };
    })
    .filter(transaction => !startDate || (
      transaction.parsedDate &&
      transaction.parsedDate >= startDate &&
      transaction.parsedDate <= endDate
    ));
}

function getCompletedTransactionsForReport() {
  return getTransactionHistoryForReport().filter(transaction =>
    transaction.activity === 'Payment' &&
    transaction.status.toLowerCase() === 'completed'
  );
}

function renderReports() {
  const history = getTransactionHistoryForReport();
  const transactions = history.filter(transaction =>
    transaction.activity === 'Payment' &&
    transaction.status.toLowerCase() === 'completed'
  );
  const totalRevenue = transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const averageTransaction = transactions.length ? totalRevenue / transactions.length : 0;
  const eventPerformance = new Map();
  const paymentMethods = new Map();

  transactions.forEach(transaction => {
    const event = eventPerformance.get(transaction.event) || { name: transaction.event, count: 0, revenue: 0 };
    event.count += 1;
    event.revenue += Number(transaction.amount || 0);
    eventPerformance.set(transaction.event, event);

    const method = transaction.method || 'Other';
    paymentMethods.set(method, (paymentMethods.get(method) || 0) + 1);
  });

  const sortedEvents = [...eventPerformance.values()].sort((a, b) => b.revenue - a.revenue);
  document.getElementById('report-total-revenue').textContent = reportCurrencyFormatter.format(totalRevenue);
  document.getElementById('report-transaction-count').textContent = String(transactions.length);
  document.getElementById('report-average-transaction').textContent = reportCurrencyFormatter.format(averageTransaction);
  document.getElementById('report-top-event').textContent = sortedEvents[0]?.name || '—';
  document.getElementById('report-top-event-revenue').textContent =
    `${reportCurrencyFormatter.format(sortedEvents[0]?.revenue || 0)} revenue`;

  const period = document.getElementById('report-period').value;
  document.getElementById('report-period-caption').textContent = period === 'all'
    ? `Showing ${history.length} activity records, including ${transactions.length} completed payments.`
    : `Showing activity from the last ${period === '30' ? '30 days' : '12 months'} (${history.length} records, ${transactions.length} completed payments).`;

  renderRevenueChart(transactions, period);
  renderPaymentMethodBreakdown(paymentMethods, transactions.length);
  renderEventPerformance(sortedEvents);
  renderTransactionActivity(history);
  lucide.createIcons();
}

function renderTransactionActivity(history) {
  const activityFilter = document.getElementById('report-activity-filter').value;
  const activities = activityFilter === 'all'
    ? history
    : history.filter(transaction => transaction.activity === activityFilter);
  const body = document.getElementById('report-activity-table-body');
  body.replaceChildren();
  document.getElementById('report-activity-count').textContent =
    `Showing ${activities.length} of ${history.length} activity records.`;

  if (!activities.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'px-5 py-8 text-center text-sm text-gray-500';
    cell.textContent = 'No activity found for this period and filter.';
    row.appendChild(cell);
    body.appendChild(row);
    return;
  }

  activities.sort((a, b) => (b.parsedDate?.getTime() || 0) - (a.parsedDate?.getTime() || 0))
    .forEach(transaction => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-50';
      const values = [
        transaction.date,
        transaction.user,
        transaction.event,
        transaction.activity,
        transaction.activity === 'Payment'
          ? reportCurrencyFormatter.format(transaction.amount)
          : transaction.activity === 'Reserved'
            ? `${reportCurrencyFormatter.format(transaction.amount)} · not yet revenue`
            : '—',
        transaction.id
      ];
      values.forEach((value, index) => {
        const cell = document.createElement('td');
        cell.className = `px-5 py-3 ${index === 5 ? 'font-mono text-xs text-gray-500' : 'text-gray-700'} ${index === 3 ? 'font-semibold' : ''}`;
        cell.textContent = value;
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
}

function renderRevenueChart(transactions, period) {
  const chart = document.getElementById('report-revenue-chart');
  const emptyState = document.getElementById('report-revenue-empty');
  chart.replaceChildren();

  const datedTransactions = transactions.filter(transaction => transaction.parsedDate);
  if (!datedTransactions.length) {
    chart.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  chart.classList.remove('hidden');
  const buckets = new Map();

  datedTransactions.forEach(transaction => {
    const date = transaction.parsedDate;
    let key;
    let label;
    if (period === '30') {
      const daysAgo = Math.floor((Date.now() - date.getTime()) / 86400000);
      const week = Math.max(0, Math.min(4, Math.floor(daysAgo / 7)));
      key = `week-${week}`;
      label = week === 0 ? 'Days 1–7' : `Days ${week * 7 + 1}–${week === 4 ? 30 : (week + 1) * 7}`;
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      label = date.toLocaleDateString('en', { month: 'short', year: '2-digit' });
    }

    const bucket = buckets.get(key) || { label, revenue: 0, earliest: date };
    bucket.revenue += Number(transaction.amount || 0);
    if (date < bucket.earliest) bucket.earliest = date;
    buckets.set(key, bucket);
  });

  let chartBuckets = [...buckets.values()].sort((a, b) => a.earliest - b.earliest);
  if (period === 'all' && chartBuckets.length > 12) {
    const earlierBuckets = chartBuckets.slice(0, chartBuckets.length - 12);
    chartBuckets = [
      { label: 'Earlier', revenue: earlierBuckets.reduce((sum, bucket) => sum + bucket.revenue, 0) },
      ...chartBuckets.slice(-12)
    ];
  }

  const maximumRevenue = Math.max(...chartBuckets.map(bucket => bucket.revenue), 1);
  chartBuckets.forEach(bucket => {
    const column = document.createElement('div');
    column.className = 'flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2';
    column.title = `${bucket.label}: ${reportCurrencyFormatter.format(bucket.revenue)}`;

    const bar = document.createElement('div');
    bar.className = 'w-full max-w-12 rounded-t-md bg-gradient-to-t from-blue-700 to-blue-400 transition-all';
    bar.style.height = `${Math.max(4, bucket.revenue / maximumRevenue * 85)}%`;

    const label = document.createElement('span');
    label.className = 'w-full truncate text-center text-[10px] font-medium text-gray-500';
    label.textContent = bucket.label;

    column.append(bar, label);
    chart.appendChild(column);
  });
}

function renderPaymentMethodBreakdown(paymentMethods, totalTransactions) {
  const container = document.getElementById('report-payment-methods');
  const emptyState = document.getElementById('report-methods-empty');
  container.replaceChildren();

  if (!totalTransactions) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  [...paymentMethods.entries()].sort((a, b) => b[1] - a[1]).forEach(([method, count]) => {
    const percentage = Math.round(count / totalTransactions * 100);
    const row = document.createElement('div');
    const heading = document.createElement('div');
    heading.className = 'mb-2 flex items-center justify-between text-xs';
    const name = document.createElement('span');
    name.className = 'font-semibold text-gray-700';
    name.textContent = method;
    const share = document.createElement('span');
    share.className = 'font-bold text-gray-900';
    share.textContent = `${percentage}% (${count})`;
    heading.append(name, share);

    const track = document.createElement('div');
    track.className = 'h-2 overflow-hidden rounded-full bg-gray-100';
    const fill = document.createElement('div');
    fill.className = 'h-full rounded-full bg-blue-600';
    fill.style.width = `${percentage}%`;
    track.appendChild(fill);
    row.append(heading, track);
    container.appendChild(row);
  });
}

function renderEventPerformance(events) {
  const body = document.getElementById('report-event-performance');
  body.replaceChildren();

  if (!events.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.className = 'px-5 py-8 text-center text-sm text-gray-500';
    cell.textContent = 'No completed event sales for this period.';
    row.appendChild(cell);
    body.appendChild(row);
    return;
  }

  events.forEach(event => {
    const row = document.createElement('tr');
    const name = document.createElement('td');
    name.className = 'px-5 py-3 font-semibold text-gray-900';
    name.textContent = event.name;
    const count = document.createElement('td');
    count.className = 'px-5 py-3 text-gray-600';
    count.textContent = String(event.count);
    const revenue = document.createElement('td');
    revenue.className = 'px-5 py-3 text-right font-bold text-gray-900';
    revenue.textContent = reportCurrencyFormatter.format(event.revenue);
    row.append(name, count, revenue);
    body.appendChild(row);
  });
}

function exportReportsCsv() {
  const transactions = getTransactionHistoryForReport();
  if (!transactions.length) {
    showToast('There is no transaction activity to export for this period.', 'info');
    return;
  }

  const fields = ['id', 'registrationId', 'user', 'event', 'activity', 'amount', 'method', 'status', 'date'];
  const escapeCsv = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [
    fields.join(','),
    ...transactions.map(transaction => fields.map(field => escapeCsv(transaction[field])).join(','))
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'eventure-transaction-activity.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(`Exported ${transactions.length} transaction activity records`, 'success');
}

// Draw a real event-status breakdown for the admin dashboard.
function renderCharts() {
  const pieCanvas = document.getElementById('adminPieChart');
  if (pieCanvas && pieCanvas.getContext) {
    const ctx = pieCanvas.getContext('2d');
    ctx.clearRect(0, 0, 200, 200);

    const colors = { Upcoming: '#2563eb', Ongoing: '#8b5cf6', Completed: '#10b981', Canceled: '#ef4444' };
    const data = Object.entries(colors).map(([status, color]) => ({
      value: eventsData.filter(event => event.status === status).length,
      color
    })).filter(slice => slice.value > 0);
    const total = data.reduce((sum, slice) => sum + slice.value, 0);
    let startAngle = 0;

    data.forEach(slice => {
      const sliceAngle = (slice.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.arc(100, 100, 80, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(100, 100, 80, 0, 2 * Math.PI);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(100, 100, 35, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  if (!document.getElementById('view-admin-reports').classList.contains('hidden')) renderReports();
}
