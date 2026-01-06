import TaskTemplate from "./TaskTemplate";

const items = [
  { name:"Akiba", url:"https://docs.google.com/spreadsheets/d/1b8gEjzy0Mg5NKwAl4rlYFYCRy9qds7yC9TnONnNMyx0/edit" },
  { name:"Yokohama", url:"https://docs.google.com/spreadsheets/d/1tmDYhuIJOopSzz78Teop1T74vLFRY30JND1r2bp63Lc/edit" },
  { name:"Umeda", url:"https://docs.google.com/spreadsheets/d/1p_LZir6M6FB9_OOaK_ksBnUxGaHeyeZLKxqGHDo1baw/edit" },
  { name:"Kyoto", url:"https://docs.google.com/spreadsheets/d/1dnA1Uxinh8sE2QIRs1cFOWiLONmUlGxxVv6giCSCGCA/edit" },
  { name:"Hakata", url:"https://docs.google.com/spreadsheets/d/1FT9eKf-t8Dym641al7kZUftIcXTccV_8jD3_EUItTRk/edit" },
  { name:"Sendai", url:"https://docs.google.com/spreadsheets/d/13YUbd01YpnnCbSBZGdEdn8Ek96-fY4Q2-2B-rMAzYaE/edit" },
  { name:"Kichijoji", url:"https://docs.google.com/spreadsheets/d/1EZQGX_vfkX1STh0lg3NlJD0qRAVOtTu-soRXVI4UGFg/edit" },
  { name:"Kawasaki", url:"https://docs.google.com/spreadsheets/d/1ZB6sr8AuB8bvFehthZSDI5ta-eLDqHxPA3ayEFwe9os/edit" }
];

export default function NumberVisitors() {
  return (
    <TaskTemplate
      title="集客数カウント"
      description="店舗ごとのカウント表です。"
      items={items}
    />
  );
}
