# Node.jsの公式イメージをベースにする
FROM node:20-slim

# 作業ディレクトリを設定
WORKDIR /usr/src/app

# package.jsonとpackage-lock.jsonをコピーして依存関係をインストール
# これにより、依存関係が変更されない限り、このレイヤーはキャッシュされる
COPY package*.json ./
RUN npm install --production

# アプリケーションのソースコードをコピー
# srcディレクトリ全体をコピーする
COPY src ./src

# ポートを設定 (Cloud RunはPORT環境変数を使用)
ENV PORT 8080
EXPOSE 8080

# アプリケーションを起動
CMD [ "node", "src/server.js" ]