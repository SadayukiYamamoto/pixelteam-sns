# Python 3.12 をベースイメージとして使用
FROM python:3.12-slim

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係のインストールに必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    libpq-dev \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# 依存関係ファイルのコピーとインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードのコピー
COPY . .

# 静的ファイルの収集
ENV DJANGO_SETTINGS_MODULE=pixelshop_backend.settings
RUN python manage.py collectstatic --noinput

# 実行コマンド (マイグレーションとデータのシードを実行してから Gunicorn を起動)
CMD ["sh", "-c", "python manage.py migrate && python seed_all.py && gunicorn --bind 0.0.0.0:8080 pixelshop_backend.wsgi:application"]
