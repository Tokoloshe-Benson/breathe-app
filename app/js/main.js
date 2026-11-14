// 啟動（架構對話維護）：所有分頁檔載入後才執行
go('breath');
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
