function initializeC2E2Gallery(mediaItems) {
    const galleryContainer = document.getElementById('gallery-container');
    const lightbox = document.getElementById('lightbox');
    const lightboxMediaContainer = document.getElementById('lightbox-media-container');
    const closeButton = document.querySelector('.lightbox-close');
    const prevButton = document.querySelector('.lightbox-prev');
    const nextButton = document.querySelector('.lightbox-next');

    if (!galleryContainer || !lightbox || !lightboxMediaContainer || !closeButton || !prevButton || !nextButton) {
        console.error("Gallery initialization failed: One or more required HTML elements are missing.");
        return;
    }

    let currentIndex = 0;
    let shuffledItems = [...mediaItems];

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function populateGallery() {
        galleryContainer.innerHTML = '';

        shuffledItems.forEach((item, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.index = index;

            if (item.type === 'image') {
                const img = document.createElement('img');
                img.src = 'https://placehold.co/400x600/1f2937/4b5563?text=Loading...';
                img.dataset.src = item.src;
                img.alt = `C2E2 Gallery Image ${index + 1}`;
                img.loading = 'lazy';
                img.onerror = function() {
                    this.onerror = null;
                    this.src = 'https://placehold.co/400x600/ef4444/ffffff?text=Image+Failed';
                };
                galleryItem.appendChild(img);
            } else if (item.type === 'video') {
                const video = document.createElement('video');
                video.dataset.src = item.src;
                video.playsInline = true;
                video.loop = true;
                video.muted = true;
                galleryItem.appendChild(video);
                const overlay = document.createElement('div');
                overlay.className = 'video-overlay';
                overlay.innerHTML = '<div class="play-icon">▶</div>';
                galleryItem.appendChild(overlay);
            } else if (item.type === 'youtube') {
                const img = document.createElement('img');
                img.src = 'https://placehold.co/400x600/1f2937/4b5563?text=Loading...';
                img.dataset.src = item.thumbnail;
                img.alt = `YouTube Video ${index + 1}`;
                img.loading = 'lazy';
                img.onerror = function() {
                    this.onerror = null;
                    this.src = 'https://placehold.co/400x600/ef4444/ffffff?text=Image+Failed';
                };
                galleryItem.appendChild(img);
                const overlay = document.createElement('div');
                overlay.className = 'video-overlay';
                overlay.innerHTML = '<div class="play-icon">▶</div>';
                galleryItem.appendChild(overlay);
            }

            galleryContainer.appendChild(galleryItem);
        });
    }

    function setupLazyLoader() {
        const lazyItems = document.querySelectorAll('[data-src]');
        
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const mediaElement = entry.target;
                    mediaElement.src = mediaElement.dataset.src;
                    
                    if (mediaElement.tagName === 'VIDEO') {
                       mediaElement.play().catch(error => {
                           console.warn("Video autoplay prevented:", error);
                       });
                    }
                    
                    observer.unobserve(mediaElement);
                }
            });
        }, { 
            rootMargin: "0px 0px 250px 0px" 
        });

        lazyItems.forEach(item => observer.observe(item));
    }

    function showLightbox(index) {
        currentIndex = parseInt(index);
        const item = shuffledItems[currentIndex];
        
        lightboxMediaContainer.innerHTML = '';

        if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = `C2E2 Gallery Image ${currentIndex + 1}`;
            lightboxMediaContainer.appendChild(img);
        } else if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.src;
            video.controls = true;
            video.autoplay = true;
            video.loop = true;
            lightboxMediaContainer.appendChild(video);
        } else if (item.type === 'youtube') {
            const embedContainer = document.createElement('div');
            embedContainer.className = 'lightbox-youtube-embed';
            const iframe = document.createElement('iframe');
            iframe.src = `${item.src}?autoplay=1&rel=0`;
            iframe.title = "YouTube video player";
            iframe.frameBorder = "0";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.allowFullscreen = true;
            embedContainer.appendChild(iframe);
            lightboxMediaContainer.appendChild(embedContainer);
        }

        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function hideLightbox() {
        lightbox.classList.add('hidden');
        document.body.style.overflow = '';
        lightboxMediaContainer.innerHTML = '';
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % shuffledItems.length;
        showLightbox(currentIndex);
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + shuffledItems.length) % shuffledItems.length;
        showLightbox(currentIndex);
    }
    
    galleryContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (item && item.dataset.index) {
            showLightbox(item.dataset.index);
        }
    });

    closeButton.addEventListener('click', hideLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            hideLightbox();
        }
    });

    nextButton.addEventListener('click', showNext);
    prevButton.addEventListener('click', showPrev);
    
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('hidden')) return;
        if (e.key === 'ArrowRight') showNext();
        else if (e.key === 'ArrowLeft') showPrev();
        else if (e.key === 'Escape') hideLightbox();
    });

    shuffleArray(shuffledItems);
    populateGallery();
    setupLazyLoader();
}
