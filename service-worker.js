// このファイルは、電波が弱いときやオフラインのときでもページを開けるように、
// 必要なファイルをスマホに保存しておく(キャッシュする)ための仕組みです。
// リストを更新したときにすぐ反映されるよう、つながるときは常に最新を取りに行き、
// つながらないときだけ保存しておいたものを使います。

const CACHE_NAME = 'mercari-gen-cache-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './jojo.json',
  './wcf.json',
  './tags.json',
];

// 初めて開いたときに、必要なファイルを保存しておく
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

// 古い保存分を消して、新しいものに入れ替える
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// まず最新を取りに行き、取れたら保存し直す。取れなければ保存しておいたものを使う
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
