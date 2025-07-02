const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// フォームデータのパース
app.use(express.urlencoded({ extended: true }));

// セッション設定
app.use(session({
  secret: process.env.SESSION_SECRET || 'a-secure-default-secret', // 環境変数から読み込む
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPSで必須
    httpOnly: true, // JavaScriptからのアクセスを禁止
    sameSite: 'strict' // CSRF対策
  }
}));

// 簡易パスワード（本番ではデータベースや環境変数を使用）
const correctPassword = 'Egaon2012'; // 適切に変更

// ログインページ
app.get('/login', (req, res) => {
  // 既に認証済みの場合はルートにリダイレクト
  if (req.session.authenticated) {
    res.redirect('/');
    return;
  }
  res.send(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ログイン</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex flex-col items-center justify-center min-h-screen p-4">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 class="text-2xl font-bold mb-4 text-center">認証</h1>
        <form method="POST" action="/login">
          <input name="password" type="password" placeholder="パスワードを入力" class="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">ログイン</button>
          <p class="text-red-500 mt-2 ${req.query.error ? '' : 'hidden'}">パスワードが正しくありません</p>
        </form>
      </div>
    </body>
    </html>
  `);
});

// ログイン処理
app.post('/login', (req, res) => {
  if (req.body.password === correctPassword) {
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.redirect('/login?error=true');
  }
});

// 認証ミドルウェア
// これ以降のルートは認証が必要
app.use((req, res, next) => {
  console.log('Session:', req.session); // セッションの状態をログに出力
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/login');
  }
});

// 静的ファイルの提供（認証後に配置）
app.use(express.static(path.join(__dirname, 'public')));

// ルートでindex.htmlを提供
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});