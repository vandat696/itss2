'use strict';

const $ = (query, root = document) => root.querySelector(query);
const $$ = (query, root = document) => [...root.querySelectorAll(query)];
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;

// Navigation is available without JavaScript; only the mobile disclosure needs it.
const menuToggle = $('.menu-toggle');
const mobileNav = $('#mobile-nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  mobileNav.hidden = true;
}
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  mobileNav.hidden = isOpen;
});
$$('a', mobileNav).forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia('(min-width:701px)').addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});
const header = $('.header');
const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 15);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// Reveal once, and respect the visitor's reduced-motion preference.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  $$('.reveal').forEach((element) => observer.observe(element));
}

const processPanels = [
  `<div class="paper-top"><strong class="paper-title">Hồ sơ năng lực</strong>${icon('profile')}</div>
   <div class="paper-field"><span>TÊN HIỂN THỊ</span><div class="paper-input">Minh · Sinh viên công nghệ thông tin</div></div>
   <div class="paper-field"><span>ĐIỂM MẠNH CỦA BẠN</span><div class="paper-tags"><span>HTML & CSS</span><span>JavaScript</span><span>Làm việc nhóm</span></div></div>
   <div class="paper-field"><span>TRẢI NGHIỆM GẦN ĐÂY</span><div class="paper-input">Website cá nhân đầu tiên của mình ✦</div></div>
   <div class="paper-bottom"><span>Mỗi trải nghiệm đều đáng ghi nhận.</span><span class="paper-button">Lưu hồ sơ ${icon('arrow')}</span></div>`,
  `<div class="paper-top"><strong class="paper-title">Điểm mạnh & khoảng thiếu</strong>${icon('target')}</div>
   <p class="paper-profile-line">Công việc mẫu: Frontend Developer</p>
   <div class="paper-match-item"><span>HTML & CSS</span><small>✓ Đáp ứng</small></div>
   <div class="paper-match-item"><span>React</span><small>↗ Cần cải thiện</small></div>
   <div class="paper-match-item"><span>Kiểm thử giao diện</span><small>○ Chưa đủ thông tin</small></div>
   <div class="paper-tip">Một hướng đi tiếp: thực hành React qua một dự án nhỏ.</div>
   <div class="paper-bottom"><span>Đối chiếu minh họa, không phải điểm tuyển dụng.</span></div>`,
  `<div class="paper-top"><strong class="paper-title">Mỗi bước nhỏ, một dấu mốc</strong>${icon('flag')}</div>
   <div class="paper-milestone"><strong>Chọn một điều cần cải thiện</strong><p>Mình muốn thực hành React nhiều hơn.</p></div>
   <div class="paper-milestone"><strong>Làm một ứng dụng nhỏ</strong><p>Tạo danh sách công việc với thêm / sửa / xóa.</p></div>
   <div class="paper-milestone"><strong>Nhìn lại điều đã học</strong><p>Ghi lại kết quả, cập nhật hồ sơ và đi tiếp.</p></div>
   <div class="paper-bottom"><span>Nhịp đi của bạn. Hành trình của bạn.</span><span class="paper-button">Ghi nhận ${icon('check')}</span></div>`,
];
const processCaptions = [
  'Khởi đầu bằng những điều bạn đã có.',
  'Thấy rõ khoảng cách, biết điều cần tập trung.',
  'Ghi nhận hôm nay, tự tin hơn vào ngày mai.',
];
function selectProcessStep(index) {
  $$('.how-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
  });
  const panel = $('#step-preview');
  panel.innerHTML = processPanels[index];
  panel.classList.remove('changed');
  void panel.offsetWidth;
  panel.classList.add('changed');
  $('#how-panel').setAttribute('aria-labelledby', `step-tab-${index}`);
  $('#step-caption').textContent = processCaptions[index];
}

function connectTabs(tabs, onSelect) {
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => onSelect(index));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        onSelect(next);
        tabs[next].focus();
      }
    });
  });
}
connectTabs($$('.how-tab'), selectProcessStep);
selectProcessStep(0);

