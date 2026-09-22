const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
test('獨立 HTML 內嵌分頁圖示與遊戲，不依賴旁邊的程式或圖片檔',()=>{
  const html=fs.readFileSync(path.join(root,'江湖一生.html'),'utf8');
  assert.match(html,/<link rel="icon" type="image\/svg\+xml" href="data:image\/svg\+xml;base64,/);
  assert.doesNotMatch(html,/<script\s+src=/);
  assert.doesNotMatch(html,/<link[^>]+href="(?:assets\/|style\.css|favicon\.ico|site\.webmanifest)/);
  assert.doesNotMatch(html,/<img[^>]+src="assets\//);
  assert.match(html,/完整生涯版 · v2\.0/);
});
test('交付資料夾含可開啟網頁、圖示與所有 manifest 資產',()=>{
  const folder=path.join(root,'交付版');
  assert.ok(fs.existsSync(path.join(folder,'index.html')));
  const manifest=JSON.parse(fs.readFileSync(path.join(folder,'site.webmanifest'),'utf8'));
  for(const icon of manifest.icons)assert.ok(fs.existsSync(path.join(folder,icon.src)),icon.src);
  assert.ok(fs.existsSync(path.join(folder,'favicon.ico')));
  assert.ok(fs.existsSync(path.join(folder,'開始遊戲.cmd')));
  const html=fs.readFileSync(path.join(folder,'index.html'),'utf8');
  assert.doesNotMatch(html,/<script\s+src=/);
  assert.match(html,/og:image/);
});
