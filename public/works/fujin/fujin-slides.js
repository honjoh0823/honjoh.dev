window.FujinSlides = {
    // スライド全体を通したデフォルト設定
    defaultHiddenKeys: ["Y", "6"],

    slides: [
        // --- スライド #0（紹介） ---
        {
            title: "風神配列",
            body: "特殊なキーボードは不要です。<br>左手だけで、両手より速く正確に入力できます。<br>「あかさたなはまやらわ」で並んでいます。",
            kb: "fujin-normal",
            interactive: true,
            overlays: {
                // 無刻印にする修飾キーなど
                "Esc": "n:",
                "Tab": "n:",
                "Alt": "n:",

                // 無刻印にする数字キー
                "`": "n:",
                "1": "n:",
                "2": "n:",
                "3": "n:",
                "4": "n:",
                "5": "n:",

                // スペースキー
                "Space": "vowel-a"
            }
        },

        // --- スライド #1（例：あ行の入力） ---
        {
            title: "あ行の入力",
            body: "ここは2枚目(#1)のスライドの説明です。",
            kb: "fujin-normal",
            interactive: true,
            overlays: {
                "Esc": "n:",
                "Tab": "n:",
                "Alt": "n:",

                "`": "n:",
                "1": "n:",
                "2": "n:",
                "3": "n:",
                "4": "n:",
                "5": "n:",

                "Space": "vowel-a",

                // 特定のキーのハイライトと文字の変更例
                "A": "hl1:あ"
            }
        }
    ],

    // Q&Aセクション
    faq: [
        {
            h3: "Q1. 誰のための配列ですか？",
            body: "右手が使えない方、利き手を怪我された方、片手操作を好む方など、<br>左手だけでキーボード入力をしたい全ての方のための配列です。"
        },
        {
            h3: "Q2. 大和配列との違いは？",
            body: "大和配列は左手で子音、右手で母音を打つ両手配列です。<br>風神配列は左手だけで子音と母音の両方を入力します。<br>子音の配列位置（50音順）は同じです。"
        },
        {
            h3: "導入方法",
            body: "<b>Windows</b><br>1. <a href=\"https://www.autohotkey.com/\" target=\"_blank\" rel=\"noopener\">AutoHotkey v2</a> をインストール<br>2. <a href=\"/works/fujin/lu1.ahk\" download>lu1.ahk</a> をダウンロード → 起動"
        }
    ]
};
