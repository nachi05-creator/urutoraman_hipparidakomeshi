if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error('GSAPまたはScrollTriggerが読み込まれていません。CDNの接続、<script>タグの記述順を確認してください。');
} else {
    gsap.registerPlugin(ScrollTrigger);
}

window.addEventListener('DOMContentLoaded', () => {
    const loadingTotal = 71; // 00001〜00071
    const scrollTotal = 72;  // 00〜71

    const preloadImage = (src) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn(`画像が見つかりません: ${src}`);
                resolve(null);
            };
            img.src = src;
        });
    };

    async function init() {
        const loadingContainer = document.getElementById('loading-container');
        const heroContainer = document.getElementById('hero-animation-container');

        // ローディング画像を並列読み込み (1〜71)
        const loadingPromises = [];
        for (let i = 1; i <= loadingTotal; i++) {
            const src = `image/loading/loading_${i.toString().padStart(5, '0')}.png`;
            loadingPromises.push(preloadImage(src));
        }
        const loadingResults = await Promise.all(loadingPromises);
        const loadingImgs = [];
        loadingResults.forEach((img) => {
            if (img) {
                img.className = "loading-img";
                loadingContainer.appendChild(img);
                loadingImgs.push(img);
            }
        });

        // スクロール画像を並列読み込み (00〜71)
        const scrollPromises = [];
        for (let i = 0; i < scrollTotal; i++) {
            const src = `image/scroll/scroll${i.toString().padStart(2, '0')}.png`;
            scrollPromises.push(preloadImage(src));
        }
        const scrollResults = await Promise.all(scrollPromises);
        const scrollImgs = [];
        scrollResults.forEach((img) => {
            if (img) {
                img.className = "hero-img";
                img.style.display = 'none';
                heroContainer.appendChild(img);
                scrollImgs.push(img);
            }
        });

        console.log(`ローディング画像: ${loadingImgs.length}/${loadingTotal}枚 読み込み成功`);
        console.log(`スクロール画像: ${scrollImgs.length}/${scrollTotal}枚 読み込み成功`);

        startLoading(loadingImgs, scrollImgs);
    }

    function startLoading(loadingImgs, scrollImgs) {
        let i = 0;
        if (loadingImgs.length === 0) {
            document.getElementById('loading-screen').style.display = 'none';
            setupScroll(scrollImgs);
            return;
        }

        loadingImgs[0].classList.add('active');
        const timer = setInterval(() => {
            loadingImgs[i].classList.remove('active');
            i++;
            if (i < loadingImgs.length) {
                loadingImgs[i].classList.add('active');
            } else {
                clearInterval(timer);
                document.getElementById("loading-screen").style.display = 'none';
                document.getElementById("animation-layer").style.display = "block";
                setupScroll(scrollImgs);
            }
        }, 50);
    }

   function setupScroll(scrollImgs) {
    if (scrollImgs.length === 0) return;
    scrollImgs[0].style.display = 'block';

    ScrollTrigger.create({
        trigger: "#scroll-spacer",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
            const index = Math.min(Math.floor(self.progress * scrollImgs.length), scrollImgs.length - 1);
            scrollImgs.forEach((img, idx) => {
                img.style.display = (idx === index) ? 'block' : 'none';
            });
        },
        onLeave: (self) => {
    console.log('スクロールアニメーション終了 → ゲームへ切り替え');
    document.getElementById('animation-layer').style.display = 'none';
    document.getElementById('game-layer').style.pointerEvents = 'auto'; 
    self.kill();
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    }
    });
}
    init();
});