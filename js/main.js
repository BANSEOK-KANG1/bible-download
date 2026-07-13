import { CONFIG } from "./config.js";

const INSTALL_STEP_KEY = "bible-install-step";
let selectedAmount = CONFIG.defaultDonationAmount;
let currentInstallStep = 0;

function applyConfig() {
  document.querySelectorAll("[data-config]").forEach((el) => {
    const key = el.dataset.config;
    if (CONFIG[key] !== undefined) {
      el.textContent = CONFIG[key];
    }
  });

  document.querySelectorAll("[data-config-href]").forEach((el) => {
    const key = el.dataset.configHref;
    if (CONFIG[key] !== undefined) {
      el.href = CONFIG[key];
    }
  });
}

function formatAmount(amount) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function cleanAccountNumber(accountNumber) {
  return accountNumber.replace(/-/g, "");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("toast--visible");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.remove("toast--visible");
  }, 2000);
}

function openDeepLink(url) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) {
    showToast("모바일에서 토스 또는 카카오페이 앱으로 열어주세요");
    return;
  }

  window.location.href = url;
}

function buildTossLink(amount) {
  const params = new URLSearchParams({
    bank: CONFIG.tossBankName,
    accountNo: cleanAccountNumber(CONFIG.accountNumber),
    amount: String(amount),
  });

  if (CONFIG.transferMemo) {
    params.set("msg", CONFIG.transferMemo);
  }

  return `supertoss://send?${params.toString()}`;
}

function buildKakaoPayLink(amount) {
  const params = new URLSearchParams({
    bank_code: CONFIG.bankCode,
    bank_account_number: cleanAccountNumber(CONFIG.accountNumber),
    amount: String(amount),
  });

  return `kakaopay://money/to/bank?${params.toString()}`;
}

function updateSelectedAmountDisplay() {
  document.querySelectorAll("[data-amount]").forEach((button) => {
    const amount = Number(button.dataset.amount);
    button.classList.toggle("amount-chip--active", amount === selectedAmount);
  });
}

function renderAmountOptions() {
  const container = document.getElementById("amount-options");
  if (!container) return;

  container.replaceChildren();

  CONFIG.donationAmounts.forEach((amount) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "amount-chip";
    button.dataset.amount = String(amount);
    button.textContent = formatAmount(amount);
    button.addEventListener("click", () => {
      selectedAmount = amount;
      updateSelectedAmountDisplay();
    });
    container.appendChild(button);
  });

  if (!CONFIG.donationAmounts.includes(selectedAmount)) {
    selectedAmount = CONFIG.donationAmounts[0] ?? CONFIG.defaultDonationAmount;
  }

  updateSelectedAmountDisplay();
}

async function copyAccountNumber() {
  const text = CONFIG.accountNumber;
  try {
    await navigator.clipboard.writeText(text);
    showToast("계좌번호가 복사되었습니다");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showToast("계좌번호가 복사되었습니다");
  }
}

function openDonationModal() {
  const modal = document.getElementById("donation-modal");
  if (!modal) return;
  modal.classList.add("modal--open");
  document.body.classList.add("modal-open");
}

function goToDownload() {
  window.location.href = "download.html";
}

function initEntryPage() {
  applyConfig();
  renderAmountOptions();

  document
    .getElementById("toss-send-btn")
    ?.addEventListener("click", () => openDeepLink(buildTossLink(selectedAmount)));

  document
    .getElementById("kakao-send-btn")
    ?.addEventListener("click", () =>
      openDeepLink(buildKakaoPayLink(selectedAmount))
    );

  document
    .getElementById("copy-account-btn")
    ?.addEventListener("click", copyAccountNumber);

  document
    .getElementById("donate-done-btn")
    ?.addEventListener("click", goToDownload);

  if (window.location.hash === "#support") {
    openDonationModal();
    window.setTimeout(() => {
      document.getElementById("support")?.scrollIntoView({ behavior: "smooth" });
    }, 600);
  } else {
    window.setTimeout(openDonationModal, 500);
  }
}

function getSavedInstallStep() {
  const saved = Number(localStorage.getItem(INSTALL_STEP_KEY));
  const max = CONFIG.installSteps.length - 1;
  if (Number.isInteger(saved) && saved >= 0 && saved <= max) {
    return saved;
  }
  return 0;
}

