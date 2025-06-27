// ==UserScript==
// @name         E6 Better Posts
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  returns it to old
// @author       You
// @match        https://e621.net/*
// @match        https://e926.net/*
// @grant        GM_addStyle
// ==/UserScript==

// thanks to Hornblende on E6 for makeing the base CSS changes that allow for most of this to work.
(function() {
    'use strict';

    // First inject all CSS before any JS runs
    GM_addStyle(`
        @media (min-width: 800px) {
            body[data-st-contain="true"] article.thumbnail {
                min-height: unset;
                max-width: var(--thumb-image-size);
            }
        }

        body[data-st-contain="true"] article.thumbnail a {
            background: unset;
            height: unset;
        }

        body[data-st-contain="true"] article.thumbnail img {
            width: unset;
            max-width: 100%;
        }

        article.thumbnail .desc {
            max-width: var(--thumb-image-size);
            height: unset;
        }

        .comment-post-grid .author-info .avatar .post-thumbnail.blacklisted img {
            padding: 150px 150px 0 0;
            background-size: 150px;
        }

        article.thumbnail {
            transition: width 0.2s ease-out, height 0.2s ease-out !important;
            overflow: visible !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
        }
        article.thumbnail a {
            display: flex !important;
            justify-content: center !important;
            width: 100% !important;
        }
        article.thumbnail img {
            display: block !important;
            object-fit: contain !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: 80vh !important;
        }
        .desc {
            width: 100% !important;
        }
    `);

    // Wait for next animation frame to ensure styles are applied
    requestAnimationFrame(function() {
        function getImageDimensions(img) {
            const rect = img.getBoundingClientRect();
            return {
                width: rect.width || img.offsetWidth || img.clientWidth || img.naturalWidth,
                height: rect.height || img.offsetHeight || img.clientHeight || img.naturalHeight,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
            };
        }

        function adjustArticle(article) {
            const img = article.querySelector('img');
            if (!img) return;

            const dims = getImageDimensions(img);
            if (dims.width <= 10 || dims.height <= 10) {
                setTimeout(() => adjustArticle(article), 300);
                return;
            }

            const isPortrait = dims.height > dims.width;
            const aspectRatio = dims.naturalWidth / dims.naturalHeight;

            if (isPortrait) {
                const targetHeight = Math.min(dims.naturalHeight, 1000);
                const calculatedWidth = targetHeight * aspectRatio;
                article.style.width = `${calculatedWidth}px`;
            } else {
                article.style.width = `${dims.width}px`;
            }

            article.style.height = 'auto';
            article.style.minWidth = '0';
            article.style.maxWidth = 'none';
            article.dataset.adjusted = 'true';
        }

        function processAllArticles() {
            document.querySelectorAll('article.thumbnail:not([data-adjusted])').forEach(adjustArticle);
        }

        // Initial processing with style-application delay
        setTimeout(function() {
            let attempts = 0;
            function initialProcess() {
                processAllArticles();
                if (attempts++ < 3) {
                    setTimeout(initialProcess, 500);
                }
            }
            initialProcess();
        }, 100);

        // Mutation Observer with style check
        const observer = new MutationObserver(function(mutations) {
            if (document.head.querySelector('style')) {
                setTimeout(processAllArticles, 100);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Image load handler
        document.addEventListener('load', function(e) {
            if (e.target.tagName === 'IMG') {
                const article = e.target.closest('article.thumbnail');
                if (article) setTimeout(() => adjustArticle(article), 100);
            }
        }, true);

        // Debounced resize handler
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                document.querySelectorAll('article.thumbnail').forEach(a => {
                    a.removeAttribute('data-adjusted');
                });
                processAllArticles();
            }, 200);
        });
    });
})();