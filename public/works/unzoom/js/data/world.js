// Unzoom — world question set.
//
// Design rule (from play-testing): people read location from COASTLINES and
// waterfronts. Inland imagery gives almost nothing to reason from. So every
// world question is anchored on a coast / lagoon / lakeshore where the first
// frame plausibly reads as "somewhere else", and zooming out overturns it.
//
// World answers only need country / region accuracy — the answer grid is
// coarser (see MODES.world.gridCols).

export const WORLD_QUESTIONS = [
  {
    id: "dubai",
    label: "ドバイ / アラブ首長国連邦",
    lat: 25.1124,
    lng: 55.139,
    startZoom: 14,
    minZoom: 3,
    twist: "砂漠と人工島の海岸。乾いた色で『中東のどこか』とは思えても国は割れにくい。",
  },
  {
    id: "venice",
    label: "ヴェネツィア / イタリア",
    lat: 45.4345,
    lng: 12.3387,
    startZoom: 14,
    minZoom: 3,
    twist: "潟の上の街。水路だらけで海か川か判然としない。",
  },
  {
    id: "goldengate",
    label: "サンフランシスコ / アメリカ",
    lat: 37.8199,
    lng: -122.4783,
    startZoom: 14,
    minZoom: 3,
    twist: "湾の入り口。最初は河口にも見えるが引くと太平洋と湾が現れる。",
  },
  {
    id: "sydney",
    label: "シドニー / オーストラリア",
    lat: -33.8523,
    lng: 151.2108,
    startZoom: 14,
    minZoom: 3,
    twist: "入り組んだ入江。半球すら最初は分からない。",
  },
  {
    id: "rio",
    label: "リオデジャネイロ / ブラジル",
    lat: -22.9711,
    lng: -43.1822,
    startZoom: 14,
    minZoom: 3,
    twist: "山が海に迫る海岸。熱帯の海岸線という以上の手がかりが出にくい。",
  },
  {
    id: "male",
    label: "マレ / モルディブ",
    lat: 4.1755,
    lng: 73.5093,
    startZoom: 14,
    minZoom: 3,
    twist: "環礁。引くほど陸が消えて大海原に点在する島だと分かる逆転。",
  },
  {
    id: "chicago",
    label: "シカゴ / アメリカ（ミシガン湖）",
    lat: 41.8861,
    lng: -87.6091,
    startZoom: 14,
    minZoom: 3,
    twist: "大都市の海岸に見えるが、実は内陸の五大湖。海だと思い込むと大外し。",
  },
  {
    id: "santorini",
    label: "サントリーニ / ギリシャ",
    lat: 36.4162,
    lng: 25.4326,
    startZoom: 13,
    minZoom: 3,
    twist: "カルデラの湾。島か本土か、地中海かどこかも引かないと読めない。",
  },
];
