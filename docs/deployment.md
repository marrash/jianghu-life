# GitHub Pages 部署

儲存庫：https://github.com/marrash/jianghu-life

預定網站：https://marrash.github.io/jianghu-life/

GitHub Pages 的來源設為 GitHub Actions。每次推送 main，流程會以 Node 22 建置交付版，執行完整測試，再部署通過檢查的網站。網站發布範圍為「交付版」資料夾，含 favicon、分享圖與 manifest；原始碼、測試及開發文件不放進網站成品。

分享圖片在建置時透過 JIANGHU_SITE_URL 轉為公開絕對網址。網址與原本 localhost 是不同儲存空間；接續本機人物須先匯出 JSON，再於正式網站匯入。

## 日後同步

修改原始碼後執行 npm run build、npm test，再提交並推送 main。Actions 的 build 與 deploy 成功後，到公開網址檢查；流程成功不等於已完成人工遊玩驗收。

Git 不追蹤本機交付資料夾、單檔 HTML 與 ZIP，這些都由原始碼重建。下載版仍可執行 npm run build 及 npm run package 產生。

私人儲存庫須有支援 GitHub Pages 的方案；若帳號不支援，需由擁有者選擇將儲存庫公開或升級方案。設定完成以前，以上網址是預定位置，並不代表已上線。
