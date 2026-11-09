// Global Modal Helper Functions
const appNotifications = [];
let unreadNotificationCount = 0;

function toggleProfileMenu() {
  const menu = document.getElementById('profile-dropdown-menu');
  const toggle = document.getElementById('profile-dropdown-toggle');
  const chevron = document.getElementById('profile-dropdown-chevron');
  const isOpening = menu.classList.contains('hidden');

  menu.classList.toggle('hidden', !isOpening);
  toggle.setAttribute('aria-expanded', String(isOpening));
  chevron.classList.toggle('rotate-180', isOpening);
}

function toggleNotificationMenu() {
  const menu = document.getElementById('notification-dropdown-menu');
  const toggle = document.getElementById('notification-dropdown-toggle');
  const isOpening = menu.classList.contains('hidden');

  menu.classList.toggle('hidden', !isOpening);
  toggle.setAttribute('aria-expanded', String(isOpening));

  if (isOpening) {
    unreadNotificationCount = 0;
    updateNotificationBadge();
  }
}

function closeNotificationMenu() {
  const menu = document.getElementById('notification-dropdown-menu');
  const toggle = document.getElementById('notification-dropdown-toggle');

  menu.classList.add('hidden');
  toggle.setAttribute('aria-expanded', 'false');
}

function renderNotifications() {
  const list = document.getElementById('notification-list');
  const emptyState = document.getElementById('notification-empty');
  list.replaceChildren();

  if (appNotifications.length === 0) {
    list.appendChild(emptyState);
    return;
  }

  appNotifications.forEach(notification => {
    const item = document.createElement('div');
    item.className = 'flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-gray-50';

    const icon = document.createElement('i');
    icon.dataset.lucide = notification.type === 'success' ? 'circle-check' : notification.type === 'error' ? 'circle-alert' : 'info';
    icon.className = `mt-0.5 h-4 w-4 shrink-0 ${
      notification.type === 'success' ? 'text-emerald-600' : notification.type === 'error' ? 'text-rose-600' : 'text-blue-600'
    }`;

    const message = document.createElement('p');
    message.className = 'text-xs font-medium text-gray-700';
    message.textContent = notification.message;

    item.append(icon, message);
    list.appendChild(item);
  });

  lucide.createIcons();
}

function updateNotificationBadge() {
  const badge = document.getElementById('notification-badge');
  badge.textContent = unreadNotificationCount > 9 ? '9+' : String(unreadNotificationCount);
  badge.classList.toggle('hidden', unreadNotificationCount === 0);
  badge.classList.toggle('flex', unreadNotificationCount > 0);
}

function clearNotifications() {
  appNotifications.length = 0;
  unreadNotificationCount = 0;
  updateNotificationBadge();
  renderNotifications();
}

function closeProfileMenu() {
  const menu = document.getElementById('profile-dropdown-menu');
  const toggle = document.getElementById('profile-dropdown-toggle');
  const chevron = document.getElementById('profile-dropdown-chevron');

  menu.classList.add('hidden');
  toggle.setAttribute('aria-expanded', 'false');
  chevron.classList.remove('rotate-180');
}

document.addEventListener('click', event => {
  if (!document.getElementById('profile-dropdown').contains(event.target)) closeProfileMenu();
  if (!document.getElementById('notification-dropdown').contains(event.target)) closeNotificationMenu();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeProfileMenu();
    closeNotificationMenu();
  }
});

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function showToast(msg, type = 'info') {
  if (msg === 'No new notifications') {
    toggleNotificationMenu();
    return;
  }

  appNotifications.unshift({ message: msg, type });
  appNotifications.length = Math.min(appNotifications.length, 20);
  if (document.getElementById('notification-dropdown-menu').classList.contains('hidden')) {
    unreadNotificationCount += 1;
  }
  updateNotificationBadge();
  renderNotifications();
}
