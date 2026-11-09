// System Data State (Initial mock datasets based on photos & documentation)
let currentUser = null; // { name, role: 'user'|'admin', email }

let eventsData = [
  {
    id: 1,
    title: "Cultural Night",
    tagline: "Different Culture, One Community",
    date: "December 20, 2026",
    time: "7:00 PM - 10:00 PM",
    venue: "Kawit, Cavite",
    category: "Music",
    price: 350,
    status: "Upcoming",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Music Festival",
    tagline: "Different Music, One Taste",
    date: "January 21, 2027",
    time: "7:00 PM - 10:00 PM",
    venue: "Imus, Cavite",
    category: "Music",
    price: 850,
    status: "Upcoming",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "MLBB Tournament",
    tagline: "Different Nation, One Champion",
    date: "January 21, 2027",
    time: "7:00 PM - 10:00 PM",
    venue: "Bacoor, Cavite",
    category: "Gaming",
    price: 250,
    status: "Upcoming",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    title: "Tech Innovation Summit",
    tagline: "Building Tomorrow's Web Today",
    date: "February 15, 2027",
    time: "9:00 AM - 4:00 PM",
    venue: "Dasmarinas, Cavite",
    category: "Seminars",
    price: 500,
    status: "Upcoming",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
  }
];

let userBookings = [
  {
    id: "TKT-8891",
    registrationId: "REG-1001",
    eventId: 3,
    eventTitle: "MLBB Tournament",
    date: "January 21, 2027",
    qty: 1,
    tier: "Standard",
    total: 250,
    code: "EVT-MLBB-9021",
    status: "Confirmed"
  }
];

let registrationsData = [
  { id: "REG-1001", eventId: 3, name: "Patrick", email: "patrick@user.com", qty: 1, status: "Confirmed", date: "2026-10-24", transactionId: "TXN-9021" },
  { id: "REG-1002", eventId: 1, name: "Angela Cruz", email: "angela@example.com", qty: 2, status: "Pending confirmation", date: "2026-11-02" },
  { id: "REG-1003", eventId: 1, name: "Maria Santos", email: "maria@example.com", qty: 1, status: "Pending confirmation", date: "2026-11-01" },
  { id: "REG-1004", eventId: 1, name: "Mark Dela Cruz", email: "mark@example.com", qty: 1, status: "Canceled", date: "2026-10-30" },
  { id: "REG-1005", eventId: 2, name: "Joan Reyes", email: "joan@example.com", qty: 2, status: "Pending confirmation", date: "2026-11-03" },
  { id: "REG-1007", eventId: 2, name: "John Michael", email: "johnmichael@example.com", qty: 1, status: "Confirmed", date: "2026-10-24", transactionId: "TXN-9020" },
  { id: "REG-1006", eventId: 4, name: "Luis Garcia", email: "luis@example.com", qty: 1, status: "Pending confirmation", date: "2026-11-04" }
];

let savedEventIds = [1]; // Bookmarked events

let transactionLogs = [
  { id: "ACT-9021", registrationId: "REG-1001", user: "Patrick", event: "MLBB Tournament", activity: "Reserved", amount: 250, method: "", status: "Reserved", date: "2026-10-24 14:15" },
  { id: "TXN-9021", registrationId: "REG-1001", user: "Patrick", event: "MLBB Tournament", activity: "Payment", amount: 250, method: "GCash", status: "Completed", date: "2026-10-24 14:20" },
  { id: "ACT-9020", registrationId: "REG-1007", user: "John Michael", event: "Music Festival", activity: "Reserved", amount: 850, method: "", status: "Reserved", date: "2026-10-24 11:00" },
  { id: "TXN-9020", registrationId: "REG-1007", user: "John Michael", event: "Music Festival", activity: "Payment", amount: 850, method: "Credit Card", status: "Completed", date: "2026-10-24 11:05" },
  { id: "ACT-1002", registrationId: "REG-1002", user: "Angela Cruz", event: "Cultural Night", activity: "Reserved", amount: 700, method: "", status: "Reserved", date: "2026-11-02 10:15" },
  { id: "ACT-1003", registrationId: "REG-1003", user: "Maria Santos", event: "Cultural Night", activity: "Reserved", amount: 350, method: "", status: "Reserved", date: "2026-11-01 09:30" },
  { id: "ACT-1005", registrationId: "REG-1005", user: "Joan Reyes", event: "Music Festival", activity: "Reserved", amount: 1700, method: "", status: "Reserved", date: "2026-11-03 14:45" },
  { id: "ACT-1006", registrationId: "REG-1006", user: "Luis Garcia", event: "Tech Innovation Summit", activity: "Reserved", amount: 500, method: "", status: "Reserved", date: "2026-11-04 11:20" },
  { id: "ACT-1004", registrationId: "REG-1004", user: "Mark Dela Cruz", event: "Cultural Night", activity: "Canceled", amount: 0, method: "", status: "Canceled", date: "2026-10-30 09:00" }
];

let activeBookingEvent = null;
