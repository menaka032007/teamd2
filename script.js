// ============ Mobile Menu Toggle ============
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close mobile menu after clicking a link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ============ Active Link Highlight on Scroll ============
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');

function updateActiveLink() {
  let currentSection = sections[0].id;
  const scrollPos = window.scrollY + window.innerHeight / 3;

  sections.forEach(section => {
    if (scrollPos >= section.offsetTop) {
      currentSection = section.id;
    }
  });

  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === `#${currentSection}`) {
      item.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveLink);
window.addEventListener('load', updateActiveLink);

// ============ Live Hackathons Ticker ============
// Points to the backend server (see /server folder). Update this URL
// to your deployed backend's address in production.
const HACKATHON_API_URL = 'http://localhost:4000/api/hackathons';

// How often to re-poll the backend for fresh data (5 minutes).
const HACKATHON_POLL_INTERVAL = 5 * 60 * 1000;

const tickerTrack = document.getElementById('ticker-track');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderTicker(hackathons) {
  if (!tickerTrack) return;

  if (!hackathons || hackathons.length === 0) {
    tickerTrack.innerHTML = '<span class="ticker-item">No live hackathons right now — check back soon!</span>';
    return;
  }

  // Build the item markup, then duplicate the list so the CSS marquee
  // (which translates by -50%) loops seamlessly.
  const itemsHtml = hackathons
    .map((h) => {
      const title = escapeHtml(h.title);
      const source = escapeHtml(h.source || '');
      const date = h.date ? `<span class="date-tag">${escapeHtml(h.date)}</span>` : '';

      return `<a class="ticker-item" href="${h.link}" target="_blank" rel="noopener noreferrer">
        ${source ? `<span class="source-tag">${source}</span>` : ''}
        ${title}
        ${date}
      </a>`;
    })
    .join('');

  tickerTrack.innerHTML = itemsHtml + itemsHtml; // duplicate for seamless loop
}

async function fetchHackathons() {
  if (!tickerTrack) return;

  try {
    const res = await fetch(HACKATHON_API_URL);
    if (!res.ok) throw new Error(`Status ${res.status}`);

    const data = await res.json();
    renderTicker(data.hackathons);
  } catch (err) {
    console.error('Failed to load hackathons:', err.message);
    tickerTrack.innerHTML =
      '<span class="ticker-item">Unable to load live hackathons — showing cached info next refresh.</span>';
  }
}

fetchHackathons();
setInterval(fetchHackathons, HACKATHON_POLL_INTERVAL);
const form = document.getElementById('contact-form');
const successMsg = document.getElementById('form-success');

const WHATSAPP_NUMBER = '918778545478'; // country code + number, no '+' or spaces

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const fullName = data.get('fullname').trim();
  const contact = data.get('contact').trim();
  const email = data.get('email').trim();
  const status = data.get('status');
  const message = data.get('message').trim();

  const text =
    `New TeamD Contact Form Submission%0A` +
    `--------------------------------%0A` +
    `Full Name: ${encodeURIComponent(fullName)}%0A` +
    `Contact Number: ${encodeURIComponent(contact)}%0A` +
    `Email Address: ${encodeURIComponent(email)}%0A` +
    `Status: ${encodeURIComponent(status)}%0A` +
    `Additional Information: ${encodeURIComponent(message || '-')}`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

  successMsg.classList.add('show');

  setTimeout(() => {
    window.open(whatsappUrl, '_blank');
    successMsg.classList.remove('show');
    form.reset();
  }, 800);
});

// ============ Dynamic Feedback Form ============
const feedbackForm = document.getElementById('feedback-form');
const feedbackCategorySelect = document.getElementById('feedback-category');
const feedbackFieldGroups = document.querySelectorAll('.feedback-fields');
const feedbackSuccess = document.getElementById('feedback-success');

// Human-readable labels for each category (used in the WhatsApp message)
const FEEDBACK_CATEGORY_LABELS = {
  website: 'Website Feedback',
  community: 'Community Feedback',
  event: 'Event Feedback',
  workshop: 'Workshop Feedback',
  hackathon: 'Hackathon Feedback',
  general: 'General Suggestion',
};

// Show only the field group matching the selected category; hide the rest.
// Fields inside hidden groups are also disabled so they are excluded from
// FormData and don't trigger "required" validation.
function updateFeedbackFields() {
  const selected = feedbackCategorySelect.value;

  feedbackFieldGroups.forEach((group) => {
    const isMatch = group.dataset.category === selected;
    group.hidden = !isMatch;

    group.querySelectorAll('input, select, textarea').forEach((field) => {
      field.disabled = !isMatch;
    });
  });
}

if (feedbackCategorySelect) {
  feedbackCategorySelect.addEventListener('change', updateFeedbackFields);
  updateFeedbackFields(); // run once on load (all hidden until a category is picked)
}

// Friendly labels for form field names, used when building the WhatsApp message.
const FEEDBACK_FIELD_LABELS = {
  fullname: 'Full Name',
  email: 'Email Address',

  website_page: 'Page',
  website_navigation: 'Easy to navigate',
  website_issues: 'Issues / Bugs',
  website_improvements: 'Suggested Improvements',

  community_satisfaction: 'Community Satisfaction',
  community_helpful: 'Discussions/Support Helpful',
  community_more: 'Would Like More Of',
  community_additional: 'Additional Suggestions',

  event_name: 'Event Name',
  event_date: 'Event Date',
  event_rating: 'Event Rating',
  event_liked: 'What They Liked',
  event_improve: 'What Can Improve',

  workshop_name: 'Workshop Name',
  workshop_content_useful: 'Content Useful',
  workshop_trainer_effective: 'Trainer Effective',
  workshop_future_topics: 'Future Topics',
  workshop_comments: 'Additional Comments',

  hackathon_name: 'Hackathon Name',
  hackathon_participation: 'Participation Type',
  hackathon_problem_interesting: 'Problem Statement Interesting',
  hackathon_mentoring: 'Mentoring & Support',
  hackathon_suggestions: 'Suggestions',

  general_category: 'Category',
  general_idea: 'Suggestion / Idea',
  general_why: 'Why It Matters',
  general_comments: 'Additional Comments',
};

feedbackForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const data = new FormData(feedbackForm);
  const category = data.get('category');

  let text =
    `New TeamD Feedback Submission%0A` +
    `--------------------------------%0A` +
    `Category: ${encodeURIComponent(FEEDBACK_CATEGORY_LABELS[category] || category)}%0A`;

  data.forEach((value, key) => {
    if (key === 'category') return;
    const trimmed = String(value).trim();
    if (!trimmed) return;

    const label = FEEDBACK_FIELD_LABELS[key] || key;
    text += `${encodeURIComponent(label)}: ${encodeURIComponent(trimmed)}%0A`;
  });

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

  feedbackSuccess.classList.add('show');

  setTimeout(() => {
    window.open(whatsappUrl, '_blank');
    feedbackSuccess.classList.remove('show');
    feedbackForm.reset();
    updateFeedbackFields();
  }, 800);
});