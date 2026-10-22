---
title: Himawari Studio 0.4.1 is out
date: 2026-10-22T04:47:38Z
category: Release
summary: Each sample now opens its own copy.
link: https://github.com/PastelSalt/himawari-c/releases/tag/v0.4.1
---

A fix for the first public build.

In 0.4.0, Sunflower Days was copied into the same folder as Layered Sprites, so after opening one sample, the other's button opened the first again. Now every sample has its own folder in `Documents\Himawari`.

If you used 0.4.0, a copy of Sunflower Days may be sitting in `Documents\Himawari\Layered Sprites`. Rename or remove that folder once, and both samples will open their own copies. Your own projects aren't affected.
