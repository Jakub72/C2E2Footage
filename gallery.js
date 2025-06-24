function initializeC2E2Gallery(media) {
    const galleryContainer = document.getElementById('gallery-container');
    const lightbox = document.getElementById('lightbox');
    const lightboxMediaContainer = document.getElementById('lightbox-media-container');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    if (!galleryContainer || !lightbox || !lightboxMediaContainer) {
        console.error('Essential gallery or lightbox elements are missing from the HTML.');
        return;
    }

    let currentMediaIndex = 0;

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function getYouTubeID(url) {
        let id = '';
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            id = urlObj.pathname.slice(1);
        } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
            id = urlObj.searchParams.get('v');
        }
        return id;
    }

    function renderGallery() {
        galleryContainer.innerHTML = '';
        const mediaToRender = [...media];

        const isDesktop = window.innerWidth >= 768; // Tailwind's 'md' breakpoint

        if (isDesktop) {
            shuffleArray(mediaToRender);
        }

        mediaToRender.forEach((mediaItem, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';

            const createVideoOverlay = () => {
                const overlay = document.createElement('div');
                overlay.className = 'video-overlay';
                const playIcon = document.createElement('div');
                playIcon.className = 'play-icon';
                playIcon.textContent = '▶';
                overlay.appendChild(playIcon);
                galleryItem.appendChild(overlay);
            };

            if (mediaItem.type === 'image') {
                const img = document.createElement('img');
                img.src = mediaItem.src;
                img.loading = 'lazy';
                img.decoding = 'async';
                galleryItem.appendChild(img);
            } else if (mediaItem.type === 'video') {
                const video = document.createElement('video');
                video.src = mediaItem.src;
                video.loading = 'lazy';
                video.muted = true;
                video.playsInline = true;
                video.autoplay = true;
                video.loop = true;
                galleryItem.appendChild(video);
                createVideoOverlay();
            } else if (mediaItem.type === 'youtube') {
                const videoId = getYouTubeID(mediaItem.src);
                const img = document.createElement('img');
                img.src = mediaItem.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                img.loading = 'lazy';
                img.decoding = 'async';
                galleryItem.appendChild(img);
                createVideoOverlay();
            }

            galleryItem.addEventListener('click', () => {
                openLightbox(media.indexOf(mediaItem));
            });
            galleryContainer.appendChild(galleryItem);
        });
    }

    function openLightbox(index) {
        currentMediaIndex = index;
        lightbox.classList.remove('hidden');
        displayMediaInLightbox();
    }

    function closeLightbox() {
        lightbox.classList.add('hidden');
        lightboxMediaContainer.innerHTML = '';
    }

    function showNextMedia() {
        currentMediaIndex = (currentMediaIndex + 1) % media.length;
        displayMediaInLightbox();
    }

    function showPrevMedia() {
        currentMediaIndex = (currentMediaIndex - 1 + media.length) % media.length;
        displayMediaInLightbox();
    }

    function displayMediaInLightbox() {
        lightboxMediaContainer.innerHTML = '';
        const mediaItem = media[currentMediaIndex];

        if (mediaItem.type === 'image') {
            const img = document.createElement('img');
            img.src = mediaItem.src;
            lightboxMediaContainer.appendChild(img);
        } else if (mediaItem.type === 'video') {
            const video = document.createElement('video');
            video.src = mediaItem.src;
            video.controls = true;
            video.autoplay = true;
            video.loop = true;
            lightboxMediaContainer.appendChild(video);
        } else if (mediaItem.type === 'youtube') {
            const videoId = getYouTubeID(mediaItem.src);
            const embedContainer = document.createElement('div');
            embedContainer.className = 'lightbox-youtube-embed';
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            iframe.setAttribute('allowfullscreen', '');
            embedContainer.appendChild(iframe);
            lightboxMediaContainer.appendChild(embedContainer);
        }
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', showNextMedia);
    lightboxPrev.addEventListener('click', showPrevMedia);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('hidden')) return;

        if (e.key === 'ArrowRight') {
            showNextMedia();
        } else if (e.key === 'ArrowLeft') {
            showPrevMedia();
        } else if (e.key === 'Escape') {
            closeLightbox();
        }
    });

    let touchstartX = 0;
    let touchendX = 0;
    let touchstartY = 0;
    let touchendY = 0;

    lightbox.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
        touchstartY = e.changedTouches[0].screenY;
    }, { passive: true });

    lightbox.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        touchendY = e.changedTouches[0].screenY;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeDistX = touchendX - touchstartX;
        const swipeDistY = touchendY - touchstartY;
        const swipeThreshold = 50;
        const verticalThreshold = 100;

        if (Math.abs(swipeDistX) > swipeThreshold && Math.abs(swipeDistY) < verticalThreshold) {
            if (swipeDistX < 0) {
                showNextMedia();
            } else {
                showPrevMedia();
            }
        }
    }

    renderGallery();
    window.addEventListener('resize', renderGallery);
}