/* ================== SUPABASE CONFIG (CHANGE THESE) ================== */
const SB_URL   = "https://kslktaqlcwuavjiojafe.supabase.co";     // ← replace
const SB_ANON  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzbGt0YXFsY3d1YXZqaW9qYWZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTE2MzQsImV4cCI6MjA3NzgyNzYzNH0.MM5dMZRvV-wgYgpygdYxHN54xmvUfEcz64LzlbqShEM";                    // ← replace
const supa = supabase.createClient(SB_URL, SB_ANON);

/* Redirects (keep your filenames) */
const LOGIN_REDIRECT  = "index.html";
const SIGNUP_REDIRECT = "index.html";

/* Username → email mapper (.local stays) */
const toEmail = (u) => `${String(u || "").replace(/^@/, "").trim()}@placeholder.local`;

/* ================== DOM Elements ================== */
const video = document.getElementById('background-video');
const muteToggle = document.getElementById('mute-toggle');
const muteIcon = muteToggle?.querySelector('i');
const openSignup = document.getElementById('openSignup');
const signupModal = document.getElementById('signupModal');
const closeSignup = document.getElementById('closeSignup');
const loginForm = document.getElementById('loginForm');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const signupForm = document.getElementById('signupForm');
const signupSubmitBtn = signupForm?.querySelector('.btn-primary');

/* ================== Video / Mute ================== */
if (video) {
  let isMuted = true;
  video.muted = isMuted;

  function updateMuteIcon() {
    if (muteIcon) {
      muteIcon.className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
      muteToggle.classList.toggle('unmuted', !isMuted);
    }
  }
  function smartFit() {
    if (video.videoWidth && video.videoHeight) {
      const viewAR = window.innerWidth / window.innerHeight;
      const vidAR = video.videoWidth / video.videoHeight;
      video.style.objectFit = viewAR < vidAR ? 'contain' : 'cover';
    }
  }

  if (muteToggle) {
    muteToggle.onclick = () => { isMuted = !isMuted; video.muted = isMuted; updateMuteIcon(); };
  }
  video.addEventListener('loadedmetadata', smartFit);
  window.addEventListener('resize', smartFit);
  updateMuteIcon();
}

/* ================== Modal ================== */
if (openSignup) openSignup.onclick = e => { e.preventDefault(); signupModal.style.display = 'grid'; };
if (closeSignup) closeSignup.onclick = () => signupModal.style.display = 'none';
if (signupModal) signupModal.onclick = e => { if (e.target === signupModal) signupModal.style.display = 'none'; };

/* ================== Auth Helpers ================== */
function validUsername(u) {
  const uname = String(u || "").replace(/^@/, "");
  return /^[A-Za-z0-9._-]{3,30}$/.test(uname);
}

async function supaLogin(username, password) {
  if (!validUsername(username)) return { ok: false, message: "Invalid username format" };
  const { error } = await supa.auth.signInWithPassword({
    email: toEmail(username),
    password
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

async function supaSignup(username, password) {
  if (!validUsername(username)) return { ok: false, message: "Invalid username format" };
  const { error } = await supa.auth.signUp({
    email: toEmail(username),
    password
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/* Auto-redirect if already logged in */
(async () => {
  const { data } = await supa.auth.getSession();
  if (data.session) {
    window.location.href = LOGIN_REDIRECT;
  }
})();

/* ================== Login Form ================== */
if (loginForm) {
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    loginSubmitBtn.disabled = true;
    loginSubmitBtn.textContent = "Processing...";

    const u = username.value.trim();
    const p = password.value;
    const r = await supaLogin(u, p);

    loginSubmitBtn.disabled = false;
    loginSubmitBtn.textContent = "Login";

    if (r.ok) {
      window.location.href = LOGIN_REDIRECT;
    } else {
      alert(r.message || "Login failed. Please try again.");
    }
  };
}

/* ================== Signup Form ================== */
if (signupForm) {
  signupForm.onsubmit = async (e) => {
    e.preventDefault();
    signupSubmitBtn.disabled = true;
    signupSubmitBtn.textContent = "Processing...";

    const u = su_username.value.trim();
    const p = su_password.value;
    const c = su_confirm.value;

    if (p !== c) {
      alert("Passwords do not match.");
      signupSubmitBtn.disabled = false;
      signupSubmitBtn.textContent = "Sign Up";
      return;
    }

    const r = await supaSignup(u, p);

    signupSubmitBtn.disabled = false;
    signupSubmitBtn.textContent = "Sign Up";

    if (r.ok) {
      alert("Signup successful! Redirecting…");
      window.location.href = SIGNUP_REDIRECT;
    } else {
      alert(r.message || "Signup failed. Please try again.");
    }
  };
}
