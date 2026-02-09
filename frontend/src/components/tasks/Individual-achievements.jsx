import TaskTemplate from "./TaskTemplate";

export const items = [
  { name: "渋川 大翔", url: "https://docs.google.com/spreadsheets/d/1JEk1WhwXzZt3HcTcwqe8vAhlUHg2rdIEMv440vNsqXM/edit" },
  { name: "須藤 穂乃香", url: "https://docs.google.com/spreadsheets/d/1Jj1anHD07Cr58eThinMOphPaqNKcICbCang11QcIVHA/edit" },
  { name: "檜室 大貴", url: "https://docs.google.com/spreadsheets/d/1EcVc4s5uArBRLwSoA5MVimJSofFqSrVvT83zcLYDxQk/edit" },
  { name: "宮下 莉紗", url: "https://docs.google.com/spreadsheets/d/1nTyUDvL8TwRr5lo_tYcb9cMz4smP1cMSYi07jqdyOTA/edit" },
  { name: "太田 真広", url: "https://docs.google.com/spreadsheets/d/1UloIPE6QZ7GpEVy3Om2V87aswIMtqh6U38CF3RI_LoI/edit" },
  { name: "橋本 結衣", url: "https://docs.google.com/spreadsheets/d/1vwM1he7JMx_YOc8NpugiHjvILtPXy0RWd9_5qPQOgg4/edit" },
  { name: "根方 光里", url: "https://docs.google.com/spreadsheets/d/1Xd3wo71k19BYL3xmv08bPji-1UV87mOXLkAgp5o5FV8/edit" },
  { name: "大木 遥香", url: "https://docs.google.com/spreadsheets/d/1pKQMw1DTcIxOyOhFvpfbwxrXY0lQISXGHC_YxddlmJs/edit" },
  { name: "中野 槙治", url: "https://docs.google.com/spreadsheets/d/1YVBLCZ2AaSxVgG09Qv4iA66xIvn6fYN7Pf4ov6aMfA8/edit" },
  { name: "飯塚 庸介", url: "https://docs.google.com/spreadsheets/d/10oyXoKNRpxYRf-2l5bAf-Nrg-VqjE76zJjWl6hL70UQ/edit" },
  { name: "芝  卓人", url: "https://docs.google.com/spreadsheets/d/1YcIvzrV4QaUtTM9u8OJYO78moIy7YffhkSmT2Bcceu0/edit" },
  { name: "青木  俊憲", url: "https://docs.google.com/spreadsheets/d/19ViL0lWHQllFMwQbI-ZB6F_ZYMgCSneIO6uMtBtCsVY/edit" },
  { name: "工藤 優葵音", url: "https://docs.google.com/spreadsheets/d/1O9tp7WpNJ5pLClFJTM4rrQOn5fl2cJGnVelC4v-yrlE/edit" },
  { name: "前田 優希", url: "https://docs.google.com/spreadsheets/d/1hQ8s9PUwwLk3UztPcJ7asVP5hEDhHebW5jtY7D5xbtU/edit" },
  { name: "鈴木 芽依", url: "https://docs.google.com/spreadsheets/d/1CU94V43NnwwPC5oR9ntyuvzj0XHZOeQ4F1xSVMWt-l8/edit" },
  { name: "増田 尚希", url: "https://docs.google.com/spreadsheets/d/1QDmf4pg6Dfu4ELzzH8KTPdoWoBIn4PbSC1D0DwU4JC4/edit" },
  { name: "吉田 賢大", url: "https://docs.google.com/spreadsheets/d/1Tiq4hmMOC9DUT_qLhWfJjIWP75Qfq5-vCuDT88XRfhE/edit" },
  { name: "佐藤 慶尚", url: "https://docs.google.com/spreadsheets/d/10rCSu_VlZpXd_OLigtAtlWEPOMdINyXVOZsTAhdN22k/edit" },
  { name: "原田 俊", url: "https://docs.google.com/spreadsheets/d/13pTQNCzaKXPgMSQiqZGNs1J4XQQXa7fZliMDU_XErng/edit" },
  { name: "宇田川 和政", url: "https://docs.google.com/spreadsheets/d/1tKzIu3m7U5iSLtHbrOl7-z0ghrtaQijDKyBSKy1Az5c/edit" },
  { name: "植松 あやめ", url: "https://docs.google.com/spreadsheets/d/1EwW5cF7SDPKEAn8BvLn5jBPI6v4nSff-JDatsZXVVYA/edit" },
  { name: "呂 姿瑤", url: "https://docs.google.com/spreadsheets/d/18QELex0CshZvSIdiphsnBtan7Y-Ritx5ZV2S7Ktlh4M/edit" },
  { name: "木村 陽", url: "https://docs.google.com/spreadsheets/d/1D7Z5TvujgDS0M129YiP8MgS3pEv1I6xIQJnf5RHrA1w/edit" },
  { name: "川脇 ひとみ", url: "https://docs.google.com/spreadsheets/d/1Qnt5DvhDBF7Z1PvhrujdoRIx8bvy07RYyy19xtuNrZw/edit" },
  { name: "櫻田 涼平", url: "https://docs.google.com/spreadsheets/d/1fYTJrQ9fwxkLIuXda2X3NbC7uE7rLVJwmlw2fxPw7Oc/edit" },
  { name: "守岡 紗希", url: "https://docs.google.com/spreadsheets/d/1_EhJcGboWkaoEwDHE7AwHwwArNp32nJvVlX_xnK63sU/edit" },
  { name: "山本 真行", url: "https://docs.google.com/spreadsheets/d/1nmzAoJufxA6jgh533eE0NAxZpXPA9GqAEzl2zMTQM0U/edit" },
  { name: "山口 峻", url: "https://docs.google.com/spreadsheets/d/1tTKXTYDjjI0oPEkXJ1KteIcfkx5ghuXf3IaU70Pdraw/edit" },
  { name: "武内 雄幹", url: "https://docs.google.com/spreadsheets/d/1zYfRp1p61002qNwh0Ah3vF8QLrnjEeyD-ApeAhcSh5E/edit" },
  { name: "辻本 和貴", url: "https://docs.google.com/spreadsheets/d/14jdUQnUiZgwxJ2ExYxo0q7zkp_8KLjYdWdS29vbqm8g/edit" },
  { name: "上原 隆徳", url: "https://docs.google.com/spreadsheets/d/1VcK9O7GfqypB-r9WzeN7AySn5SmK_CKoVPdEJ9_qVl0/edit" },
  { name: "新郷 友輝", url: "https://docs.google.com/spreadsheets/d/1v3zw4xUHo-j_Tl-IaCNDDC_sef5txuvGh_esxYi7tmo/edit" },
  { name: "藤 京助", url: "https://docs.google.com/spreadsheets/d/18buZznla_ernKKsm6kMTcrz8lkZMcLANQJKiCzb_ZHA/edit" },
  { name: "本郷 みづき", url: "https://docs.google.com/spreadsheets/d/1ZWrPhW_S_xV9w-pzXbhj673oWl4dz0_uq8qWQ8MNAfc/edit" },
  { name: "佐藤 未来", url: "https://docs.google.com/spreadsheets/d/1PL_Z5mExep0SYiOJ8xK2nSpG3n8yPQLjQhMTlF9iL3Y/edit" },
  { name: "安野 悠斗", url: "https://docs.google.com/spreadsheets/d/1JKAgQnFBoDsbUi-NQbKQJm85qNtmbF6_31eneAV7hqg/edit" },
  { name: "前田 理絵", url: "https://docs.google.com/spreadsheets/d/14M7niNZjnLbcAHqGh8uK4d4Dn_CpUMUFVGMh5w5Gr5o/edit" },
  { name: "古畑 萌音", url: "https://docs.google.com/spreadsheets/d/1b0GjRkM4BfZdLOZ3Yf_I5pEEQx2aBxxtp1S7yTIweZQ/edit" },
  { name: "横村 篤哉", url: "https://docs.google.com/spreadsheets/d/1H_ezfC9CkGUHXHOE0Swknsx8eZ9lf4CD9y3SYw7e6hQ/edit?usp=drive_link" },
  { name: "野田 祐樹", url: "https://docs.google.com/spreadsheets/d/1mSJTlqZotyNRXruwakWTuApTKT7emWm3VGSZf9pExp4/edit?gid=594771872#gid=594771872" }
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
