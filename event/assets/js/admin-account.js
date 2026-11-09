const adminAccountProfile = {
  firstName: 'Jm',
  middleInitial: '',
  lastName: 'Kalbo',
  suffix: '',
  email: 'admin@eventure.com',
  phone: '',
  province: 'Cavite',
  municipality: 'Kawit',
  barangay: '',
  street: ''
};

let managedAdminAccounts = [];

const municipalitiesByProvince = {
  Cavite: [
    'Bacoor', 'Carmona', 'Cavite City', 'Dasmarinas', 'General Trias',
    'Imus', 'Kawit', 'Noveleta', 'Rosario', 'Silang', 'Tagaytay',
    'Tanza', 'Trece Martires'
  ],
  Laguna: ['Biñan', 'Calamba', 'San Pablo', 'Santa Rosa'],
  Batangas: ['Batangas City', 'Lipa', 'Santo Tomas', 'Tanauan'],
  Rizal: ['Antipolo', 'Cainta', 'Rodriguez', 'Taytay'],
  'Metro Manila': ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig']
};

const adminRolePermissions = {
  'Super Admin': ['admin-dashboard', 'admin-events', 'admin-registrations', 'admin-transactions', 'admin-reports', 'admin-account'],
  'Event Manager': ['admin-dashboard', 'admin-events', 'admin-registrations'],
  'Finance Manager': ['admin-dashboard', 'admin-transactions', 'admin-reports']
};

function getAdminRolePermissions(role) {
  return adminRolePermissions[role] || [];
}

function applyAdminRolePermissions() {
  const allowedViews = getAdminRolePermissions(currentUser?.adminRole);
  document.querySelectorAll('#admin-nav .nav-btn').forEach(button => {
    const viewId = button.id.replace('nav-', '');
    button.classList.toggle('hidden', !allowedViews.includes(viewId));
  });
}

function loadAdminAccountProfile() {
  const savedProfile = localStorage.getItem('eventure-admin-account');
  if (!savedProfile) return;

  try {
    const profile = JSON.parse(savedProfile);
    const fields = Object.keys(adminAccountProfile);
    if (!profile || typeof profile !== 'object' || fields.some(field => typeof profile[field] !== 'string')) {
      throw new Error('Saved admin account profile has an invalid format.');
    }
    Object.assign(adminAccountProfile, profile);
  } catch (error) {
    console.error('Unable to load saved admin account settings.', error);
    showToast('Saved account settings could not be loaded.', 'error');
  }
}

function getAdminAccountFullName(profile = adminAccountProfile) {
  return [
    profile.firstName,
    profile.middleInitial ? `${profile.middleInitial}.` : '',
    profile.lastName,
    profile.suffix
  ].filter(Boolean).join(' ');
}

function showAdminAccountList() {
  if (currentUser?.adminRole !== 'Super Admin') return;
  document.getElementById('admin-account-panel-profile').classList.add('hidden');
  document.getElementById('admin-account-panel-admins').classList.remove('hidden');
  loadManagedAdminAccounts();
  renderManagedAdminAccounts();
}

function closePrimaryAdminProfile() {
  showAdminAccountList();
}

function createPrimaryAdminRecord() {
  return {
    id: 'primary-admin',
    firstName: adminAccountProfile.firstName,
    middleInitial: adminAccountProfile.middleInitial,
    lastName: adminAccountProfile.lastName,
    suffix: adminAccountProfile.suffix,
    email: adminAccountProfile.email,
    role: 'Super Admin'
  };
}

function loadManagedAdminAccounts() {
  const savedAccounts = localStorage.getItem('eventure-admin-accounts');
  if (!savedAccounts) {
    managedAdminAccounts = [createPrimaryAdminRecord()];
    persistManagedAdminAccounts(managedAdminAccounts);
    return;
  }

  try {
    const accounts = JSON.parse(savedAccounts);
    if (!Array.isArray(accounts) || accounts.some(account =>
      !account || typeof account.id !== 'string' ||
      ['firstName', 'middleInitial', 'lastName', 'suffix', 'email'].some(field => typeof account[field] !== 'string') ||
      (account.role !== undefined && typeof account.role !== 'string')
    )) {
      throw new Error('Saved admin account list has an invalid format.');
    }

    const migratedAccounts = accounts.map(account => ({
      ...account,
      role: account.id === 'primary-admin'
        ? 'Super Admin'
        : adminRolePermissions[account.role] ? account.role : 'Event Manager'
    }));
    if (!migratedAccounts.some(account => account.id === 'primary-admin')) {
      migratedAccounts.unshift(createPrimaryAdminRecord());
    }
    if (JSON.stringify(accounts) !== JSON.stringify(migratedAccounts)) persistManagedAdminAccounts(migratedAccounts);
    else managedAdminAccounts = migratedAccounts;
  } catch (error) {
    console.error('Unable to load registered admin accounts.', error);
    showToast('Registered admin accounts could not be loaded.', 'error');
    managedAdminAccounts = [createPrimaryAdminRecord()];
  }
}

