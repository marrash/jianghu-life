from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root=Path(__file__).resolve().parent.parent
folder=root/'交付版'
if not (folder/'index.html').is_file():
    raise SystemExit('請先執行 npm run build')
target=root/'releases'/'江湖一生_完整交付_v2.0.zip'
target.parent.mkdir(parents=True,exist_ok=True)
with ZipFile(target,'w',ZIP_DEFLATED) as z:
    for p in sorted(folder.rglob('*')):
        if p.is_file():
            z.write(p,p.relative_to(folder).as_posix())
    z.write(root/'江湖一生.html','江湖一生_單檔版.html')
    z.write(root/'docs'/'release-v2.0.md','交付與驗證.md')
with ZipFile(target) as z:
    assert z.testzip() is None
    print(f'完成：{target.name}，{len(z.namelist())} 個檔案，ZIP CRC 檢查通過。')
