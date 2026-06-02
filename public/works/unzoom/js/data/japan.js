// Unzoom — Japan question set (mainland bays).
//
// The opening frame must always contain a COASTLINE foothold — never a blank
// blue square (that's unsolvable / unfair). So each centre sits on the SHORE
// of its bay (not out in open water): at the shared startZoom you see "a coast
// + water", ambiguous as to which coast, and zooming out overturns it into a
// named bay. Answer early (few zoom-outs) for a smaller deduction.
//
// Rules of thumb:
// - same startZoom for every question (consistency),
// - centre on the shoreline so land is guaranteed in view,
// - `twist` is an authoring note only (why it fools you at first).
//
// In production these are replaced by hand-picked pre-baked frames, which
// guarantees the foothold per frame.

export const JAPAN_QUESTIONS = [
  {
    id: "tokyo-bay",
    label: "東京湾 / 千葉県",
    lat: 35.57,
    lng: 140.06, // 千葉港の臨海工業地帯（東京湾東岸）
    startZoom: 14,
    minZoom: 6,
    twist: "工業地帯の岸壁。最初は太平洋岸の港にしか見えないが、引くと湾に囲まれている。",
  },
  {
    id: "osaka-bay",
    label: "大阪湾 / 大阪府",
    lat: 34.62,
    lng: 135.43, // 堺・泉北の臨海部（大阪湾東岸）
    startZoom: 14,
    minZoom: 6,
    twist: "埋立地の直線的な岸。外洋か湾か判別できない。",
  },
  {
    id: "ise-bay",
    label: "伊勢湾 / 三重県",
    lat: 34.95,
    lng: 136.63, // 四日市港（伊勢湾西岸）
    startZoom: 14,
    minZoom: 6,
    twist: "遠浅の汽水。引いて初めて知多・渥美に挟まれた内湾と分かる。",
  },
  {
    id: "suruga-bay",
    label: "駿河湾 / 静岡県",
    lat: 35.02,
    lng: 138.51, // 清水港・三保（駿河湾）
    startZoom: 14,
    minZoom: 6,
    twist: "深く切れ込む湾。沖に見えるが、引くと富士と半島が現れる。",
  },
  {
    id: "toyama-bay",
    label: "富山湾 / 富山県",
    lat: 36.78,
    lng: 137.08, // 富山新港・射水（富山湾岸）
    startZoom: 14,
    minZoom: 6,
    twist: "日本海側の弧。太平洋岸との区別が高ズームでは効かない。",
  },
  {
    id: "mutsu-bay",
    label: "陸奥湾 / 青森県",
    lat: 40.83,
    lng: 140.75, // 青森港（陸奥湾南岸）
    startZoom: 14,
    minZoom: 6,
    twist: "下北・津軽に二重に囲まれた湾。引くまで本州最北とは思えない。",
  },
  {
    id: "wakasa-bay",
    label: "若狭湾 / 福井県",
    lat: 35.65,
    lng: 136.07, // 敦賀港（若狭湾東部）
    startZoom: 14,
    minZoom: 6,
    twist: "リアス式の入り組んだ岸。どの半島の付け根かは引かないと読めない。",
  },
  {
    id: "ariake",
    label: "有明海 / 長崎・佐賀県",
    lat: 32.92,
    lng: 130.2, // 諫早・有明海沿岸
    startZoom: 14,
    minZoom: 6,
    twist: "干潟の濁った水。海とも川とも湖ともつかず、九州とすら分からない。",
  },
  {
    id: "hiroshima-bay",
    label: "広島湾（瀬戸内海）/ 広島県",
    lat: 34.35,
    lng: 132.46, // 広島港（広島湾）
    startZoom: 14,
    minZoom: 6,
    twist: "島影の多い内海。外洋に見えて、引くと島々に閉じた瀬戸内と判明。",
  },
  {
    id: "matsushima",
    label: "松島湾 / 宮城県",
    lat: 38.33,
    lng: 141.05, // 塩竈・松島湾岸
    startZoom: 14,
    minZoom: 6,
    twist: "無数の小島が浮かぶ湾。引くと三陸の湾だと分かる。",
  },
];
