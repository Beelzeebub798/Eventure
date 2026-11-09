// Modal Handlers & Payments
function openBookingModal(eventId) {
  activeBookingEvent = eventsData.find(e => e.id === eventId);
  if(!activeBookingEvent) return;

  document.getElementById('book-modal-title').innerText = activeBookingEvent.title;
  document.getElementById('book-modal-date').innerText = activeBookingEvent.date;
  document.getElementById('book-modal-venue').innerText = activeBookingEvent.venue;
  document.getElementById('book-modal-qty').innerText = "1";
  
  calculateBookingTotal();
  document.getElementById('modal-booking').classList.remove('hidden');
}

function adjustTicketQty(delta) {
  const qtyEl = document.getElementById('book-modal-qty');
  let curr = parseInt(qtyEl.innerText) + delta;
  if(curr < 1) curr = 1;
  qtyEl.innerText = curr;
  calculateBookingTotal();
}

function calculateBookingTotal() {
  if(!activeBookingEvent) return;
  const select = document.getElementById('book-modal-tier');
  const price = parseInt(select.options[select.selectedIndex].getAttribute('data-price'));
  const qty = parseInt(document.getElementById('book-modal-qty').innerText);
  document.getElementById('book-modal-total').innerText = `₱${price * qty}`;
}

function processPayment() {
  const select = document.getElementById('book-modal-tier');
  const tier = select.value;
  const price = parseInt(select.options[select.selectedIndex].getAttribute('data-price'));
  const qty = parseInt(document.getElementById('book-modal-qty').innerText);
  const total = price * qty;
  const payMethod = document.querySelector('input[name="pay-method"]:checked').value;
  const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const newBooking = {
    id: "TKT-" + Math.floor(1000 + Math.random() * 9000),
    registrationId: "REG-" + Date.now(),
    transactionId,
    eventId: activeBookingEvent.id,
    eventTitle: activeBookingEvent.title,
    date: activeBookingEvent.date,
    qty: qty,
    tier: tier,
    total: total,
    code: "EVT-" + Math.floor(100000 + Math.random() * 900000),
    status: "Confirmed"
  };

  userBookings.unshift(newBooking);
  registrationsData.unshift({
    id: newBooking.registrationId,
    eventId: activeBookingEvent.id,
    name: currentUser.name,
    email: currentUser.email,
    qty,
    status: "Confirmed",
    date: new Date().toISOString().slice(0, 10),
    transactionId,
    paymentStatus: "Paid",
    paymentAmount: total,
    paymentMethod: payMethod
  });
  const registrationSaved = saveRegisteredPeople();

  addTransactionActivity(registrationsData[0], 'Reserved', { amount: total, status: 'Reserved' });
  addTransactionActivity(registrationsData[0], 'Payment', {
    id: transactionId,
    amount: total,
    method: payMethod,
    status: 'Completed'
  });
  const transactionsSaved = saveTransactionHistory();

  closeModal('modal-booking');
  renderAll();
  openTicketModal(newBooking.id);
  if (registrationSaved && transactionsSaved) {
    showToast(`${currentUser.name} booked ${qty} ${tier} ticket${qty === 1 ? '' : 's'} for "${activeBookingEvent.title}" and completed payment`, "success");
  } else {
    showToast(`Booking completed, but its registration or transaction history could not be saved in this browser.`, 'error');
  }
}

// Open QR Code Ticket Modal
function openTicketModal(bookingId) {
  const booking = userBookings.find(b => b.id === bookingId);
  if(!booking) return;

  document.getElementById('ticket-modal-title').innerText = booking.eventTitle;
  document.getElementById('ticket-modal-date').innerText = booking.date;
  document.getElementById('ticket-user-name').innerText = currentUser.name;
  document.getElementById('ticket-qty-str').innerText = `${booking.qty} x ${booking.tier}`;
  document.getElementById('ticket-code-str').innerText = booking.code;

  // Draw SVG Pattern for QR Code
  const qrSvg = document.getElementById('qr-code-svg');
  qrSvg.innerHTML = `
    <rect width="100" height="100" fill="#ffffff" />
    <!-- Corner Markers -->
    <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
    <rect x="8" y="8" width="19" height="19" fill="#ffffff" />
    <rect x="12" y="12" width="11" height="11" fill="#0f172a" />

    <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
    <rect x="73" y="8" width="19" height="19" fill="#ffffff" />
    <rect x="77" y="12" width="11" height="11" fill="#0f172a" />

    <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
    <rect x="8" y="73" width="19" height="19" fill="#ffffff" />
    <rect x="12" y="77" width="11" height="11" fill="#0f172a" />

    <!-- Random Matrix Pattern -->
    <rect x="35" y="10" width="8" height="8" fill="#0f172a"/>
    <rect x="48" y="10" width="8" height="8" fill="#0f172a"/>
    <rect x="35" y="25" width="8" height="8" fill="#0f172a"/>
    <rect x="48" y="25" width="15" height="8" fill="#0f172a"/>
    <rect x="10" y="38" width="8" height="15" fill="#0f172a"/>
    <rect x="25" y="45" width="15" height="8" fill="#0f172a"/>
    <rect x="45" y="45" width="10" height="10" fill="#0f172a"/>
    <rect x="60" y="38" width="8" height="20" fill="#0f172a"/>
    <rect x="75" y="45" width="15" height="8" fill="#0f172a"/>
    <rect x="40" y="65" width="15" height="15" fill="#0f172a"/>
    <rect x="60" y="70" width="10" height="10" fill="#0f172a"/>
    <rect x="75" y="75" width="15" height="15" fill="#0f172a"/>
  `;

  document.getElementById('modal-ticket').classList.remove('hidden');
}
