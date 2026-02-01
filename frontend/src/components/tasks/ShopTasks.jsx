import {
  UserCheck,
  ClipboardList,
  PieChart,
  Activity,
  Calendar,
  FileText,
  BookOpen,
  TrendingUp,
  Users,
  ListChecks,
  MessageSquare,
  Globe,
  FolderDot
} from "lucide-react";

export const SHOP_ITEMS = [
  // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
  // ① 申請・報告
  // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
  {
    name: "勤怠報告",
    icon: ClipboardList,
    category: "申請・報告",
    color: "text-red-500",
    size: "small",
    url: "https://docs.google.com/forms/d/e/1FAIpQLScLsB7BxGpyGKGhk-o5q05Fft9_DKk_1ZcSWm5437wUU9Qm_w/viewform"
  },
  {
    name: "接客レポート",
    icon: MessageSquare,
    category: "申請・報告",
    color: "text-pink-500",
    size: "small",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSc-khMem4gPwmHHj92u023EyUksXYAYMI4H2GkgE_sHUkbO0w/viewform?usp=header"
  },

  // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
  // ② 実績・管理
  // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
  {
    name: "個人実績",
    icon: Activity,
    category: "実績・管理",
    color: "text-blue-600",
    size: "small",
    url: "/components/tasks/Individual-achievements"
  },
  {
    name: "店舗実績",
    icon: TrendingUp,
    category: "実績・管理",
    color: "text-purple-500",
    size: "small",
    url: "https://drive.google.com/drive/u/0/folders/1Qml4GNplF44Hi6bg5A8oVFdw4sBOphx4"
  },
  {
    name: "スイング管理表",
    icon: PieChart,
    category: "実績・管理",
    color: "text-indigo-500",
    size: "small",
    url: "/components/tasks/swing-management"
  },
  {
    name: "集客数カウント",
    icon: Users,
    category: "実績・管理",
    color: "text-yellow-600",
    size: "small",
    url: "/components/tasks/number-visitors"
  },

  // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
  // ③ お知らせ・情報
  // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
  {
    name: "お知らせ",
    icon: FileText,
    category: "お知らせ・情報",
    color: "text-orange-500",
    size: "small",
    url: "/components/tasks/swing-management"
  },
  {
    name: "事務局だより",
    icon: MessageSquare,
    category: "お知らせ・情報",
    color: "text-green-500",
    size: "small",
    url: "https://drive.google.com/drive/u/0/folders/1UZLCOUok0lKeMwyOw0SXKO4yTKpcvKcZ"
  },

  // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
  // ④ シフト・ツール
  // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
  {
    name: "マニュアル",
    icon: FolderDot,
    category: "シフト・ツール",
    color: "text-black",
    size: "small",
    url: "https://drive.google.com/drive/u/0/folders/1il-rDfil4jwdl5bJ1s0RyY4100zHY9lj"
  },
  {
    name: "シフト",
    icon: Calendar,
    category: "シフト・ツール",
    color: "text-cyan-600",
    size: "small",
    url: "/components/tasks/sift-management"
  },
  {
    name: "端末・機能情報",
    icon: BookOpen,
    category: "シフト・ツール",
    color: "text-teal-600",
    size: "small",
    url: "https://drive.google.com/drive/u/0/folders/1xGiZdZHnH-21nObjgZPogn9IppvK7ypk"
  }
];