function saveInstallStep(step) {
  localStorage.setItem(INSTALL_STEP_KEY, String(step));
}

function renderProgressDots() {
  const container = document.getElementById("progress-dots");
  if (!container) return;

  container.replaceChildren();
  CONFIG.installSteps.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.className = "wizard-progress__dot";
    if (index <= currentInstallStep) {
      dot.classList.add("wizard-progress__dot--active");
    }
    if (index === currentInstallStep) {
      dot.classList.add("wizard-progress__dot--current");
    }
    dot.textContent = String(index + 1);
    container.appendChild(dot);
  });
}

function updateInstallWizard() {
  const step = CONFIG.installSteps[currentInstallStep];
  if (!step) return;

  const total = CONFIG.installSteps.length;
  const badge = document.getElementById("step-badge");
  const title = document.getElementById("step-title");
  const body = document.getElementById("step-body");
  const meta = document.getElementById("step-meta");
  const label = document.getElementById("progress-label");
  const fill = document.getElementById("progress-fill");
  const primaryBtn = document.getElementById("wizard-primary-btn");
  const prevBtn = document.getElementById("wizard-prev-btn");
  const nextBtn = document.getElementById("wizard-next-btn");
  const supportLink = document.getElementById("support-link");

  if (badge) badge.textContent = String(currentInstallStep + 1);
  if (title) title.textContent = step.title;
  if (body) body.textContent = step.body;
  if (label) label.textContent = `${currentInstallStep + 1} / ${total}`;
  if (fill) fill.style.width = `${((currentInstallStep + 1) / total) * 100}%`;
  if (primaryBtn) primaryBtn.textContent = step.button;
  if (meta) meta.hidden = currentInstallStep !== 0;

  if (prevBtn) prevBtn.hidden = currentInstallStep === 0;
  if (nextBtn) {
    nextBtn.hidden = currentInstallStep === 0 || currentInstallStep === total - 1;
  }
  if (supportLink) {
    supportLink.hidden = currentInstallStep !== total - 1;
  }

  renderProgressDots();
  saveInstallStep(currentInstallStep);
}

function triggerApkDownload() {
  const link = document.getElementById("hidden-download");
  if (link) {
    link.href = CONFIG.apkUrl;
    link.download = CONFIG.apkFileName;
    link.click();
  }

  window.setTimeout(() => {
    window.location.href = CONFIG.apkUrl;
  }, 100);
}

function goToInstallStep(step) {
  const max = CONFIG.installSteps.length - 1;
  currentInstallStep = Math.max(0, Math.min(step, max));
  updateInstallWizard();
}

function handlePrimaryInstallAction() {
  const step = CONFIG.installSteps[currentInstallStep];
  if (!step) return;

  if (step.action === "download") {
    triggerApkDownload();
    window.setTimeout(() => {
      goToInstallStep(1);
    }, 1500);
    return;
  }

  if (currentInstallStep === CONFIG.installSteps.length - 1) {
    goToInstallStep(0);
    return;
  }

  goToInstallStep(currentInstallStep + 1);
}

function initHelpPhone() {
  const helpPhone = document.getElementById("help-phone");
  if (!helpPhone || !CONFIG.helpPhone) return;

  helpPhone.hidden = false;
  helpPhone.href = `tel:${CONFIG.helpPhone}`;
  helpPhone.textContent = `도움 요청: ${CONFIG.helpPhone}`;
}

function initDownloadPage() {
  applyConfig();
  initHelpPhone();

  currentInstallStep = getSavedInstallStep();
  updateInstallWizard();

  document
    .getElementById("wizard-primary-btn")
    ?.addEventListener("click", handlePrimaryInstallAction);

  document.getElementById("wizard-prev-btn")?.addEventListener("click", () => {
    goToInstallStep(currentInstallStep - 1);
  });

  document.getElementById("wizard-next-btn")?.addEventListener("click", () => {
    goToInstallStep(currentInstallStep + 1);
  });
}

const page = document.body.dataset.page;
if (page === "entry") {
  initEntryPage();
} else if (page === "download") {
  initDownloadPage();
}
