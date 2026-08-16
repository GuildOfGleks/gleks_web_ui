# Appearance baseline for the lab's component pages

What every documentation page looked like on **2026-08-16, against `@guildofgleks/ui` 21.4.3**,
recorded so that the examples refactor in `lab-stackblitz-plan.md` can be checked mechanically
instead of by eye. Eyeballing thirty pages is exactly what failed last time.

## What is recorded, and why this and not screenshots

One line per page: the path, then one entry per `.demo-card__preview` **in document order**:

```
<width>x<height>/<text length>/<text hash>
```

Geometry plus the normalised `innerText` of the preview. Deliberately not a pixel diff and not a
DOM diff:

- **Pixel diffs are noise here.** Half these pages animate — spinners, skeletons, progress bars,
  toasts — so a screenshot never equals the previous screenshot.
- **DOM diffs will be noise after the refactor.** Extraction wraps each demo in its own component
  host, and Angular rewrites every `_ngcontent-*` attribute, so the markup legitimately changes
  while the page looks identical.
- **Geometry plus text does not move if the page did not.** A preview that changed width, grew a
  row, lost a label or gained a stray wrapper shows up immediately; a preview whose internals were
  merely re-parented does not. It also catches the specific failure this is guarding against — an
  extracted example that no longer receives the layout the page used to give it.

An entry of `.../0/45h` is an empty-text preview (a divider, a bare progress bar); that is normal.

## Re-capturing

`npm run start:lab`, then for each path below, navigate and evaluate:

```js
(() => {
  const h = (s) => { let x = 5381; for (let i = 0; i < s.length; i++) x = ((x * 33) ^ s.charCodeAt(i)) >>> 0; return x.toString(36); };
  const n = (s) => (s || '').replace(/\s+/g, ' ').trim();
  return location.pathname + ' ' + [...document.querySelectorAll('.demo-card__preview')]
    .map((e) => { const r = e.getBoundingClientRect(), t = n(e.innerText);
      return Math.round(r.width) + 'x' + Math.round(r.height) + '/' + t.length + '/' + h(t); })
    .join(' ');
})();
```

**Give the page a second or two before evaluating** — a preview measured mid-render reports the
wrong height, and a false failure here is worse than no check, because the next person stops
trusting it.

**The viewport matters.** These were taken at a 1568px-wide window with the sidebar and the
table of contents both visible, which is what puts the content column at 1110px. A different
window width changes every number on every line without anything being wrong.

## Interpreting a difference

A changed line is not automatically a regression — some of these previews *should* change as
examples move, and one page's numbers changing while it is being converted is the point. What
matters is that the change is **explained before it is committed**. An unexplained difference on a
page nobody touched is the signal this file exists for.

## The baseline

