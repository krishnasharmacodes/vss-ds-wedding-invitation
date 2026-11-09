const total = 10;
        function go(i) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.querySelector('.page[data-i="' + i + '"]').classList.add('active');
            document.getElementById('prog').style.width = ((i + 1) / total * 100) + '%';
            window.scrollTo(0, 0);
            if (i === 6) runSuspense();
        }
        function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); }
        function rsvp() { toast('धन्यवाद! हमें आपका इंतज़ार रहेगा 🙏'); }

        const petalEmojis = ['🌹', '🌸', '🌼'];
        const pwrap = document.getElementById('petals');
        for (let i = 0; i < 14; i++) {
            const p = document.createElement('div'); p.className = 'petal'; p.textContent = petalEmojis[i % petalEmojis.length];
            p.style.left = Math.random() * 100 + 'vw'; p.style.animationDuration = (9 + Math.random() * 8) + 's'; p.style.animationDelay = (Math.random() * 10) + 's';
            pwrap.appendChild(p);
        }
        for (let i = 0; i < 20; i++) {
            const s = document.createElement('div'); s.className = 'spark'; s.style.left = Math.random() * 100 + 'vw'; s.style.top = Math.random() * 100 + 'vh';
            s.style.animationDelay = (Math.random() * 3) + 's'; pwrap.appendChild(s);
        }
        function runSuspense() {
            const lines = ['अरे रुको! रुको! जरा सब्र करो...', 'इतनी जल्दी क्या है?', 'अभी तो सबसे बड़ा धमाका बाकी है!', 'तैयार हो जाओ... अब आएगी शादी की तारीख!'];
            const el = document.getElementById('susp'); let idx = 0; el.textContent = lines[0];
            if (el._t) clearInterval(el._t);
            el._t = setInterval(() => { idx++; if (idx >= lines.length) { clearInterval(el._t); return; } el.style.opacity = 0; setTimeout(() => { el.textContent = lines[idx]; el.style.opacity = 1; }, 300); }, 1600);
        }

        // countdown to wedding
        function tickCountdown() {
            const target = new Date('2026-12-09T00:00:00+05:30').getTime();
            const now = Date.now(); let diff = Math.max(0, target - now);
            const d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000) % 24, m = Math.floor(diff / 60000) % 60, s = Math.floor(diff / 1000) % 60;
            const el = document.getElementById('countdown');
            el.innerHTML = [['Days', d], ['Hrs', h], ['Min', m], ['Sec', s]].map(([l, v]) => `<div class="cbox"><b>${v}</b>${l}</div>`).join('');
        }
        tickCountdown(); setInterval(tickCountdown, 1000);

        // whatsapp share
        (function () {
            const url = location.href;
            const text = encodeURIComponent('आप सभी को Er. Vidyasagar Sharma व Dolly Sharma के विवाह समारोह में सादर आमंत्रित किया जाता है। निमंत्रण देखें: ' + url);
            document.getElementById('waShare').href = 'https://wa.me/?text=' + text;
        })();

        const wishesStorageKey = 'sharmaWeddingWishes';
        let localWishes = [];
        try {
            const savedWishes = JSON.parse(localStorage.getItem(wishesStorageKey) || '[]');
            if (Array.isArray(savedWishes)) localWishes = savedWishes;
        } catch (e) { }

        function renderWishes(wishes) {
            const sorted = [...wishes].sort((a, b) => (b.ts || 0) - (a.ts || 0));
            const html = sorted.length === 0 ? '<i>सबसे पहले शुभकामना दें!</i>' :
                sorted.map(w => `<div class="wishitem"><b>${esc(w.name || 'Guest')}</b>: ${esc(w.text || '')}<br><small>${esc(w.date || '')}</small></div>`).join('');
            ['wishlist', 'wishlist2'].forEach(id => {
                const list = document.getElementById(id);
                if (list) list.innerHTML = html;
            });
        }

        renderWishes(localWishes);
        const firebaseConfig = {
            apiKey: 'YOUR_FIREBASE_API_KEY',
            authDomain: 'YOUR_FIREBASE_AUTH_DOMAIN',
            databaseURL: 'YOUR_FIREBASE_DATABASE_URL',
            projectId: 'YOUR_FIREBASE_PROJECT_ID',
            appId: 'YOUR_FIREBASE_APP_ID'
        };
        let firebaseApi = null;
        (async () => {
            try {
                if (Object.values(firebaseConfig).some(value => value.startsWith('YOUR_'))) return;
                const [{ initializeApp }, { getDatabase, ref, onValue, set }] = await Promise.all([
                    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
                    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js')
                ]);
                const app = initializeApp(firebaseConfig);
                const database = getDatabase(app);
                firebaseApi = { database, ref, onValue, set };
                onValue(ref(database, 'wishes'), snapshot => {
                    const cloudData = snapshot.val() || {};
                    const cloudWishes = Object.values(cloudData);
                    const cloudIds = new Set(cloudWishes.map(w => w.id));
                    renderWishes([...cloudWishes, ...localWishes.filter(w => !cloudIds.has(w.id))]);
                });
            } catch (e) { }
        })();
        function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
        async function submitWish() {
            const name = document.getElementById('wname').value.trim();
            const text = document.getElementById('wtext').value.trim();
            const err = document.getElementById('werr'); err.textContent = '';
            if (!name || !text) { err.textContent = 'कृपया नाम और शुभकामना दोनों लिखें।'; return; }
            if (name.length > 40 || text.length > 200) { err.textContent = 'टेक्स्ट बहुत लंबा है।'; return; }
            const wish = { id: 'w_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), name, text, ts: Date.now(), date: new Date().toLocaleDateString('hi-IN') };
            localWishes = [wish, ...localWishes.filter(saved => saved.id !== wish.id)];
            let savedLocally = false;
            try {
                localStorage.setItem(wishesStorageKey, JSON.stringify(localWishes));
                savedLocally = true;
            } catch (e) { }
            renderWishes(localWishes);
            let savedToCloud = false;
            if (firebaseApi) {
                try {
                    await firebaseApi.set(firebaseApi.ref(firebaseApi.database, 'wishes/' + wish.id), wish);
                    savedToCloud = true;
                } catch (e) { }
            }
            if (!savedLocally && !savedToCloud) { err.textContent = 'शुभकामना सेव नहीं हो सकी।'; return; }
            document.getElementById('wname').value = ''; document.getElementById('wtext').value = '';
            toast('शुभकामना के लिए धन्यवाद! ❤');
        }
