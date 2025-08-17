@echo off
echo 正在下載並安裝 PostgreSQL...
echo.

REM 下載 PostgreSQL 15 安裝程式
echo 1. 請手動下載 PostgreSQL 15 from:
echo    https://www.postgresql.org/download/windows/
echo.

echo 2. 或使用 Chocolatey 安裝:
echo    choco install postgresql15 --params '/Password:yourpassword'
echo.

echo 3. 安裝完成後，需要設置環境變數:
echo    添加到 PATH: C:\Program Files\PostgreSQL\15\bin
echo.

echo 4. 然後安裝 pgvector 擴展:
echo    git clone https://github.com/pgvector/pgvector.git
echo    cd pgvector
echo    make
echo    make install
echo.

pause