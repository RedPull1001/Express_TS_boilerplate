# Express × TypeScript ボイラープレート作成

参考：https://neos21.net/blog/2020/06/13-01.html

## package.json を生成し、TypeScript環境を作る

**package.jsonとは**
依存関係を示したファイルで、このファイルにプロジェクトに必要なパッケージの名前とバージョンを記述すればnpmが必要なパッケージをインストールする。

各プロパティの内容は以下のような感じ

|プロパティ名|説明|
|:-:|:-:|
|name|アプリ名。それ以外に特に意味はない値。|
|version|アプリのバージョン。更新したら数値を自分で手動で変える。|
|description|アプリの説明。それ以外に特に意味はない値。|
|main|npm run ~で起点となるファイル。明示的に使用する場合が殆どなのであまり利用しない。|
|scripts|コマンドのエイリアスを登録する場所。ここに例えば`"dev": "next dev",`と書いていた場合、`npm run dev`を入力すると`npm run next dev`が実行される|
|keywords|npmパッケージハブにアップした際の検索に利用。アップしないなら特に意味はない。|
|author|アプリ制作者。アップしないなら必要ない。|
|license|ソフトウェア・ライセンスを記載。アップしないなら必要ない。|
|depedencies|そのプロジェクトで使うパッケージの名前がバージョンが入っています。|
|devDepedencies|開発時にコードを書く人が必要なパッケージが入っています。例えば、コードを整形するパッケージやコードの間違いを見つけてくれるパッケージが入っています。|


```
# package.json を生成する
# yオプションは、「これで作っていいですか？」⇒yes の入力を省略できるだけ
$ npm init -y
# TS環境を作る
$ npm i -D typescript @types/node
# 以下で tsconfig.json を生成する。あとで内容を編集する
$ npm run tsc -- --init
```

※`npm run tsc -- --init`実行できなかった。
<https://qiita.com/masanarih0ri/items/006633ab5c8d8ce64f57>

※`--save`について
<https://qiita.com/hvfnabndnd/items/c5beda8572aa8c1e6be6>

```
# -S = --saveオプションらしい。現在はデフォルトで入っているのでなくてもいい
$ npm i -S express
# Dオプションpackage.jsonのdevDependenciesに記述する
# -d だとdependencies
# @types/expressは、「TypeScriptでExpressを使えるようにする」ライブラリ
$ npm i -D @types/express

# 基本のフォルダ/ファイルを作成
$ mkdir src
$ touch src/index.ts

# ※以降は確認だけ------------------------------------------------
# コードをビルドする時はこんな感じ (後で npm run build にする)
$ npm run tsc

# ビルドしたコードを実行する時はこんな感じ (後で npm start にする)
$ node dist/index.js
```

## ts-node : トランスパイルなしで動作させるためのツール

ts-nodeを利用するとTypeScriptのファイルを指定して実行することができます

```
$ npm i -D ts-node

# ※
# 使う時はこんな感じ (後で npm run start-ts にする)
$ npm run ts-node src/index.ts
```

## ts-node-dev : ts-node のライブリロード開発対応版

tsファイルをjsファイルにコンパイルすることなく、起動することができる。
(ts-nodeと同様)
さらに監視モードで素早く再起動が使用できる。

```
$ npm i -D ts-node-dev

# 使う時はこんな感じ・ファイルの変更監視をしてくれる (後で npm run dev にする)
$ npm run ts-node-dev src/index.ts
```

## ESLint : Linter

**ESlintとは**
ESlint(読み方：「イーエスリント」)は、JavaScriptやTypeScriptなどの静的解析ツールである。ESlintを導入することで、単純な構文エラーやプロジェクト固有のコーディング規約を定義することができる。厳密なルールを定義することで、複数人で開発する場合でもシステム全体のコードの一貫性を維持することができる。

