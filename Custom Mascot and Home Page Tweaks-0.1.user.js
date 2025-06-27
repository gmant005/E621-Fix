// ==UserScript==
// @name         Custom Mascot and Home Page Tweaks
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Modify homepage layout and styling for mascot and footer
// @author       You
// @match        https://e621.net
// @match        https://e926.net
// @grant        none
// ==/UserScript==

// Constants
const STYLES = `
  .mascotbox {
    z-index: 1;
    overflow: hidden;
    position: relative;
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: 50% 0;
    margin: 10px auto;
    padding: 2px 0;
    width: 480px;
    max-width: 98vw;
    border-radius: 5px;
    box-shadow: 0 0 5px #000;
    text-shadow: 0 0 2px black, 0 0 6px black;
    text-align: center;
    backdrop-filter: blur(8px);
  }

  #links {
    margin-bottom: 0.25rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #links > a {
    padding: 0.25rem 0.25rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .news-excerpt {
    padding: 5px 1em 0 1em;
  }

  #searchbox3, #news-excerpt-box .previous-news-link {
    font-size: 80%;
  }
`;

const HOME_SEARCH_REPLACEMENT = `
  <div id="static-index">
    <h1 style="font-size: 4em;">
      <a href="/">${window.location.hostname === 'e926.net' ? 'e926' : 'e621'}</a>
    </h1>
    <div id="links">
      <a title="Login or sign up" href="/session/new">Login/Signup</a>
      <a title="A paginated list of every post" href="/posts">Posts</a>
      <a title="A paginated list of every comment" href="/comments">Comments</a>
      <a title="A paginated list of every tag" href="/tags">Tags</a>
      <a title="Wiki" href="/wiki_pages?title=help%3Ahome">Wiki</a>
      <a title="Forum" href="/forum_topics">Forum</a>
      <a title="A site map" href="/static/site_map">»</a>
    </div>
    <div>
      <form action="/posts" accept-charset="UTF-8" method="get">
        <div>
          <input type="text" name="tags" id="tags" value="" size="30" autofocus="autofocus"
                 data-autocomplete="tag-query" class="ui-autocomplete-input" autocomplete="off"><br>
          <input type="submit" value="Search">
          <input type="button" value="Change Mascot" id="change-mascot">
        </div>
      </form>
    </div>
  </div>
`;

const MASCOTBOX_HTML = `<section class="mascotbox"></section>`;

// Core Functions
function removeNavigation() {
  document.querySelector('nav.navigation')?.remove();
}

function injectGlobalStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = STYLES;
  document.head.appendChild(styleElement);
}

function replaceHomeSearchElements() {
  document.querySelectorAll('.home-search').forEach(element => {
    element.outerHTML = HOME_SEARCH_REPLACEMENT;
  });
}

function updateHomeSectionClasses() {
  document.querySelectorAll('#a-home .home-section').forEach(element => {
    element.className = element.className.replace(/\bhome-section\b/g, 'mascotbox');
  });
}

function replaceHomeButtonsContent() {
  const mascotArtist = document.getElementById('mascot-artist');
  const homeButtons = document.querySelector('.home-buttons');

  if (mascotArtist && homeButtons) {
    homeButtons.outerHTML = mascotArtist.outerHTML;
  }
}

function insertAdditionalMascotbox() {
  const firstMascotbox = document.querySelector('.mascotbox');
  if (firstMascotbox) {
    firstMascotbox.insertAdjacentHTML('afterend', MASCOTBOX_HTML);
  }
}

function relocateFooterContent() {
  const footer = document.querySelector('.home-footer-counter');
  const targetMascotbox = document.querySelector('.mascotbox:nth-of-type(2)');

  if (footer && targetMascotbox) {
    targetMascotbox.appendChild(footer);
  }
}

function removeObsoleteElements() {
  document.querySelector('.home-footer-top')?.remove();
}

function processAndUpdateFooter() {
  const mascotboxes = document.querySelectorAll('.mascotbox');
  if (mascotboxes.length < 2) return;

  const footerMascotbox = mascotboxes[1];
  const images = footerMascotbox.querySelectorAll('.home-footer-counter img');

  // Extract the number from the image filenames
  let postCount = '';
  images.forEach(img => {
    const src = img.getAttribute('src');
    // Match the filename (e.g., "4.png") and extract the digit
    const match = src.match(/(\d+)\.png$/);
    if (match) {
      postCount += match[1]; // Append the digit
    }
  });

  if (!postCount) return;

  // Format the number with commas
  const formattedCount = Number(postCount).toLocaleString();
  const footerBottom = document.querySelector('section.home-footer-bottom');

  if (footerBottom) {
    const newFooter = document.createElement('section');
    newFooter.className = 'mascotbox searchbox3';
    newFooter.innerHTML = `
      <p>
        Serving ${formattedCount} posts<br>
        <a title="Takedown Information" href="/static/takedown">Takedown Policy and Process</a>
        | <a title="Contact Us" href="/static/contact">Contact Us</a>
        | <a title="Advertising with Us" href="/help/advertising">Advertising</a>
        | <a title="Terms of Service" href="/static/terms_of_service">Terms of Service</a>
        | <a title="Privacy Policy" href="/static/privacy">Privacy</a>
      </p>
    `;

    footerBottom.replaceWith(newFooter);
  }
}

// Main Execution
function main() {
  removeNavigation();
  injectGlobalStyles();
  replaceHomeSearchElements();
  updateHomeSectionClasses();
  replaceHomeButtonsContent();
  insertAdditionalMascotbox();
  relocateFooterContent();
  removeObsoleteElements();
  processAndUpdateFooter();
}

// Execute
main();
