import TaskTemplate from "./TaskTemplate";

const items = [
  { name:"Akiba", url:"https://docs.google.com/spreadsheets/d/1iD4L9QTd2ZekQ__AleyMktR1XOryxljcrHmz9AiMSOM/edit" },
  { name:"Yokohama", url:"https://docs.google.com/spreadsheets/d/1dPKYmCCCnhMVHvVOxP0YnLlZINXtOUbfrH5LN4vBdII/edit" },
  { name:"Umeda", url:"https://docs.google.com/spreadsheets/d/1EQuIUGhOTf2cYPPJwCaksiRcDeOyhDj-Zk-bo3JzG0s/edit" },
  { name:"Kyoto", url:"https://docs.google.com/spreadsheets/d/1EQuIUGhOTf2cYPPJwCaksiRcDeOyhDj-Zk-bo3JzG0s/edit" },
  { name:"Hakata", url:"https://docs.google.com/spreadsheets/d/1vOnOtB3cMftWA-QQPvaigOJZKBhb9fHlyEsCHo5eaAU/edit" },
  { name:"Sendai", url:"https://docs.google.com/spreadsheets/d/1Q5mQ8x7EuSQplDwB088A4o4MfCMz_O1K_-hZ0D4qkwU/edit" },
  { name:"Kichijoji", url:"https://docs.google.com/spreadsheets/d/1KP7Ple7CVWzVYvCPlS3txVt62zslu_oGrO-jMJsDYys/edit" },
  { name:"Kawasaki", url:"https://docs.google.com/spreadsheets/d/1DqOmnKrQwugOnVLSViTXr-twzgJl-FnXShVws7gSSFQ/edit" }
];

export default function SiftManagement() {
  return (
    <TaskTemplate
      title="シフト管理"
      description="全店舗のシフト一覧ページです。"
      items={items}
    />
  );
}
