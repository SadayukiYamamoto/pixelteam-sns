import TaskTemplate from "./TaskTemplate";

export const items = [
  { name: "渋川 大翔", url: "https://docs.google.com/spreadsheets/d/1flMETWYZ-aavENyfdngUr-SdEkXuKN_WrZlW1av-BHQ/edit" },
  { name: "須藤 穂乃香", url: "https://docs.google.com/spreadsheets/d/1nz_2dN6oGTuJOxqLbj9fns9BPDWMYSVaRw8eEPExpmc/edit" },
  { name: "檜室 大貴", url: "https://docs.google.com/spreadsheets/d/1ARhtwhTJcUoGCJfCz_rM84Kku8nqwwot5Z_WAxYm-Pg/edit" },
  { name: "宮下 莉紗", url: "https://docs.google.com/spreadsheets/d/18gXcH-YvgmPcS7_zyVp1zmeSWFAWF5ZUtVRjxhorma0/edit" },
  { name: "太田 真広", url: "https://docs.google.com/spreadsheets/d/1lk5OJ6C2F9tNUQq3c9oCunfr8aQtHa3phGWtnPd0A5E/edit" },
  { name: "橋本 結衣", url: "https://docs.google.com/spreadsheets/d/1Aw2HcgIVoQhACpbAy3ogaxIuYdowKqRlZpNX7i-RTgs/edit" },
  { name: "根方 光里", url: "https://docs.google.com/spreadsheets/d/1rWQdbOYvhQLDswz91CL3NaEvtIz_1E5s0E-o4GJ5PQA/edit" },
  { name: "大木 遥香", url: "https://docs.google.com/spreadsheets/d/12gFXWp-UrO-nd0CBRzx7p_LaWDgBGSDYnrY6KXEJ1Q0/edit" },
  { name: "中野 槙治", url: "https://docs.google.com/spreadsheets/d/1UqIg6N5xFleYupV6pv7qfAn5OXKkF0A4pJYduuxIKIw/edit" },
  { name: "鈴木 芽依", url: "https://docs.google.com/spreadsheets/d/1s5c1LqbL4OeEjBft_hhQDJ5z3QfPiS0xoeQbjReUnC0/edit" },
  { name: "増田 尚希", url: "https://docs.google.com/spreadsheets/d/1K1ztyNz5udynZip8atq8ng6fvnqu9z-__2tTLWA3cL4/edit" },
  { name: "吉田 賢大", url: "https://docs.google.com/spreadsheets/d/1Mk0v2zcGCkCtMQy9HRY-jyd8tTirr3QsswxKPsdVFes/edit" },
  { name: "佐藤 慶尚", url: "https://docs.google.com/spreadsheets/d/1as74q02QdVJzO7fg3HdHrSAQD7A9kOQBBHT5bDHSL_M/edit" },
  { name: "原田 俊", url: "https://docs.google.com/spreadsheets/d/1cvoijSyNAnmblliT1eCjkSjqETnXpYcVjdR2NgJePo0/edit" },
  { name: "宇田川 和政", url: "https://docs.google.com/spreadsheets/d/1hrfhY3M-g9FbSdO_2i7D2SC9l4UazWVqL2gCBie8eEg/edit" },
  { name: "植松 あやめ", url: "https://docs.google.com/spreadsheets/d/1pyZGgS3yj61cvQzH7wMMBGJo5kYhVAu5dgzTsQHFARo/edit" },
  { name: "呂 姿瑤", url: "https://docs.google.com/spreadsheets/d/11tQQLre9tb38URzU-5__45Ks9G44RJ_cYvP4Wv7NpTA/edit" },
  { name: "木村 陽", url: "https://docs.google.com/spreadsheets/d/1aQ4uQknnlCYhe4nVGRPFOCV6ZnE3ydlYqE1Z_d8aJKo/edit" },
  { name: "川脇 ひとみ", url: "https://docs.google.com/spreadsheets/d/1oCPUTwh49dD9pj0bWpfB0WuI5mAM_j-34e0qwPPbDzo/edit" },
  { name: "櫻田 涼平", url: "https://docs.google.com/spreadsheets/d/1VmrxYA0CJtQzc86z8Sg7vn5snSzbDcxexKytotgeq0s/edit" },
  { name: "山口 峻", url: "https://docs.google.com/spreadsheets/d/1xcX1M0wH-pL69jFL7K8K6j9mbLwR88ODoVJJrRYRA7w/edit" },
  { name: "武内 雄幹", url: "https://docs.google.com/spreadsheets/d/1C1QFQF2gmaKihWMQZ2Pix5MN_INz0hJx-PY3lGFERCE/edit" },
  { name: "辻本 和貴", url: "https://docs.google.com/spreadsheets/d/1ecrMxHvyAhBcFwvbLxjCU3wljm8We2Df51FAzx4-IUo/edit" },
  { name: "上原 隆徳", url: "https://docs.google.com/spreadsheets/d/18O_NKL0YzPIgQjr2b-B1QCnV0CInye6Fcrgd5MS7c20/edit" },
  { name: "新郷 友輝", url: "https://docs.google.com/spreadsheets/d/1LMlGebYyO4sf1y9K9foIffIpJmA-ZEt-SZQE4c1k1y8/edit" },
  { name: "藤 京助", url: "https://docs.google.com/spreadsheets/d/1aN991ac125aCk1TxIiCsct6RhpdquwUVrjbdxSdL4sE/edit" },
  { name: "築地 志織", url: "https://docs.google.com/spreadsheets/d/1bKmpLaoTBWdOY8PbPanAguJV4xDmzU348ikgTmXODvY/edit" },
  { name: "本郷 みづき", url: "https://docs.google.com/spreadsheets/d/1AQMvKtnv05irBg3GvsGlsaxmRaAqCMDbsFQn2HR2_EY/edit" },
  { name: "佐藤 未来", url: "https://docs.google.com/spreadsheets/d/1zSqFtpb7VjewoIFy7vOxPhueNlsuyXqtl-cuPJEIl_Q/edit" },
  { name: "安野 悠斗", url: "https://docs.google.com/spreadsheets/d/1X3hEvHpqr5yOgw0tzVZgzK42k16J2PHz5CAnzvEebds/edit" }
];

export default function IndividualAchievements() {
  return (
    <TaskTemplate
      title="個人実績（スタッフ一覧）"
      description="各スタッフの個人実績へアクセスできます。"
      items={items}
    />
  );
}
