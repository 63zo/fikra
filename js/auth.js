/**
 * Fikra (فكرة) - Authentication & User Access Module
 * Handles login, registration, password validation, recovery flow, and role-based permissions.
 */

const Auth = {
  // Password Strength Validator
  checkPasswordStrength(pwd) {
    const rules = {
      length: (pwd || '').length >= 8,
      upper: /[A-Z]/.test(pwd || ''),
      lower: /[a-z]/.test(pwd || ''),
      number: /[0-9]/.test(pwd || ''),
      special: /[^A-Za-z0-9]/.test(pwd || '')
    };

    let passedCount = Object.values(rules).filter(Boolean).length;
    let strength = 'weak';
    let percent = (passedCount / 5) * 100;

    if (passedCount === 5) {
      strength = 'strong';
    } else if (passedCount >= 3) {
      strength = 'medium';
    }

    return { rules, passedCount, strength, percent, isValid: passedCount === 5 };
  },

  // Login handler
  login(identifier, password) {
    if (!identifier || !password) {
      return { success: false, message: I18N.t('fillAllFields') };
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const user = State.users.find(u => 
      (u.username.toLowerCase() === cleanIdentifier || u.email.toLowerCase() === cleanIdentifier) &&
      u.password === password
    );

    if (!user) {
      return { success: false, message: I18N.t('invalidCredentials') };
    }

    State.currentUser = user;
    State.saveToStorage();
    return { success: true, user };
  },

  // Quick Demo Login for instant review
  loginAsRole(role) {
    const user = State.users.find(u => u.role === role);
    if (user) {
      State.currentUser = user;
      State.saveToStorage();
      return { success: true, user };
    }
    return { success: false };
  },

  // Logout
  logout() {
    State.currentUser = null;
    State.saveToStorage();
  },

  // Registration handler
  register(data) {
    const { username, fullName, email, departmentId, jobTitleId, password, confirmPassword } = data;

    if (!username || !fullName || !email || !departmentId || !jobTitleId || !password) {
      return { success: false, message: I18N.t('fillAllFields') };
    }

    if (password !== confirmPassword) {
      return { success: false, message: I18N.t('passwordsDoNotMatch') };
    }

    const strength = this.checkPasswordStrength(password);
    if (!strength.isValid) {
      return { success: false, message: I18N.t('weakPassword') };
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const exists = State.users.some(u => 
      u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
    );

    if (exists) {
      return { success: false, message: I18N.t('userExists') };
    }

    const newUser = {
      id: 'u_' + Date.now(),
      username: cleanUsername,
      fullName: fullName.trim(),
      email: cleanEmail,
      password: password,
      departmentId: departmentId,
      jobTitleId: jobTitleId,
      role: 'employee',
      points: 100, // Welcome bonus points
      badges: ['new_innovator'],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=14573A,C5A059`
    };

    State.users.push(newUser);
    State.currentUser = newUser;
    State.saveToStorage();

    return { success: true, user: newUser };
  },

  // Forgot Password verification simulation
  verificationCodeCache: {},

  requestPasswordReset(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = State.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: I18N.currentLang === 'ar' ? 'البريد الإلكتروني غير مسجل بالنظام!' : 'Email is not registered!' };
    }

    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.verificationCodeCache[cleanEmail] = {
      code,
      expires: Date.now() + 10 * 60 * 1000 // 10 mins
    };

    return { success: true, code, email: cleanEmail };
  },

  resetPasswordWithCode(email, code, newPassword) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cached = this.verificationCodeCache[cleanEmail];

    if (!cached || cached.code !== code.trim() || Date.now() > cached.expires) {
      return { success: false, message: I18N.t('invalidCode') };
    }

    const strength = this.checkPasswordStrength(newPassword);
    if (!strength.isValid) {
      return { success: false, message: I18N.t('weakPassword') };
    }

    const user = State.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: I18N.t('invalidCredentials') };
    }

    user.password = newPassword;
    delete this.verificationCodeCache[cleanEmail];
    State.saveToStorage();

    return { success: true };
  },

  // Change Password in Profile
  changePassword(currentPassword, newPassword) {
    if (!State.currentUser) return { success: false };

    if (State.currentUser.password !== currentPassword) {
      return { success: false, message: I18N.t('wrongCurrentPassword') };
    }

    const strength = this.checkPasswordStrength(newPassword);
    if (!strength.isValid) {
      return { success: false, message: I18N.t('weakPassword') };
    }

    State.currentUser.password = newPassword;
    const match = State.users.find(u => u.id === State.currentUser.id);
    if (match) match.password = newPassword;

    State.saveToStorage();
    return { success: true };
  },

  // Role verification helpers
  isLoggedIn() {
    return !!State.currentUser;
  },

  isEmployee() {
    return this.isLoggedIn();
  },

  isCommittee() {
    return this.isLoggedIn() && (State.currentUser.role === 'committee' || State.currentUser.role === 'admin');
  },

  isAdmin() {
    return this.isLoggedIn() && State.currentUser.role === 'admin';
  }
};

window.Auth = Auth;