function persistManagedAdminAccounts(accounts) {
  try {
    localStorage.setItem('eventure-admin-accounts', JSON.stringify(accounts));
    managedAdminAccounts = accounts;
    return true;
  } catch (error) {
    console.error('Unable to save registered admin accounts.', error);
    showToast('Admin accounts could not be saved on this device.', 'error');
    return false;
  }
}

function renderManagedAdminAccounts() {
  const tableBody = document.getElementById('admin-accounts-table-body');
  tableBody.replaceChildren();

  managedAdminAccounts.forEach(account => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.className = 'px-5 py-4 font-semibold text-gray-900';
    nameCell.textContent = getAdminAccountFullName(account);

    const emailCell = document.createElement('td');
    emailCell.className = 'px-5 py-4 text-gray-600';
    emailCell.textContent = account.email;

    const roleCell = document.createElement('td');
    roleCell.className = 'px-5 py-4';
    const roleBadge = document.createElement('span');
    roleBadge.className = 'rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700';
    roleBadge.textContent = account.role;
    roleCell.appendChild(roleBadge);

    const actionCell = document.createElement('td');
    actionCell.className = 'px-5 py-4 text-right';
    const actions = document.createElement('div');
    actions.className = 'flex justify-end gap-2';
    const viewButton = document.createElement('button');
    viewButton.type = 'button';
    viewButton.className = 'rounded-lg px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50';
    viewButton.textContent = 'View';
    viewButton.addEventListener('click', () => viewManagedAdminAccount(account.id));
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => editManagedAdminAccount(account.id));
    actions.append(viewButton, editButton);
    actionCell.appendChild(actions);

    row.append(nameCell, emailCell, roleCell, actionCell);
    tableBody.appendChild(row);
  });

  if (managedAdminAccounts.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.className = 'px-5 py-8 text-center text-sm text-gray-500';
    cell.textContent = 'No admin accounts have been registered.';
    row.appendChild(cell);
    tableBody.appendChild(row);
  }
}

function viewManagedAdminAccount(id) {
  const account = managedAdminAccounts.find(item => item.id === id);
  if (!account) return;

  const profile = account.id === 'primary-admin' ? adminAccountProfile : account;
  const details = [
    ['Full Name', getAdminAccountFullName(account)],
    ['Email Address', account.email],
    ['Admin Role', account.role],
    ['Phone Number', profile.phone || 'Not provided'],
    ['Province / Area', profile.province || 'Not provided'],
    ['City / Municipality', profile.municipality || 'Not provided'],
    ['Barangay', profile.barangay || 'Not provided'],
    ['Street / House Number', profile.street || 'Not provided']
  ];
  const detailList = document.getElementById('admin-account-view-details');
  detailList.replaceChildren();

  details.forEach(([label, value]) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'rounded-xl bg-gray-50 p-3';
    const term = document.createElement('dt');
    term.className = 'text-xs font-bold uppercase text-gray-500';
    term.textContent = label;
    const description = document.createElement('dd');
    description.className = 'mt-1 break-words text-sm font-semibold text-gray-900';
    description.textContent = value;
    wrapper.append(term, description);
    detailList.appendChild(wrapper);
  });

  document.getElementById('admin-account-view-edit').onclick = () => {
    closeAdminAccountView();
    if (account.id === 'primary-admin') {
      loadAdminAccountProfile();
      populateAdminAccountForm();
      document.getElementById('admin-account-panel-admins').classList.add('hidden');
      document.getElementById('admin-account-panel-profile').classList.remove('hidden');
      return;
    }
    editManagedAdminAccount(id);
  };

  const modal = document.getElementById('admin-account-view-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  lucide.createIcons();
}