```
$ npm i -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# .eslintrc.js を生成する。あとで内容を編集する
$ npm run eslint -- --init
⇒実行できなかった。なんで？

# ※
# 使う時はこんな感じ (後で npm run lint にする)
$ npm run eslint -- --ext '.js,.ts' ./src/**

# Lint + 自動修正を行う場合はこんな感じ (後で npm run lint-fix にする)
$ npm run eslint -- --fix --ext '.js,.ts' ./src/**"
```

## Jest : ユニットテスト

```
# TypeScriptでjestを使うためのライブラリ
$ npm i -D jest ts-jest @types/jest

# Express API をモック化するために入れておく
# モック化⇒単体テストする際に必要な部品の値を疑似的に設定する
$ npm i -D supertest @types/supertest

# 設定ファイルを作成する・内容は後述する
$ touch jest.config.js

# テストファイルを書く
$ mkdir test
$ touch test/index.spec.ts

# 使う時はこんな感じ (後で npm test にする)
$ npm run jest -- --coverage
# coverage/ ディレクトリにカバレッジレポートが出力される

# ライブリロードでテストを行う場合はこんな感じ (後で npm run test-watch にする)
$ npm run jest -- --coverage --watch
```

### 〇Supertest を使う時は

**Supertestとは**
⇒Express用のテストライブラリ

ソースコードとテストコードをそれぞれ次のように記述すること。

`src/index.ts`

```javascript
import * as express from 'express';

const app = express();
app.get('/', (req, res) => { res.send('Hello World'); });

// ユニットテスト時の呼び出しでなければサーバを起動する
if(!module.parent) {
  app.listen(process.env.PORT || 8080, () => {
    console.log('Listening');
  });
}

// ユニットテストのために app をエクスポートする
export default app;
```

`test/index.spec.ts`

```
import * as supertest from 'supertest';

import app from '../src/index';

describe('サーバのテスト', () => {
  it('Path [/] のテスト', async () => {
    const res = await supertest(app).get('/');
    expect(res.text).toBe('Hello World');
  });
});
```

こんな感じ。app.listen() をユニットテスト時に実行しないようにしておく。以前も Jasmine を使う際の解説に書いたが、Jest でも同様だった。

参考：https://neos21.net/blog/2019/02/07-01.html

## 各種設定ファイル

本プロジェクトで必要になる設定ファイルは以下のとおり。

- `package.json`
- `tsconfig.json`
- `.eslintrc.js`
- `jest.config.js`

それぞれの内容を記載していく。

### 〇package.json

前述のコマンドを叩いていったあと、`scripts`セクションを書いていく。

```json
{
  "name": "typescript-express-boilerplate",
  "private": true,
  "scripts": {
    "eslint": "eslint",
    "jest": "jest",
    "ts-node": "ts-node",
    "tsc": "tsc",
    "?start": "echo 'トランスパイル済の Express サーバを起動する・事前に npm run build を実行し ./dist/ ディレクトリにコードを生成しておくこと'",
    "start": "node ./dist/index.js",
    "?start-ts": "echo 'ts-node で ./src/ 配下のコードを直接実行する'",
    "start-ts": "ts-node ./src/index.ts",
    "?dev": "echo 'ライブリロード開発を開始する・ts-node-dev で ./src/ 配下のコードを直接実行する'",
    "dev": "ts-node-dev ./src/index.ts",
    "?lint": "echo 'ESLint を実行する (型チェックはできないので npm run build を利用する)'",
    "lint": "eslint --ext '.js,.ts' ./src/**",
    "?lint-fix": "echo 'ESLint を実行し、自動修正できる箇所は修正する'",
    "lint-fix": "eslint --fix --ext '.js,.ts' ./src/**",
    "?test": "echo 'ユニットテストを実行する・結果は ./coverage/ ディレクトリに出力される'",
    "test": "jest --coverage",
    "?test-watch": "echo 'ユニットテストを監視実行する'",
    "test-watch": "jest --coverage --watch",
    "?build": "echo 'TypeScript をトランスパイルする・設定は ./tsconfig.json を参照'",
    "build": "tsc"
  },
  "dependencies": {
    "body-parser": "1.19.0",
    "express": "4.17.1"
  },
  "devDependencies": {
    "@types/express": "4.17.6",
    "@types/jest": "25.2.3",
    "@types/node": "14.0.5",
    "@types/supertest": "2.0.9",
    "@typescript-eslint/eslint-plugin": "3.0.0",
    "@typescript-eslint/parser": "3.0.0",
    "eslint": "7.1.0",
    "jest": "26.0.1",
    "supertest": "4.0.2",
    "ts-jest": "26.0.0",
    "ts-node": "8.10.1",
    "ts-node-dev": "1.0.0-pre.44",
    "typescript": "3.9.3"
  }
}
```

