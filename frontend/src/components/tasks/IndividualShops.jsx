import TaskTemplate from "./TaskTemplate";

const items = [
  { name:"Akiba", url:"https://docs.google.com/spreadsheets/d/13899BiQpMehwhqlPEVB6A7RdjBYe7haSWp67kqMIoRc/edit?gid=1362822343#gid=1362822343" },
  { name:"Yokohama", url:"https://docs.google.com/spreadsheets/d/1gV7MVkjc64HJTuNNpGMcL9BWGOakQo9sMgU-6O2PPDI/edit?gid=1716537036#gid=1716537036" },
  { name:"Umeda", url:"https://docs.google.com/spreadsheets/d/1kSMeyXV25nvxnJfsUsruBvACAj3t9-H7ry8X141jyRQ/edit" },
  { name:"Kyoto", url:"https://docs.google.com/spreadsheets/d/1kVhUrf-VD1RDFjORshvic11e3X2jUzTp1MS5r-rpdiA/edit" },
  { name:"Hakata", url:"https://docs.google.com/spreadsheets/d/1nMHTH-vR0qPq9Q3178Yg_DQQfzjX_8Fgk0IJvD30rNU/edit" },
  { name:"Sendai", url:"https://docs.google.com/spreadsheets/d/1e6NgrVhZsq5b1wESftxyI0zbIGoEgv8FXOx4-VpZxCw/edit" },
  { name:"Kichijoji", url:"https://docs.google.com/spreadsheets/d/1hyfDW91xJvbr_j8Ge3O2CTHRQSY-rAtxBodRxUJMx_A/edit" },
  { name:"Kawasaki", url:"https://docs.google.com/spreadsheets/d/17IFkdmYKAV5Mr7tlyr4D36K6C8CHhlFm4zHYuwPtb9M/edit" }
];

export default function IndividualShops() {
  return (
    <TaskTemplate
      title="店舗別・個人実績"
      description="店舗ごとの実績一覧です。"
      items={items}
    />
  );
}
