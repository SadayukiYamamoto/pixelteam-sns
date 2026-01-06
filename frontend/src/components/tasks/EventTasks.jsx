import {
    UserCheck, Clock, DollarSign, Briefcase,
    Activity, TrendingUp, CheckSquare, FileText, Bell, Calendar,
    MessageSquare, BookOpen, Globe
  } from "lucide-react";
  
  export const EVENT_ITEMS = [
    { name: "健康観察", icon: UserCheck, category: "申請・報告", color: "text-pink-500", size: "small", url: "https://docs.google.com/forms/d/e/1FAIpQLScHDtKTkgN7L8oz7iVd4deiOl_Fn6A-D613vyVMoERD1cMetQ/viewform" },
    { name: "勤怠報告", icon: Clock, category: "申請・報告", color: "text-red-500", size: "small",url: "https://agent2309.e-densin.jp/mobile/login/" },
    { name: "交通費申請", icon: DollarSign, category: "申請・報告", color: "text-green-500", size: "small",url: "https://drive.google.com/drive/folders/18iOXhFzPxdyxwaquhPQifL3uG0YhJzEK" },
    { name: "シフト・宿泊・フライト・稼働写真", icon: Briefcase, category: "申請・報告", color: "text-indigo-500", size: "large",url: "https://docs.google.com/spreadsheets/d/1Fx25xjewo9wMHDALNHZmIiYEINR8nHEEsDtjnTeoxDM/edit#gid=1495149345" },
  
    { name: "個人実績報告", icon: Activity, category: "実績・確認", color: "text-blue-500", size: "small",url: "https://docs.google.com/forms/d/e/1FAIpQLScaeMGFzBv_UphQad8ThB3YFUbIKgl-MLSF4dwUX9I9evzUKw/viewform?usp=sf_link" },
    { name: "店舗実績報告", icon: TrendingUp, category: "実績・確認", color: "text-purple-500", size: "small",url: "https://docs.google.com/forms/d/e/1FAIpQLSea3P-72fFxMkLpSdG9lm9Kdh20pCENhESClyWTN3AG5O0w3g/viewform?usp=sf_link" },
    { name: "実績進捗確認", icon: CheckSquare, category: "実績・確認", color: "text-teal-500", size: "small",url: "https://docs.google.com/spreadsheets/d/16nMMdZvXGzpo7MkKeqmuMZ0LBBIf8ZR-3UpYi1UZ2K0/edit?gid=1171265387#gid=1171265387" },
    { name: "お知らせ", icon: Bell, category: "実績・確認", color: "text-yellow-500", size: "small",url: "/components/notices" },
    { name: "事務局だより", icon: MessageSquare, category: "実績・確認", color: "text-lime-500", size: "small",url: "https://drive.google.com/drive/u/0/folders/1UZLCOUok0lKeMwyOw0SXKO4yTKpcvKcZ" },
  
    { name: "マニュアル", icon: BookOpen, category: "関連サイト", color: "text-green-600", size: "large",url: "/components/tasks/manuals" },
    { name: "Qast", icon: Globe, category: "関連サイト", color: "text-gray-600", size: "small",url: "https://agent0723.qast.jp/workspaces/1" },
    { name: "GRT", icon: Globe, category: "関連サイト", color: "text-gray-600", size: "small",url: "https://googleretailtraining.exceedlms.com/student/catalog" },
    { name: "Eli ポータルサイト", icon: Globe, category: "関連サイト", color: "text-gray-600", size: "small",url: "https://g-portal.eli-salestech.com/login"
    },
  ];
  