### 〇tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    
    // 以下、デフォルトから設定を変更したところ
    
    // トランスパイル後のファイルを出力するディレクトリを指定する
    "outDir": "./dist",
    // モジュール解決の方法を指定する
    "moduleResolution": "node",
    // import * as を認識させるため false にする
    "esModuleInterop": false
  },
  // トランスパイル対象ディレクトリを指定する
  "include": [
    "./src/**/*"
  ]
}
```

./dist/ にビルド後のファイルを出力するので、.gitignore で dist/ を無視しておこう。

### .eslintrc.js

```javascript
module.exports = {
  //どのようなグローバルオブジェクトを宣言なしで参照可能にするかを ESLint に知らせるための設定
  env: {
    es6: true,
    node: true
  },
  // 複数のルールをまとめたコンフィギュレーション名を適用します。
  // ここで指定可能ものを sharable configuration オブジェクトと呼びます。 
  // ESLint 標準のもの（eslint:recommeded など）以外は、npm パッケージをインストールすることで指定できるようになります。
  extends: [
    'plugin:@typescript-eslint/recommended'
  ],
  //TypeScript コード (.ts、.tsx) を扱えるようにするには、TypeScript 用のパーサーをインストールして指定する必要がある
  parser: '@typescript-eslint/parser',
  //パーサーの設定
  parserOptions: {
    sourceType: 'module'
  },
  //ESLint プラグインを使用するには、あらかじめ npm でインストールした上で、ここに列挙しておく必要があります。
  //さらに、実際にルールを有効化するには、extends なども指定する必要があります。
  plugins: [
    '@typescript-eslint'
  ]
};
```

※↑独自にルール設定したい場合は rules: [] を追加する。何のルールも設定しない空配列だとエラーになるので、その場合は記述しないでおく。

### jest.config.js

```javascript
module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
};
```

---

## 【補足】ESLintにPrettierを追加する

Prettier は、Linter というよりはコード・フォーマッタといえるツール。ESLint 越しに呼び出せるので連携する人も多いだろう。

強制力が強すぎるのが嫌で自分は入れなかったが、導入する際は前述の手順に加えて以下を行う。

`$ npm i -D prettier eslint-config-prettier eslint-plugin-prettier`

### .eslintrc.js

```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint'
  ],
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    es6: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    // Prettier のルールを上書きする場合は次のように書く
    'prettier/prettier': [
      'error',
      {
        // シングルクォートを使う
        singleQuote: true,
        // 配列の最後の要素の後ろにカンマを置かなくて良い
        trailingComma: 'none'
      }
    ]
  }
};
```

---

## 参考

フロントエンドやるなら入れておくべきESlintってなに？
<https://qiita.com/mzmz__02/items/63f2624e00c02be2f942>
ts-node と ts-node-dev の違い
<https://qiita.com/sa9ra4ma/items/67ab5ac6fea3e5f065b0>
ESLint の設定ファイル (.eslintrc) の各プロパティの意味を理解する
<https://maku.blog/p/j6iu7it/>