// The demo uses deliberately prepared fixtures, not a claimed AI evaluation.
// No network, account, personal data, upload, or persistence is involved.
const sampleJobs = {
  frontend: {
    title: 'Frontend Developer',
    criteria: [
      { name: 'HTML & CSS', state: 'met', label: 'Đáp ứng', reason: 'Hồ sơ mẫu có dự án website sử dụng HTML và CSS.' },
      { name: 'JavaScript', state: 'met', label: 'Đáp ứng', reason: 'Hồ sơ mẫu ghi nhận kiến thức JavaScript cơ bản.' },
      { name: 'React', state: 'partial', label: 'Cần cải thiện', reason: 'Đã học cơ bản; chưa có dự án React để đối chiếu yêu cầu thực hành.' },
      { name: 'Kiểm thử giao diện', state: 'unknown', label: 'Chưa đủ thông tin', reason: 'Hồ sơ mẫu chưa có thông tin về kiểm thử; cần bổ sung để đối chiếu.' },
    ],
    milestone: 'Xây dựng một ứng dụng React nhỏ',
    action: 'Tạo ứng dụng danh sách công việc với các chức năng thêm, sửa và xóa.',
    done: 'Có mã nguồn, ứng dụng chạy được và một ghi nhận về điều đã học.',
  },
  backend: {
    title: 'Backend Developer',
    criteria: [
      { name: 'JavaScript', state: 'met', label: 'Đáp ứng', reason: 'Hồ sơ mẫu đã ghi nhận kiến thức JavaScript cơ bản.' },
      { name: 'Node.js & REST API', state: 'partial', label: 'Cần cải thiện', reason: 'Đã tìm hiểu Node.js; chưa có dự án API để đối chiếu yêu cầu thực hành.' },
      { name: 'SQL', state: 'partial', label: 'Cần cải thiện', reason: 'Đã học SQL cơ bản; cần thực hành truy vấn trong một dự án.' },
      { name: 'Triển khai ứng dụng', state: 'unknown', label: 'Chưa đủ thông tin', reason: 'Hồ sơ mẫu chưa ghi nhận kinh nghiệm triển khai.' },
    ],
    milestone: 'Viết một REST API quản lý công việc',
    action: 'Dùng Node.js tạo API thêm, xem, sửa và xóa công việc với dữ liệu mẫu.',
    done: 'Các endpoint hoạt động và có README hướng dẫn gọi thử API.',
  },
};
const dialog = $('#demo-dialog');
const demoPanel = $('#demo-content');
let demoState = { tab: 0, job: 'frontend', milestone: null, completed: false };
let demoOpener = null;
let previousOverflow = '';
function announce(message) { $('#demo-status').textContent = message; }
function renderDemo(index = demoState.tab, focusPanel = false) {
  demoState.tab = index;
  $$('[data-demo-tab]').forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
  });
  demoPanel.setAttribute('aria-labelledby', `demo-tab-${index}`);
  const job = sampleJobs[demoState.job];
  if (index === 0) {
    demoPanel.innerHTML = `<div class="demo-person"><span class="avatar-mini">M</span><div><strong>Chào Minh, bắt đầu từ chính bạn.</strong><p>Sinh viên công nghệ thông tin · Hồ sơ mẫu</p></div><span class="demo-badge">Minh họa</span></div>
      <span class="demo-section-label">Những điều bạn đã có</span><div class="demo-chips"><span>HTML & CSS</span><span>JavaScript</span><span>React cơ bản</span><span>Node.js cơ bản</span><span>SQL cơ bản</span></div>
      <div class="demo-info-box"><strong>Dự án đầu tiên</strong>Website cá nhân bằng HTML, CSS và JavaScript. Đang tìm hướng thực hành tiếp theo.</div>
      <div class="demo-actions"><small>Một điểm bắt đầu là đủ.</small><button class="button" data-demo-next="1">Khám phá độ phù hợp ${icon('arrow')}</button></div>`;
  } else if (index === 1) {
    demoPanel.innerHTML = `<label class="demo-section-label" for="demo-job">Chọn công việc bạn muốn khám phá</label>
      <select class="demo-select" id="demo-job"><option value="frontend" ${demoState.job === 'frontend' ? 'selected' : ''}>Frontend Developer · Công việc mẫu</option><option value="backend" ${demoState.job === 'backend' ? 'selected' : ''}>Backend Developer · Công việc mẫu</option></select>
      ${job.criteria.map((item) => `<div class="demo-result-row"><strong>${item.name}</strong><span class="result-status ${item.state}">${item.label}</span><p>${item.reason}</p></div>`).join('')}
      <div class="demo-actions"><button class="demo-back" data-demo-next="0">← Hồ sơ mẫu</button><button class="button" data-create-milestone>Tạo cột mốc cải thiện ${icon('arrow')}</button></div>`;
    $('#demo-job').addEventListener('change', (event) => {
      demoState.job = event.target.value;
      renderDemo(1);
      $('#demo-job').focus();
      announce(`Đã hiển thị đối chiếu mẫu cho ${sampleJobs[demoState.job].title}.`);
    });
  } else if (!demoState.milestone) {
    demoPanel.innerHTML = `<div class="demo-empty">${icon('flag')}<h3>Hành trình đang chờ bước đầu tiên.</h3><p>Xem đối chiếu mẫu rồi chọn một điều để cải thiện.</p><button class="button" data-demo-next="1">Xem độ phù hợp ${icon('arrow')}</button></div>`;
  } else {
    const milestoneJob = sampleJobs[demoState.milestone];
    demoPanel.innerHTML = `<div class="demo-progress"><span>Cột mốc từ ${milestoneJob.title}</span><span>${demoState.completed ? '1 / 1 hoàn thành' : '0 / 1 hoàn thành'}</span></div><article class="demo-milestone"><span>${demoState.completed ? '✓ ĐÃ HOÀN THÀNH · MẪU' : 'BƯỚC TIẾP THEO CỦA BẠN'}</span><h3>${milestoneJob.milestone}</h3><p>${milestoneJob.action}</p><div class="demo-info-box"><strong>Thế nào là hoàn thành?</strong>${milestoneJob.done}</div>${demoState.completed ? `<div class="demo-completion">${icon('check')}Một bước tiến mới đã được ghi nhận!</div><p style="margin-top:12px">Ghi nhận mẫu: Đã hoàn thành bài thực hành và ghi lại điều học được.</p>` : ''}</article><div class="demo-actions"><button class="demo-back" data-demo-next="1">← Xem lại đối chiếu</button><button class="button" ${demoState.completed ? 'data-reset-demo' : 'data-complete-milestone'}>${demoState.completed ? 'Thử lại hành trình' : 'Hoàn thành & ghi nhận'} ${icon(demoState.completed ? 'arrow' : 'check')}</button></div>`;
  }
  if (focusPanel) demoPanel.focus({ preventScroll: true });
}
connectTabs($$('[data-demo-tab]'), (index) => renderDemo(index));
demoPanel.addEventListener('click', (event) => {
  const next = event.target.closest('[data-demo-next]');
  if (next) renderDemo(Number(next.dataset.demoNext), true);
  if (event.target.closest('[data-create-milestone]')) {
    const changedJob = demoState.milestone !== demoState.job;
    demoState.milestone = demoState.job;
    if (changedJob) demoState.completed = false;
    renderDemo(2, true);
    announce('Đã tạo cột mốc mẫu. Bạn có thể thử đánh dấu hoàn thành.');
  }
  if (event.target.closest('[data-complete-milestone]')) {
    demoState.completed = true;
    renderDemo(2, true);
    announce('Đã hoàn thành cột mốc và lưu ghi nhận mẫu trong phiên trải nghiệm này.');
  }
  if (event.target.closest('[data-reset-demo]')) {
    demoState = { tab: 0, job: 'frontend', milestone: null, completed: false };
    renderDemo(0, true);
    announce('Đã đặt lại bản trải nghiệm.');
  }
});
$$('[data-open-demo]').forEach((button) => button.addEventListener('click', () => {
  demoOpener = button;
  closeMenu();
  demoState = { tab: 0, job: 'frontend', milestone: null, completed: false };
  renderDemo(0);
  announce('');
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  dialog.showModal();
  $('#close-demo').focus({ preventScroll: true });
}));
$('#close-demo').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.style.overflow = previousOverflow;
  // Native dialog restoration may already have returned focus. Do not steal
  // focus if the visitor has moved to another control before this event runs.
  if (document.activeElement !== document.body && !dialog.contains(document.activeElement)) return;
  if (demoOpener?.getClientRects().length) demoOpener.focus({ preventScroll: true });
  else menuToggle.focus({ preventScroll: true });
});
