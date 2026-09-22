const fs=require('node:fs');
const path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,f),'utf8');
let html=read('index.html').replace('<link rel="stylesheet" href="style.css">',()=>`<style>${read('style.css')}</style>`);
for(const file of ['content.js','cultivation.js','immortal.js','core.js','records.js','records-view.js','app.js'])html=html.replace(`<script src="${file}"></script>`,()=>`<script>${read(file)}</script>`);
// A public URL is optional; never invent a canonical address for a local game.
const site=process.env.JIANGHU_SITE_URL;
if(site){const base=new URL(site);if(!['https:','http:'].includes(base.protocol))throw Error('JIANGHU_SITE_URL 必須為 HTTP(S) 網址');html=html.replaceAll('content="assets/social-card.png"',`content="${new URL('assets/social-card.png',base).href}"`);}
const folder=path.join(__dirname,'交付版');
fs.mkdirSync(path.join(folder,'assets'),{recursive:true});
fs.writeFileSync(path.join(folder,'index.html'),html,'utf8');
for(const file of ['site.webmanifest','favicon.ico','README.md'])fs.copyFileSync(path.join(__dirname,file),path.join(folder,file));
for(const file of fs.readdirSync(path.join(__dirname,'assets')))fs.copyFileSync(path.join(__dirname,'assets',file),path.join(folder,'assets',file));
fs.writeFileSync(path.join(folder,'開始遊戲.cmd'),'@echo off\r\nstart "" "%~dp0index.html"\r\n','ascii');
let standalone=html.replace(/<link rel="manifest"[^>]*>\s*/,'');
const assets={'assets/favicon.svg':'image/svg+xml','assets/icon-32.png':'image/png','assets/icon-180.png':'image/png','favicon.ico':'image/x-icon'};
for(const[file,mime]of Object.entries(assets)){const data=`data:${mime};base64,${fs.readFileSync(path.join(__dirname,file)).toString('base64')}`;standalone=standalone.replaceAll(`"${file}"`,`"${data}"`);}
// Social crawlers cannot preview a file:// document. Omit their image pointers in the one-file edition.
standalone=standalone.replace(/<meta (?:property="og:image(?:[^"]*)?"|name="twitter:image")[^>]*>\s*/g,'');
fs.writeFileSync(path.join(__dirname,'江湖一生.html'),standalone,'utf8');
console.log('已建立：江湖一生.html（圖示內嵌）及 交付版/index.html（完整資產）');
