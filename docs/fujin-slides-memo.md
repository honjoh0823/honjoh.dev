# fujin-slides.json 退避メモ
2026-03-06 スライド構成再考のため、元々の#2〜#7のスライド内容をこちらに退避しています。

```json
[
    {
        "h3": "子音の入力",
        "body": "大和配列の思想を受け継いだ子音構成です。<br>大和配列と同じ50音順の子音配置：",
        "kb": "fujin-normal",
        "hiddenKeys": [
            "Y",
            "6"
        ]
    },
    {
        "h3": "風神配列とは",
        "body": "片手で日本語を自由自在に入力するための、<br>左手専用キーボード配列です。<br>ファンクションキーからスペースキーまで、6段すべてを使用します。",
        "kb": "physical",
        "hiddenKeys": [
            "Y",
            "6"
        ],
        "interactive": true
    },
    {
        "h3": "母音の入力",
        "body": "キーを押しながら別のキーを押すことで母音が入力されます。<br>同時押しの組み合わせにより、<br>左手だけで子音と母音の両方を打鍵できます。",
        "kb": "fujin-vowel",
        "hiddenKeys": [
            "Y",
            "6"
        ],
        "overlayType": "vowelKeys"
    },
    {
        "h3": "CapsLockレイヤー",
        "body": "CapsLockキーを押しながらで、<br>追加の子音や矢印キー、記号が入力できます。<br>F, V, C, Q, L などの低頻度文字もここに配置。",
        "kb": "fujin-caps",
        "hiddenKeys": [
            "Y",
            "6"
        ],
        "overlayType": "capsKeys"
    },
    {
        "h3": "Spaceキーの役割",
        "body": "Spaceキーは修飾キーとして機能します。<br>Space + 文字キーで記号入力、<br>Space + 数字キーで右半分の数字（6-0）が入力されます。",
        "kb": "physical",
        "hiddenKeys": [
            "Y",
            "6"
        ],
        "overlays": {
            "5": {
                "4": "mod-a"
            }
        }
    },
    {
        "h3": "全レイヤーの統合",
        "body": "通常入力、同時押し母音、CapsLockレイヤー、<br>Spaceレイヤーを組み合わせることで、<br>左手だけであらゆる日本語入力が可能になります。",
        "kb": "physical",
        "hiddenKeys": [
            "Y",
            "6"
        ],
        "interactive": true
    }
]
```
