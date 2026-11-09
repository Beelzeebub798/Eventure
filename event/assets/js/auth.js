// Quick Fill for demo buttons on Login
function fillLogin(role) {
  if(role === 'user') {
    document.getElementById('loginEmail').value = "patrick@user.com";
    document.getElementById('loginPassword').value = "password123";
  } else {
    document.getElementById('loginEmail').value = "admin@eventure.com";
    document.getElementById('loginPassword').value = "admin123";
  }
}

function continueWithGoogleDemo() {
  fillLogin('user');
  document.getElementById('loginEmail').value = 'patrick@gmail.com';
  document.getElementById('loginForm').requestSubmit();
}

function loginAsAdminDemo() {
  fillLogin('admin');
  document.getElementById('loginForm').requestSubmit();
}

// 3.1 Login Handler
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.toLowerCase();

  loadAdminAccountProfile();
  loadManagedAdminAccounts();
  const adminAccount = managedAdminAccounts.find(account => account.email.toLowerCase() === email);

  if (adminAccount) {
    currentUser = {
      name: getAdminAccountFullName(adminAccount),
      role: 'admin',
      adminRole: adminAccount.role,
      email: adminAccount.email
    };
  } else if (email.includes('admin')) {
      showToast('No registered admin account uses this email address.', 'error');
      return;
  } else {
    currentUser = { name: "Patrick", role: "user", email: email };
  }

  // Hide login, show main app
  document.getElementById('screen-login').classList.add('hidden');
  document.getElementById('screen-app').classList.remove('hidden');

  // Setup UI based on user role
  if(currentUser.role === 'admin') {
    document.getElementById('user-nav').classList.add('hidden');
    document.getElementById('admin-nav').classList.remove('hidden');
    applyAdminRolePermissions();
    document.getElementById('nav-user-role').innerText = currentUser.adminRole;
    document.getElementById('top-user-sub').innerText = currentUser.adminRole;
    switchView('admin-dashboard');
  } else {
    document.getElementById('admin-nav').classList.add('hidden');
    document.getElementById('user-nav').classList.remove('hidden');
    document.getElementById('nav-user-role').innerText = "User Account";
    document.getElementById('top-user-sub').innerText = "User";
    switchView('user-dashboard');
  }

  document.getElementById('nav-user-name').innerText = currentUser.name;
  document.getElementById('top-user-name').innerText = currentUser.name;
  document.getElementById('top-avatar').innerText = currentUser.name.charAt(0);
  document.getElementById('nav-user-avatar').innerText = currentUser.name.charAt(0);

  showToast(`${currentUser.name} Log in`, 'success');
  renderAll();
}

function logout() {
  endSession('Log out');
}

function switchAccount() {
  endSession('switched accounts');
}

function endSession(action) {
  closeProfileMenu();
  if (currentUser) showToast(`${currentUser.name} ${action}`, 'info');
  currentUser = null;
  document.getElementById('screen-app').classList.add('hidden');
  document.getElementById('screen-login').classList.remove('hidden');
}
