from django.core.management.base import BaseCommand
from posts.models import TaskButton

class Command(BaseCommand):
    help = "Migrate hardcoded tasks to TaskButton model"

    def handle(self, *args, **options):
        # 既存データを全削除（重複防止のため）
        TaskButton.objects.all().delete()
        self.stdout.write("Existing tasks deleted.")

        # Event Tasks
        event_tasks = [
            {"title": "健康観察", "icon_name": "UserCheck", "team": "pixel-event", "section": "申請・報告", "color": "text-pink-500", "url": "https://docs.google.com/forms/d/e/1FAIpQLScHDtKTkgN7L8oz7iVd4deiOl_Fn6A-D613vyVMoERD1cMetQ/viewform"},
            {"title": "勤怠報告", "icon_name": "Clock", "team": "pixel-event", "section": "申請・報告", "color": "text-red-500", "url": "https://agent2309.e-densin.jp/mobile/login/"},
            {"title": "交通費申請", "icon_name": "DollarSign", "team": "pixel-event", "section": "申請・報告", "color": "text-green-500", "url": "https://drive.google.com/drive/folders/18iOXhFzPxdyxwaquhPQifL3uG0YhJzEK"},
            {"title": "シフト・宿泊・フライト・稼働写真", "icon_name": "Briefcase", "team": "pixel-event", "section": "申請・報告", "color": "text-indigo-500", "url": "https://docs.google.com/spreadsheets/d/1Fx25xjewo9wMHDALNHZmIiYEINR8nHEEsDtjnTeoxDM/edit#gid=1495149345"},
            
            {"title": "個人実績報告", "icon_name": "Activity", "team": "pixel-event", "section": "実績・確認", "color": "text-blue-500", "url": "https://docs.google.com/forms/d/e/1FAIpQLScaeMGFzBv_UphQad8ThB3YFUbIKgl-MLSF4dwUX9I9evzUKw/viewform?usp=sf_link"},
            {"title": "店舗実績報告", "icon_name": "TrendingUp", "team": "pixel-event", "section": "実績・確認", "color": "text-purple-500", "url": "https://docs.google.com/forms/d/e/1FAIpQLSea3P-72fFxMkLpSdG9lm9Kdh20pCENhESClyWTN3AG5O0w3g/viewform?usp=sf_link"},
            {"title": "実績進捗確認", "icon_name": "CheckSquare", "team": "pixel-event", "section": "実績・確認", "color": "text-teal-500", "url": "https://docs.google.com/spreadsheets/d/16nMMdZvXGzpo7MkKeqmuMZ0LBBIf8ZR-3UpYi1UZ2K0/edit?gid=1171265387#gid=1171265387"},
            {"title": "お知らせ", "icon_name": "Bell", "team": "pixel-event", "section": "実績・確認", "color": "text-yellow-500", "url": "/components/notices"},
            {"title": "事務局だより", "icon_name": "MessageSquare", "team": "pixel-event", "section": "実績・確認", "color": "text-lime-500", "url": "https://drive.google.com/drive/u/0/folders/1UZLCOUok0lKeMwyOw0SXKO4yTKpcvKcZ"},
            
            {"title": "マニュアル", "icon_name": "BookOpen", "team": "pixel-event", "section": "関連サイト", "color": "text-green-600", "url": "/components/tasks/manuals"},
            {"title": "Qast", "icon_name": "Globe", "team": "pixel-event", "section": "関連サイト", "color": "text-gray-600", "url": "https://agent0723.qast.jp/workspaces/1"},
            {"title": "GRT", "icon_name": "Globe", "team": "pixel-event", "section": "関連サイト", "color": "text-gray-600", "url": "https://googleretailtraining.exceedlms.com/student/catalog"},
            {"title": "Eli ポータルサイト", "icon_name": "Globe", "team": "pixel-event", "section": "関連サイト", "color": "text-gray-600", "url": "https://g-portal.eli-salestech.com/login"},
        ]

        # Shop Tasks
        shop_tasks = [
            {"title": "個人報告", "icon_name": "UserCheck", "team": "pixel-shop", "section": "申請・報告", "color": "text-blue-500", "url": "https://docs.google.com/forms/d/e/1FAIpQLSft85d9Im3wkS1yzv0BqjfxepfKE-cHIM351Rqy20Nb3HrOkg/viewform"},
            {"title": "勤怠報告", "icon_name": "ClipboardList", "team": "pixel-shop", "section": "申請・報告", "color": "text-red-500", "url": "https://docs.google.com/forms/d/e/1FAIpQLScLsB7BxGpyGKGhk-o5q05Fft9_DKk_1ZcSWm5437wUU9Qm_w/viewform"},
            {"title": "接客レポート", "icon_name": "MessageSquare", "team": "pixel-shop", "section": "申請・報告", "color": "text-pink-500", "url": "https://docs.google.com/forms/d/e/1FAIpQLSc-khMem4gPwmHHj92u023EyUksXYAYMI4H2GkgE_sHUkbO0w/viewform?usp=header"},
            {"title": "施策入力フォーム", "icon_name": "ListChecks", "team": "pixel-shop", "section": "申請・報告", "color": "text-green-600", "url": "https://docs.google.com/forms/d/e/1FAIpQLScXWz7eEi1Em3ya8HcG6D8Hd86kE5mRz-52hTPp5STMHwfEAw/viewform"},
            
            {"title": "個人実績", "icon_name": "Activity", "team": "pixel-shop", "section": "実績・管理", "color": "text-blue-600", "url": "/components/tasks/Individual-achievements"},
            {"title": "店舗実績", "icon_name": "TrendingUp", "team": "pixel-shop", "section": "実績・管理", "color": "text-purple-500", "url": "https://drive.google.com/drive/u/0/folders/1Qml4GNplF44Hi6bg5A8oVFdw4sBOphx4"},
            {"title": "スイング管理表", "icon_name": "PieChart", "team": "pixel-shop", "section": "実績・管理", "color": "text-indigo-500", "url": "/components/tasks/swing-management"},
            {"title": "集客数カウント", "icon_name": "Users", "team": "pixel-shop", "section": "実績・管理", "color": "text-yellow-600", "url": "/components/tasks/number-visitors"},
            
            {"title": "お知らせ", "icon_name": "FileText", "team": "pixel-shop", "section": "お知らせ・情報", "color": "text-orange-500", "url": "/components/tasks/swing-management"},
            {"title": "事務局だより", "icon_name": "MessageSquare", "team": "pixel-shop", "section": "お知らせ・情報", "color": "text-green-500", "url": "https://drive.google.com/drive/u/0/folders/1UZLCOUok0lKeMwyOw0SXKO4yTKpcvKcZ"},
            
            {"title": "マニュアル", "icon_name": "FolderDot", "team": "pixel-shop", "section": "シフト・ツール", "color": "text-black", "url": "https://drive.google.com/drive/u/0/folders/1il-rDfil4jwdl5bJ1s0RyY4100zHY9lj"},
            {"title": "シフト", "icon_name": "Calendar", "team": "pixel-shop", "section": "シフト・ツール", "color": "text-cyan-600", "url": "/components/tasks/sift-management"},
            {"title": "端末・機能情報", "icon_name": "BookOpen", "team": "pixel-shop", "section": "シフト・ツール", "color": "text-teal-600", "url": "https://drive.google.com/drive/u/0/folders/1xGiZdZHnH-21nObjgZPogn9IppvK7ypk"},
        ]

        order = 0
        for data in event_tasks:
            TaskButton.objects.create(
                title=data["title"],
                icon_name=data["icon_name"],
                category=data["team"],
                parent_category=data["section"], # Use parent_category for section
                color=data["color"],
                url=data["url"],
                order=order
            )
            order += 1
        
        # Reset order for shop
        order = 0
        for data in shop_tasks:
            TaskButton.objects.create(
                title=data["title"],
                icon_name=data["icon_name"],
                category=data["team"],
                parent_category=data["section"],
                color=data["color"],
                url=data["url"],
                order=order
            )
            order += 1

        self.stdout.write(self.style.SUCCESS('Successfully migrated tasks.'))