function closeAdminAccountView() {
  const modal = document.getElementById('admin-account-view-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function openAdminAccountEditor() {
  if (currentUser?.adminRole !== 'Super Admin') return;
  document.getElementById('admin-account-editor').reset();
  document.getElementById('managed-admin-id').value = '';
  document.getElementById('managed-admin-editor-title').textContent = 'Create Admin Account';
  document.getElementById('admin-account-editor').classList.remove('hidden');
  document.getElementById('managed-admin-first-name').focus();
}

function editManagedAdminAccount(id) {
  if (currentUser?.adminRole !== 'Super Admin') return;
  const account = managedAdminAccounts.find(item => item.id === id);
  if (!account) return;

  document.getElementById('managed-admin-id').value = account.id;
  document.getElementById('managed-admin-first-name').value = account.firstName;
  document.getElementById('managed-admin-middle-initial').value = account.middleInitial;
  document.getElementById('managed-admin-last-name').value = account.lastName;
  document.getElementById('managed-admin-suffix').value = account.suffix;
  document.getElementById('managed-admin-email').value = account.email;
  document.getElementById('managed-admin-role').value = account.role;
  document.getElementById('managed-admin-role').disabled = account.id === 'primary-admin';
  document.getElementById('managed-admin-editor-title').textContent = 'Edit Admin Account';
  document.getElementById('admin-account-editor').classList.remove('hidden');
  document.getElementById('managed-admin-first-name').focus();
}

function closeAdminAccountEditor() {
  document.getElementById('admin-account-editor').classList.add('hidden');
  document.getElementById('admin-account-editor').reset();
  document.getElementById('managed-admin-id').value = '';
  document.getElementById('managed-admin-role').disabled = false;
}

function saveManagedAdminAccount(event) {
  event.preventDefault();
  if (currentUser?.adminRole !== 'Super Admin') return;
  const id = document.getElementById('managed-admin-id').value;
  if (id === 'primary-admin' && document.getElementById('managed-admin-role').value !== 'Super Admin') {
    showToast('The primary admin role cannot be changed.', 'error');
    return;
  }
  const account = {
    id: id || `admin-${Date.now()}`,
    firstName: document.getElementById('managed-admin-first-name').value.trim(),
    middleInitial: document.getElementById('managed-admin-middle-initial').value.trim().replace(/\.$/, '').toUpperCase(),
    lastName: document.getElementById('managed-admin-last-name').value.trim(),
    suffix: document.getElementById('managed-admin-suffix').value,
    email: document.getElementById('managed-admin-email').value.trim(),
    role: document.getElementById('managed-admin-role').value
  };

  const duplicate = managedAdminAccounts.some(existing =>
    existing.id !== id && existing.email.toLowerCase() === account.email.toLowerCase()
  );
  if (duplicate) {
    showToast('An admin account already uses this email address.', 'error');
    document.getElementById('managed-admin-email').focus();
    return;
  }

  const nextAccounts = id
    ? managedAdminAccounts.map(existing => existing.id === id ? account : existing)
    : [...managedAdminAccounts, account];
  if (!persistManagedAdminAccounts(nextAccounts)) return;

  if (id === 'primary-admin') {
    Object.assign(adminAccountProfile, account);
    try {
      localStorage.setItem('eventure-admin-account', JSON.stringify(adminAccountProfile));
    } catch (error) {
      console.error('Unable to save primary admin profile.', error);
      showToast('The primary admin profile could not be saved.', 'error');
      return;
    }
    if (currentUser?.role === 'admin') {
      currentUser.name = getAdminAccountFullName();
      currentUser.email = account.email;
      document.getElementById('nav-user-name').innerText = currentUser.name;
      document.getElementById('top-user-name').innerText = currentUser.name;
      document.getElementById('top-avatar').innerText = currentUser.name.charAt(0);
      document.getElementById('nav-user-avatar').innerText = currentUser.name.charAt(0);
    }
  }

  if (currentUser?.email.toLowerCase() === account.email.toLowerCase()) {
    currentUser.adminRole = account.role;
    applyAdminRolePermissions();
    if (!getAdminRolePermissions(account.role).includes('admin-account')) switchView('admin-dashboard');
  }

  closeAdminAccountEditor();
  renderManagedAdminAccounts();
  showToast(`${getAdminAccountFullName(account)} admin account ${id ? 'updated' : 'created'}`, 'success');
}

function populateAdminAccountForm() {
  document.getElementById('account-first-name').value = adminAccountProfile.firstName;
  document.getElementById('account-middle-initial').value = adminAccountProfile.middleInitial;
  document.getElementById('account-last-name').value = adminAccountProfile.lastName;
  document.getElementById('account-suffix').value = adminAccountProfile.suffix;
  document.getElementById('account-email').value = adminAccountProfile.email;
  document.getElementById('account-phone').value = adminAccountProfile.phone;
  document.getElementById('account-province').value = adminAccountProfile.province;
  updateAccountMunicipalities(adminAccountProfile.municipality);
  document.getElementById('account-barangay').value = adminAccountProfile.barangay;
  document.getElementById('account-street').value = adminAccountProfile.street;
}

function updateAccountMunicipalities(selectedMunicipality = '') {
  const province = document.getElementById('account-province').value;
  const municipalitySelect = document.getElementById('account-municipality');
  const municipalities = municipalitiesByProvince[province] || [];

  municipalitySelect.replaceChildren(new Option('Choose a city / municipality', ''));
  municipalities.forEach(municipality => {
    municipalitySelect.add(new Option(municipality, municipality));
  });
  municipalitySelect.add(new Option('Other', 'Other'));

  const hasOption = municipalities.includes(selectedMunicipality);
  municipalitySelect.value = hasOption ? selectedMunicipality : selectedMunicipality ? 'Other' : '';
  document.getElementById('account-other-municipality').value = hasOption ? '' : selectedMunicipality;
  toggleOtherMunicipality();
}

function toggleOtherMunicipality() {
  const isOther = document.getElementById('account-municipality').value === 'Other';
  const otherInput = document.getElementById('account-other-municipality');
  otherInput.classList.toggle('hidden', !isOther);
  otherInput.required = isOther;
}

function saveAdminAccount(event) {
  event.preventDefault();
  if (currentUser?.adminRole !== 'Super Admin') return;

  const municipalityChoice = document.getElementById('account-municipality').value;
  const municipality = municipalityChoice === 'Other'
    ? document.getElementById('account-other-municipality').value.trim()
    : municipalityChoice;

  if (!municipalityChoice) {
    document.getElementById('account-municipality').focus();
    return;
  }
  if (!municipality) {
    document.getElementById('account-other-municipality').focus();
    return;
  }

  const updatedProfile = {
    firstName: document.getElementById('account-first-name').value.trim(),
    middleInitial: document.getElementById('account-middle-initial').value.trim().replace(/\.$/, '').toUpperCase(),
    lastName: document.getElementById('account-last-name').value.trim(),
    suffix: document.getElementById('account-suffix').value,
    email: document.getElementById('account-email').value.trim(),
    phone: document.getElementById('account-phone').value.trim(),
    province: document.getElementById('account-province').value,
    municipality,
    barangay: document.getElementById('account-barangay').value.trim(),
    street: document.getElementById('account-street').value.trim()
  };

  try {
    localStorage.setItem('eventure-admin-account', JSON.stringify(updatedProfile));
  } catch (error) {
    console.error('Unable to save admin account settings.', error);
    showToast('Account settings could not be saved on this device.', 'error');
    return;
  }

  Object.assign(adminAccountProfile, updatedProfile);
  loadManagedAdminAccounts();
  const primaryAccount = createPrimaryAdminRecord();
  const nextAccounts = managedAdminAccounts.some(account => account.id === 'primary-admin')
    ? managedAdminAccounts.map(account => account.id === 'primary-admin' ? primaryAccount : account)
    : [primaryAccount, ...managedAdminAccounts];
  if (!persistManagedAdminAccounts(nextAccounts)) return;

  currentUser.name = getAdminAccountFullName();
  currentUser.email = adminAccountProfile.email;
  document.getElementById('nav-user-name').innerText = currentUser.name;
  document.getElementById('top-user-name').innerText = currentUser.name;
  document.getElementById('top-avatar').innerText = currentUser.name.charAt(0);
  document.getElementById('nav-user-avatar').innerText = currentUser.name.charAt(0);

  showToast(`${currentUser.name} updated account details`, 'success');
}
