/**
 * Japanese copy, written in Japanese from the meaning (WEBSITE.md §8) with Studio's own terms
 * (packages/studio/locales/ja.json: 台本, UIデザイナー, 台詞, 選択肢, 演出, テストプレイ, レイヤー立ち絵, 口パク, 書き出し).
 * Not yet reviewed by a native speaker. Links to pages that exist only in English say （英語）.
 */
import { CONTACT_URL, REPO, atTag } from '../lib/site';
import type { Copy } from './en';

export const ja: Copy = {
  meta: {
    title: 'Himawari：Windows で使える無料のノベルゲーム制作ツール',
    description:
      'Himawari Studio は、Windows で使える無料・オープンソースのビジュアルノベルエンジンとエディタです。物語を書くとその場でゲームが動き、書き出したゲームはどの Windows PC でも動きます。',
    suffix: 'Himawari',
  },
  chrome: {
    skip: '本文へスキップ',
    logoAlt: 'Himawari Studio: Visual Novel Engine and Maker by Moeko Works',
    langLabel: '言語',
    langOther: 'English',
    motionOn: 'MOTION ON',
    motionOff: 'MOTION OFF',
    github: 'GitHub の Himawari',
    contact: 'Moeko Works へのお問い合わせ',
    navLabel: 'セクション',
    menu: 'メニュー',
    close: 'メニューを閉じる',
    nav: [
      { id: 'features', label: 'FEATURES', name: '機能' },
      { id: 'download', label: 'DOWNLOAD', name: 'ダウンロード' },
      { id: 'learn', label: 'LEARN', name: '学ぶ' },
      { id: 'news', label: 'NEWS', name: 'お知らせ' },
      { id: 'faq', label: 'FAQ', name: 'よくある質問' },
    ],
    newsLabel: 'NEWS',
    newsName: '最新のお知らせ',
    footer: {
      links: [
        { label: 'PRIVACY', href: '/ja/privacy' },
        { label: 'ABOUT', href: '/ja/about' },
        { label: 'GITHUB', href: REPO },
      ],
      legal: 'COPYRIGHT © MOEKO WORKS · RUNTIME ZLIB · TOOLS MIT',
      madeBy: 'Moeko Works 制作',
    },
    english: '（英語）',
    panels: {
      download: 'ダウンロード',
      learn: '学ぶ',
      news: '最新のお知らせ',
      faq: 'よくある質問',
      allQuestions: 'すべての質問',
      system: 'Windows 10・11（64 ビット）。無料です。',
    },
  },
  hero: {
    title: '物語を書いたそばから、<mark>ゲームで遊べる。</mark>',
    lead: 'Windows で使える無料のノベルゲーム制作ツールです。コードは不要。遊ぶ人は何もインストールせずに遊べます。',
    download: 'Windows 版をダウンロード',
    firstGame: 'はじめてのゲームを作る',
    firstGameHref: '/ja/docs/tutorials/first-game',
    note: 'エディタの隣で、1 秒以内にゲームへ反映',
    windowLabel: 'Himawari Studio のイメージ：エディタに入力した台詞が、隣のゲーム画面に表示されます',
    file: 'start.hws',
    narration: 'ナレーション',
    narrationLine: 'ひまわりは、わたしより背が高い。',
    speaker: 'ハナ',
    add: ['+ 台詞', '+ 選択肢', '+ 演出'],
    lines: [
      { text: '今夜はお祭りだよ。準備、手伝ってくれる？', mood: 'happy', face: '^ ^' },
      { text: 'えっ、ちょうちんを忘れたの？', mood: 'surprised', face: 'o o' },
      { text: 'じゃあ、一緒に作ろう。', mood: 'smile', face: '^ ‿ ^' },
    ],
  },
  about: {
    title: 'ABOUT',
    label: 'Himawari について',
    cards: [
      {
        icon: 'pencil-simple-line',
        title: 'だれでも使える',
        text: 'ボタンとフォームで、台詞、選択肢、キャラクターを作れます。絵がまだなくても、最初の 1 行から物語を再生できます。',
      },
      {
        icon: 'code',
        title: 'コードを書く人にもひらかれている',
        text: '同じプロジェクトがプレーンテキストのファイルです。コマンドラインツールで扱えて、git とも相性がよく、独自の命令で拡張もできます。',
      },
      {
        icon: 'lightning',
        title: 'どの PC でも軽く動く',
        text: '完成したゲームは、絵と音楽を除いて約 3 MB。Windows 10・11 ならダブルクリックで起動します。',
      },
    ],
  },
  features: {
    title: 'FEATURES',
    label: '機能',
    writers: {
      kicker: 'シナリオを書く人に',
      title: '物語の 1 行が、台本の 1 行に。',
      text: 'だれが話すか、どんな表情かを選んで、台詞を入力するだけ。選択肢も音楽も背景も、メニューとフォームで設定できます。コードは書きません。',
      list: ['入力するとすぐゲームに反映', '好きな行から再生', '自動保存と、すべての変更の履歴'],
      shotTitle: '台本',
      shotAlt: 'Himawari Studio：左に台本、右にゲーム画面',
    },
    artists: {
      kicker: '絵を描く人に',
      title: 'メニューも、ゲームに合わせたデザインに。',
      text: 'テキストボックスや選択肢、各メニューの位置、大きさ、色を、動いているゲームの上でそのまま変えられます。プリセットから始められ、コントラストもその場で確認できます。',
      list: [
        'まばたきと口パクに対応したレイヤー立ち絵',
        'Photoshop から取り込み',
        '7 つのプリセットとカラーパレット',
      ],
      shotTitle: 'UIデザイナー',
      shotAlt: 'UIデザイナー：プリセット、カラーパレット、大きさを変えられるテキストボックス',
    },
    coders: {
      kicker: 'コードを書く人に',
      title: '読めて、差分が取れて、スクリプトで書ける。',
      text: 'シーンは小さなスクリプト言語の <code>.hws</code> ファイル、キャラクターは Markdown です。Studio、コマンドラインツール、AI ツールは同じコンパイラを使うので、結果が食い違いません。',
      list: [
        '<code>hwc</code> で、チェック、ビルド、全ルートのテストプレイをターミナルや CI から',
        'git できれいに差分・マージできるファイル',
        'マクロや C で独自の命令を追加',
      ],
      codeTitle: 'sunflower-days / start.hws',
      codeLabel: 'サンプル「Sunflower Days」のシーン（プレーンテキスト）',
    },
    more: [
      {
        icon: 'translate',
        kicker: '翻訳する人に',
        title: 'ほかの言語は、必要になったら追加。',
        text: 'すべての台詞に翻訳表の欄ができます。CSV や XLIFF で書き出していつものツールで作業でき、プレイヤーはゲームのメニューで言語を切り替えられます。',
      },
      {
        icon: 'package',
        kicker: '完成したゲーム',
        title: 'ボタンひとつで書き出し。',
        text: 'ゲーム名とアイコン付きのフォルダ、または 1 つの <code>.exe</code> に書き出せます。セーブ、巻き戻し、バックログ、アクセシビリティ設定を備え、完成したゲームは一切通信しません。',
      },
      {
        icon: 'sparkle',
        kicker: 'AI は任意',
        title: 'AI は、使いたいときだけ。',
        text: '有効にするまでオフのままで、どの機能も手作業でできます。文章の下書き、校正、翻訳を手伝い、画像、音楽、音声、動画は作りません。',
      },
    ],
  },
  soon: {
    pill: 'COMING SOON',
    title: 'Himawari で作ったノベルゲームを制作中です。',
    text: 'Moeko Works が、いまダウンロードできるこのエンジンで作っています。続報は準備ができしだい。',
  },
  download: {
    title: 'DOWNLOAD',
    label: 'ダウンロード',
    heading: 'Windows 版 Himawari Studio',
    intro:
      'エディタ、ゲームエンジン、コマンドラインツール、チュートリアル、3 つのサンプルゲームが、すべてインストーラーに入っています。ほかに必要なものはありません。',
    phone: 'Himawari は Windows PC で動きます。ダウンロードはパソコンからどうぞ。',
    requirements: {
      caption: '動作環境',
      cols: ['', 'Himawari Studio（エディタ）', '書き出したゲーム'],
      rows: [
        ['Windows', '10 または 11（64 ビット）', '10 または 11（64 ビット）'],
        ['ディスク容量', '約 500 MB', '約 3 MB ＋ 絵と音楽'],
        [
          'グラフィックス',
          '問いません。内蔵 GPU で十分です',
          '問いません。ドライバーがなくてもソフトウェア描画で動きます',
        ],
        ['メモリ', '4 GB 以上', '一般的な 1080p の場面で 150 MB 未満'],
        ['ほかに入れるもの', 'なし', 'なし'],
      ],
      arm: 'Arm 版の Windows 11 でも x64 エミュレーションで動くはずですが、まだ確認していません。',
    },
    smartscreen: {
      title: 'Windows に警告されたら',
      text: 'インストーラーはまだコード署名されていないため、Windows SmartScreen が「Windows によって PC が保護されました」と表示することがあります。<b>詳細情報</b>を選んでから、<b>実行</b>を選んでください。コード署名は 1.0 までに対応する予定です。',
    },
    sha: 'インストーラーの SHA-256',
    notes: 'リリースノート（英語）',
    all: 'すべてのリリース',
    more: 'インストール手順と過去のバージョン',
  },
  learn: {
    title: 'LEARN',
    label: '学ぶ',
    items: [
      {
        icon: 'graduation-cap',
        title: 'はじめてのゲームを作る',
        text: '空のプロジェクトから短いゲームを作る、手順つきのチュートリアルです。',
        href: '/ja/docs/tutorials/first-game',
      },
      {
        icon: 'book-open',
        title: 'ドキュメント',
        text: 'ゲームの書き出し、言語の追加、クレジットの書き方などの手引きとリファレンス。多くは英語です。',
        href: '/ja/docs',
      },
      {
        icon: 'sparkle',
        title: 'AI と使う（英語）',
        text: '内蔵アシスタントや Claude Code の設定方法。AI を使わないこともできます。',
        href: '/docs/ai-setup',
      },
      {
        icon: 'file-code',
        title: 'スクリプト言語（英語）',
        text: 'コードを書く人向け。言語、バイトコード、アセットパック、デバッグプロトコルの仕様です。',
        href: atTag('spec/language.md'),
      },
      {
        icon: 'github-logo',
        title: 'ソースコード',
        text: 'エンジン、Studio、ツール、テストのすべてを GitHub で公開しています。',
        href: REPO,
      },
    ],
  },
  news: {
    title: 'NEWS',
    label: 'お知らせ',
    all: 'お知らせ一覧',
  },
  faq: {
    title: 'FAQ',
    label: 'よくある質問',
    items: [
      {
        q: 'プログラミングの知識は必要ですか？',
        a: 'いいえ。Studio の操作は、すべてボタン、選択メニュー、フォームでできます。スクリプト表示は、使いたい人のためにあります。',
      },
      {
        q: 'プレイヤーは何かをインストールする必要がありますか？',
        a: 'いいえ。書き出したゲームはフォルダか 1 つのファイルで、Windows 10・11 ならダブルクリックで起動します。',
      },
      {
        q: '無料ですか？ 作ったゲームを販売できますか？',
        a: 'どちらも「はい」です。Himawari は無料のオープンソースで、作ったゲームは販売できます。ゲームに含まれるエンジンは zlib ライセンスなので、Himawari のクレジット表記は必須ではありませんが、書いていただけるとうれしいです（<a href="/docs/how-to/credit-himawari">クレジットの書き方</a>・英語）。物語と絵は、すべてあなたのものです。',
      },
      {
        q: 'AI を使わなければいけませんか？',
        a: 'いいえ。AI は有効にするまでオフで、どの機能も手作業でできます。詳しくは「<a href="/docs/explanation/ai-is-optional">AI は任意です</a>」（英語）をご覧ください。',
      },
      {
        q: '作品がどこかへ送信されることはありますか？',
        a: 'ありません。Studio にもゲームにも、サーバー、アカウント、テレメトリー、アクセス解析はありません。文章が PC の外に出るのは、AI 機能を有効にして使ったときだけです。詳しくは<a href="/ja/privacy">プライバシー</a>をご覧ください。',
      },
      {
        q: 'Ren’Py とはどう違いますか？',
        a: 'Ren’Py は歴史があり、大きなコミュニティがあります。Himawari はコードを書きたくない人向けで、ビジュアルエディタとライブプレビューを最初から備えています。また、スクリプト言語が閉じているので、ツールで安全にチェックや編集ができます。Ren’Py のスクリプトは中に Python を含むため、これが難しいのです。対応プラットフォームは Ren’Py のほうが多く、Himawari はいまのところ Windows のみです。',
      },
      {
        q: 'Mac 版や Linux 版は出ますか？',
        a: `Linux は 1.0 の後に予定しています。ほかのプラットフォームは要望しだいです。<a href="${REPO}#roadmap">ロードマップ</a>（英語）をご覧ください。`,
      },
    ],
  },
  involved: {
    title: 'GET INVOLVED',
    label: '参加する',
    items: [
      {
        icon: 'chat-circle-text',
        title: '問題を報告する',
        text: 'Moeko Works のお問い合わせページか、Studio の「設定 → Himawari Studio について → 問題を報告」からどうぞ。',
        href: CONTACT_URL,
      },
      {
        icon: 'bug',
        title: 'GitHub の Issue',
        text: '何をしたか、何が起きると思ったか、実際に何が起きたかを書いてください。',
        href: `${REPO}/issues`,
      },
      {
        icon: 'git-pull-request',
        title: 'コントリビュート（英語）',
        text: 'はじめ方と、仕様の変更がどう決まるか。',
        href: atTag('CONTRIBUTING.md'),
      },
      {
        icon: 'shield-check',
        title: 'セキュリティ（英語）',
        text: 'セキュリティの問題は、公開の Issue ではなく非公開で報告してください。',
        href: atTag('SECURITY.md'),
      },
    ],
  },

  pages: {
    download: {
      title: 'ダウンロード',
      description:
        'Windows 10・11 向け Himawari Studio のダウンロード。インストーラー、動作環境、SmartScreen の警告への対処、SHA-256。',
      lead: 'Windows 10・11（64 ビット）向けの Himawari Studio です。エディタ、ゲームエンジン、コマンドラインツール、チュートリアル、3 つのサンプルゲームが 1 つのインストーラーに入っています。',
      stepsTitle: 'インストール',
      steps: [
        '<b>{file}</b> をダウンロードします。',
        '実行します。自分だけ（管理者権限は不要）か、この PC のすべてのユーザーにインストールするかを選べます。',
        'セットアップが終わると Studio が開きます。手順つきで作るなら<b>チュートリアルを開く</b>、自分の作品をはじめるなら<b>新規プロジェクト</b>を選んでください。',
      ],
      checkTitle: 'ファイルを確かめる',
      checkText:
        'ダウンロードしたフォルダで PowerShell を開いてこのコマンドを実行すると、ファイルの SHA-256 が表示されます。上の値と同じなら正しいファイルです。',
      updateTitle: 'アップデート',
      updateText:
        'Studio はまだ自動ではアップデートされません。新しいインストーラーをダウンロードして実行してください。古いバージョンに上書きでインストールしても、プロジェクトと設定はそのまま残ります。',
      olderTitle: 'すべてのバージョン',
      published: '公開日',
      size: 'サイズ',
      notes: 'ノート',
    },
    news: {
      title: 'お知らせ',
      description: 'Moeko Works のビジュアルノベルエンジン Himawari のリリースとお知らせ。',
      lead: 'リリースとお知らせ。',
      back: 'お知らせ一覧',
      github: 'GitHub のリリース（英語）',
    },
    privacy: {
      title: 'プライバシー',
      description:
        'このサイトが訪問者に Cookie を使わずに何をどう数えているか。そして Himawari 自体は何も送信しないこと。',
    },
    about: {
      title: 'Himawari について',
      description: 'Himawari を作っている人、プロジェクトの運営方法、ライセンス。',
    },
    docs: {
      title: 'ドキュメント',
      description: 'Himawari のドキュメント。チュートリアル、手引き、リファレンス、解説。',
      source: 'GitHub でこのページを見る',
      version: 'Himawari {version} 向け',
      contents: 'ドキュメント',
    },
    notFound: {
      title: 'ページが見つかりません',
      text: 'このページは、どこかへ飛んでいってしまったようです。移動したか、アドレスが違うのかもしれません。',
      home: 'ホームへ戻る',
      docs: 'ドキュメント',
    },
  },
};
