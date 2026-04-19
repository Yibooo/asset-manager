// 全過去実績データ（2019〜2025/03）
// grandTotal = totalJPY + totalCNYinJPY + yulinPiggyJPY

export interface Snapshot {
  _id: string;
  yearMonth: string;
  rakuten: number;     // 楽天/ウェルスナビ（万円）
  corporateDC: number;
  rsu: number;
  yuchoBenri: number;
  yuchoYulin: number;
  mizuhoCash: number;
  wechat: number;      // 万元
  alipay: number;      // 万元
  icbc: number;        // 万元
  cnyJpyRate: number;
  yulinPiggyJPY: number; // 猪猪（万円）
  totalJPY: number;
  totalCNYinJPY: number;
  grandTotal: number;
  memo: string;
}

function snap(
  id: string,
  ym: string,
  rakuten: number,
  dc: number,
  rsu: number,
  yucho: number,
  yulinYucho: number,
  mizuho: number,
  wechat: number,
  alipay: number,
  icbc: number,
  rate: number,
  piggy: number,
  memo: string
): Snapshot {
  const totalJPY = rakuten + dc + rsu + yucho + yulinYucho + mizuho;
  const myCNY = wechat + alipay + icbc;
  const totalCNYinJPY = Math.round(myCNY * rate);
  const grandTotal = totalJPY + totalCNYinJPY + piggy;
  return { _id: id, yearMonth: ym, rakuten, corporateDC: dc, rsu, yuchoBenri: yucho, yuchoYulin: yulinYucho, mizuhoCash: mizuho, wechat, alipay, icbc, cnyJpyRate: rate, yulinPiggyJPY: piggy, totalJPY, totalCNYinJPY, grandTotal, memo };
}

export const MOCK_SNAPSHOTS: Snapshot[] = [
  // ━━━ 2019-2022（年次スナップショット）━━━
  snap("y2019", "2019-12",  80, 0, 0,  20, 0,  0,  0,  0,  0, 16.0,   0, "大学院時代"),
  snap("y2020", "2020-12", 220, 0, 0,  60, 0, 20,  0,  0,  0, 16.5,   0, ""),
  snap("y2021", "2021-03", 350, 0, 0, 100, 0,  0,  0,  0,  0, 17.0,   0, ""),
  snap("y2022a","2022-08", 510, 0, 0, 270, 0,100,  3.8, 1.0, 0.02, 19.0, 0, ""),
  snap("y2022b","2022-11", 600, 0, 0, 320, 0,100,  1.4, 2.8, 3.5, 19.5, 0, ""),

  // ━━━ 2023 月次 ━━━
  snap("s2301","2023-01", 700, 0, 0, 234, 0, 22, 16.2, 17.5, 0, 21.3, 0, "年初から60万円増"),
  snap("s2302","2023-02", 740, 0, 0, 218, 0, 22, 17.4, 15.8, 1.0, 20.0, 0, "前年比+1275万"),
  snap("s2303","2023-03", 800, 0, 0, 278, 0, 20, 19.1, 18.3, 0.6, 20.0, 0, ""),
  snap("s2304","2023-04", 700, 0, 0, 212, 0, 98,  3.7,  4.4, 0.9, 21.0, 0, ""),
  snap("s2305","2023-05", 850, 0, 0, 250, 0,100,  7.0,  4.5, 1.0, 20.0, 0, ""),
  snap("s2306","2023-06", 900, 0, 0, 200, 0, 90, 10.0,  6.0, 0.5, 21.0, 0, ""),
  snap("s2307","2023-07", 900, 0, 0, 250, 0, 90, 12.0,  4.5, 2.0, 20.0, 0, ""),
  snap("s2308","2023-08", 960, 0, 0, 230, 0, 90, 14.0,  6.4, 0.6, 20.0, 0, ""),
  snap("s2309","2023-09",1000, 0, 0, 212, 0, 90, 13.8,  6.1, 3.5, 20.0, 0, ""),
  snap("s2310","2023-10",1018, 0, 0, 282, 0, 90, 15.5,  5.8, 3.6, 20.0, 0, ""),
  snap("s2311","2023-11",1070, 0, 0, 265, 0, 112, 18.0,  8.2, 1.1, 20.75, 0, "2000万大台達成・Amazon転職"),
  snap("s2312","2023-12",1128, 0, 0, 252, 0, 112, 17.3, 11.0, 1.0, 20.0, 0, ""),

  // ━━━ 2024 月次 ━━━
  snap("s2401","2024-01",1176, 0, 0, 234, 0, 112, 17.5, 13.4, 1.0, 20.0, 400, ""),
  snap("s2402","2024-02",1241, 0, 0, 218, 0, 112, 17.4, 15.8, 1.0, 20.0, 1000, "前年比+1275万"),
  snap("s2403","2024-03",1308, 0, 0, 278, 0, 120, 19.1, 18.3, 0.6, 20.0, 1000, ""),
  snap("s2404","2024-04",1400, 0, 0, 405, 0, 130, 19.1, 18.4, 0.4, 20.1, 1000, "前年8月比+1700万"),
  snap("s2405","2024-05",1450, 0, 0, 400, 0, 130, 19.0, 18.4, 0.2, 20.0, 1000, ""),
  snap("s2406","2024-06",1835, 0, 0, 138, 0,  30, 18.4, 18.4, 0,   21.2, 1000, ""),
  snap("s2407","2024-07",2050, 0, 0, 100, 0,  30, 18.2, 18.4, 0,   21.9, 1000, ""),
  snap("s2408","2024-08",1850, 0, 0, 100, 0,  20, 18.1, 18.4, 0,   21.1, 1000, ""),
  snap("s2409","2024-09",1850, 0, 0, 100,30,  20, 17.9, 18.4, 0,   20.9, 1000, ""),
  snap("s2410","2024-10",2040, 0, 0, 100,20,  20, 17.3, 18.1, 0,   20.3, 1000, ""),
  snap("s2411","2024-11",2152, 0, 0, 208,20,  20, 16.8, 18.0, 0,   21.0, 1000, ""),
  snap("s2412","2024-12",2270, 0, 0, 150,20,  20, 16.6, 17.9, 0,   21.4, 1000, ""),

  // ━━━ 2025 月次 ━━━
  snap("s2501","2025-01",3000,85, 40, 230,25, 20,  8.7,  7.6, 7.5, 21.0, 1000, "25年1月比+780万"),
  snap("s2502","2025-02",3050,90, 40, 220,25, 40,  8.5,  7.5, 7.5, 21.3, 1000, ""),
  snap("s2503","2025-03",3000,95, 40, 230,80, 30,  8.4,  7.5, 7.5, 21.4, 1000, "25年1月比+800万"),
];