```
/components/button 1110x44/8/trh0gz 1110x298/99/1pqd66s 1110x44/31/1mj3t9w 1110x44/16/850il9 1110x64/16/fcqdxj 320x44/10/dyev4g 1110x49/0/45h 1110x44/13/wvx6yr 1110x44/12/1tkowx0 1110x44/40/g3cef
/components/button-toggle 1110x77/42/17ph1on 1110x77/34/1tj7yjz 1110x388/109/mngldy 1110x49/27/1x05e1i 1110x47/27/1x05e1i 1110x284/139/dg1w0m
/components/toggle 1110x40/13/ahx7yz 1110x40/16/jye2hp 1110x258/16/1hea9c7 380x140/49/sw93mj 1110x85/29/ld9596 1110x92/26/1hxwc23
/components/autocomplete 360x94/12/9um8k 360x94/33/ljdhev 360x94/17/7i8rqn 360x69/4/yjnfb6 360x69/3/376kuv
/components/calendar 1110x360/181/pfdofh 1110x360/321/1bxir1e 1110x360/170/xpxoj0 1110x410/183/16re82o 1110x327/289/9gsb8o
/components/checkbox 1110x40/7/4i5ny0 1110x56/16/1hea9c7 1110x188/52/l6z04e 1110x140/61/414sd9 1110x40/0/45h 320x36/14/1ygu0hm 1110x40/9/6i88q5 1110x40/11/m965s3
/components/datepicker 360x94/26/1df7t80 360x94/16/xjy799 360x94/17/tbpfsn 360x94/20/rauanl 1110x362/170/xpxoj0 360x69/8/vncn73
/components/inputfield 320x68/4/yjoq02 320x410/16/fcqdxj 320x68/8/12hrfiy 320x68/6/1jrkeln 320x152/19/1yee8v5 320x68/6/1jrkeln 320x217/10/ak5u3x 320x68/8/clf12r 320x68/5/3ce9t5 320x154/22/1d9wceu 320x236/69/17duju0 320x68/8/1j620et 1110x68/8/1py91l7
/components/multiselect 320x68/18/1wc1dz8 320x84/22/lnbd7b 320x410/76/1y4kdfp 320x152/40/1pz5tcb 320x258/107/17kkzwc 320x68/32/1vh7fmk 1110x68/27/1m6tzth 320x106/19/hdyoj7 320x68/39/1nx9s42 320x68/19/ttrynx 320x68/30/1qhfhmg 260x68/19/7i3g5p 320x68/19/ttrynx
/components/radio-group 1110x230/124/cx8492 1110x109/49/1xoz8ix 1110x397/91/1ed34mw 1110x197/105/16gxzvk
/components/select 320x68/19/p4sxgf 320x410/86/1ssea56 320x256/99/msf3xa 320x68/31/230xbw 1110x68/30/1rbcrf2 320x106/27/bjmo0p 320x68/39/11bfs0k 320x152/46/11yvv2p 320x152/74/1nfv6gg 320x68/8/d5qziz 320x68/18/l92hya
/components/slider 320x67/15/1x3v819 420x472/123/1f1js3m 1110x44/5/3s8nxs 420x147/31/cv2kye 1110x67/16/1swvx6v 1110x225/42/1vyc3ey 1110x67/19/hhte9r 1110x67/19/1um5950 320x89/66/cf755e 320x67/26/1c9n7t0
/components/textarea 420x143/3/3768ld 1110x527/16/fcqdxj 420x239/5/3jtoiu 1110x357/39/sulegg 420x143/8/1g21xfw 420x143/7/d7obhy 420x143/8/1j620et 1110x95/10/8wib1j 420x143/5/3jtoiu 1110x290/10/ak5u3x
/components/badge 1110x44/27/1ox871i 1110x44/52/1d7vgbj 1110x60/35/1xp8s1l 1110x60/49/1p4r3s5 1110x60/21/avcefc 1110x60/56/15lkik1
/components/chip 1110x33/6/16wtvav 1110x48/16/1hea9c7 1110x33/12/v1xo1r 1110x34/23/nl148z 1110x33/9/1dlymcj 1110x33/8/70enxx 1110x33/20/52gif6 1110x36/8/1qgb1m3 320x33/10/jemzgw
/components/divider 1110x65/25/jgt2mb 1110x147/19/g94jbh 1110x165/25/ozdtjh 1110x32/14/14awsnl 1110x152/48/1b6dqcw
/components/icon 1110x19/0/45h 1110x86/73/1koppsi 1110x86/37/toyffj 1110x71/26/rrzanu 1110x71/29/164tkrs 1110x71/73/1ki3pur 1110x86/43/1hagau7 1110x71/58/4kvj8t 1110x40/0/45h 1110x19/0/45h 1110x16/0/45h
/components/paginator 1110x34/13/1uaq0if 1110x35/16/r6ngja 1110x34/25/hk0zna 1110x34/20/1hholrh 1110x268/86/3y202d 1110x222/70/1j0cqro 1110x34/13/1uaq0if 1110x212/34/v8edvi
/components/progressbar 1110x6/0/45h 520x148/32/go9e0y 520x258/34/m32ntz 520x264/16/1hea9c7 520x79/22/w84van
/components/skeleton 1110x58/0/45h 1110x89/16/1hgbgei 1110x107/26/d1x95a 1110x121/16/fcqdxj 1110x65/15/6t2kqd 1110x145/38/ywb9ht 1110x356/186/cw58y9 1110x204/13/1v9zhxa 1110x404/17/14fo7zf
/components/table 1110x296/239/dki4yr 1110x308/158/14rqfij 1110x216/110/1ezwlio 1110x260/172/lb0rqn 1110x126/146/18b6sau 1110x165/105/dbj5rb 1110x272/116/1k75216 1110x221/134/1lm9t2y 1110x216/77/1xs0wjc 1110x326/172/lb0rqn 1110x120/63/drn6rv 1110x304/277/xnuepl
/components/tag 1110x31/8/v3kajm 1110x31/27/1avsovt 1110x40/49/e8d7lo 1110x31/19/iytm6d 1110x31/8/6iyl91 320x28/10/jemzgw
/components/accordion 1110x241/157/c41jrb 1110x788/291/1aszqdz 1110x215/170/daw2tl 1110x274/233/v6mfgm 1110x155/157/c41jrb 1110x215/54/1oqwa8d 1110x215/178/a3u4dd
/components/collapsible 1110x71/63/1qvhgk5 1110x71/52/6zdk5e 1110x71/69/11q9e0u 1110x34/10/1acf8ef 1110x28/53/a8iac6 1110x263/210/6p48nu 1110x73/82/leu99y
/components/scroll 1110x200/200/1bpzyd3 1110x62/190/1tsqk9j 1110x34/26/2w7jlc 1110x200/200/1bpzyd3 1110x200/200/1bpzyd3 1110x34/16/i0bqtd 1110x200/200/1bpzyd3
/components/tabs 1110x127/57/c0o443 1110x106/18/sfigqc 1110x560/168/1somqq6 1110x130/43/9cdt3a 320x92/52/1m4bllv 1110x92/36/96n403
/components/dialog 1110x44/16/1inj4ex 1110x44/18/19jdc96 1110x44/24/8d41eq 1110x44/21/1t0acts 1110x44/16/dic8cm 1110x44/20/cl1g91
/components/spinner 1110x48/1/3m2r 1110x169/26/ntxmm9 1110x121/12/1o0eafm 1110x121/27/1yd716p 1110x121/6/19ps3p2 1110x73/18/g0x7jx 1110x204/67/pwmge5 1110x44/27/1mq3f6v
/components/toast 1110x44/13/opfucy 1110x68/42/1gklkpv 1110x44/28/1ib99sq 1110x44/21/1iaaxyf 1110x44/11/ugdsca 1110x44/37/loxpww 1110x44/14/1ivdvyl
/components/tooltip 1110x44/10/11yd0xt 1110x60/21/1mr8obe 1110x44/6/16aygmm 1110x44/32/b0afp0 1110x44/22/1wj99za
```

30 pages, 233 previews, 216 examples.
