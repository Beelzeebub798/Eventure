// Navigation Switcher
function switchView(viewId) {
  if (currentUser?.role === 'admin' && !getAdminRolePermissions(currentUser.adminRole).includes(viewId)) {
    showToast(`${currentUser.adminRole} does not have access to this module.`, 'error');
    return;
  }
  if (currentUser?.role === 'user' && viewId.startsWith('admin-')) {
    showToast('User accounts cannot access admin modules.', 'error');
    return;
  }

  document.querySelectorAll('.view-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('bg-blue-600', 'text-white'));

  const target = document.getElementById('view-' + viewId);
  if(target) target.classList.remove('hidden');

  const navBtn = document.getElementById('nav-' + viewId);
  if(navBtn) navBtn.classList.add('bg-blue-600', 'text-white');

  if(viewId === 'admin-account') showAdminAccountList();
  if(viewId === 'admin-registrations') renderRegistrations();

  // Trigger canvas charts if switching to reports/admin dashboard
  if(viewId === 'admin-dashboard' || viewId === 'admin-reports') {
    setTimeout(renderCharts, 100);
  }
}

// Render Data Across Views
function renderAll() {
  renderUserDashboard();
  renderEventsGrid();
  renderBookings();
  renderSavedEvents();
  renderAdminEvents();
  renderTransactions();
  lucide.createIcons();
}
