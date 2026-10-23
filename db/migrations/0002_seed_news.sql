-- The two release posts that were Markdown in the repo, so all news is edited in the admin panel.
insert into "news_posts" ("slug", "posted_on", "category", "link", "title_en", "summary_en", "body_en", "title_ja", "summary_ja", "body_ja", "status", "published_at")
values
  ('2026-10-22-himawari-studio-0-4-0', '2026-10-22', 'Release', 'https://github.com/PastelSalt/himawari-c/releases/tag/v0.4.0', 'Himawari Studio 0.4.0, the first public build', 'Studio, the engine, and game export work from start to finish. Expect rough edges, and please report them.', 'The first public build of Himawari Studio, the editor for making visual novels with Himawari.

Studio, the engine, and game export work from start to finish and are covered by automated tests, but testing with real writers hasn''t started yet, so expect rough edges and please report them.

Everything is inside the installer: the game engine, the command-line tools, the tutorial, and three sample games.', '最初の公開版、Himawari Studio 0.4.0', 'Studio、エンジン、ゲームの書き出しが最初から最後まで使えます。まだ荒いところがあるので、ぜひ報告してください。', 'Himawari でビジュアルノベルを作るためのエディタ、Himawari Studio の最初の公開版です。

Studio、エンジン、ゲームの書き出しは最初から最後まで動き、自動テストで確かめています。ただ、実際の書き手によるテストはまだこれからなので、使いにくいところがあるかもしれません。見つけたら、ぜひ報告してください。

ゲームエンジン、コマンドラインツール、チュートリアル、3 つのサンプルゲームが、すべてインストーラーに入っています。', 'published', '2026-10-22T04:17:37Z'),
  ('2026-10-22-himawari-studio-0-4-1', '2026-10-22', 'Release', 'https://github.com/PastelSalt/himawari-c/releases/tag/v0.4.1', 'Himawari Studio 0.4.1 is out', 'Each sample now opens its own copy.', 'A fix for the first public build.

In 0.4.0, Sunflower Days was copied into the same folder as Layered Sprites, so after opening one sample, the other''s button opened the first again. Now every sample has its own folder in `Documents\Himawari`.

If you used 0.4.0, a copy of Sunflower Days may be sitting in `Documents\Himawari\Layered Sprites`. Rename or remove that folder once, and both samples will open their own copies. Your own projects aren''t affected.', 'Himawari Studio 0.4.1 を公開しました', 'サンプルが、それぞれ自分のコピーで開くようになりました。', '最初の公開版の不具合を直したリリースです。

0.4.0 では、Sunflower Days が Layered Sprites と同じフォルダにコピーされていたため、片方のサンプルを開いたあと、もう片方のボタンを押しても最初のサンプルが開いていました。今回から、サンプルはそれぞれ `ドキュメント\Himawari` の中の自分のフォルダにコピーされます。

0.4.0 を使っていた場合は、`ドキュメント\Himawari\Layered Sprites` に Sunflower Days のコピーが残っているかもしれません。このフォルダの名前を変えるか削除すると、どちらのサンプルも自分のコピーで開くようになります。ご自身のプロジェクトには影響しません。', 'published', '2026-10-22T04:47:38Z')
on conflict ("slug") do nothing;
