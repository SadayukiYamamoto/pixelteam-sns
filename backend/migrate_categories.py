from posts.models import Video

mappings = {
    "Pixel 基礎知識": ("Pixel 知識", "基礎知識"),
    "Pixel 応用知識": ("Pixel 知識", "応用知識"),
    "接客初級編": ("接客 知識", "初級編"),
    "接客中級編": ("接客 知識", "中級編"),
    "接客上級編": ("接客 知識", "上級編"),
    "ポートフォリオ基礎知識": ("ポートフォリオ", "基礎知識"),
    "ポーチフォリオ応用知識": ("ポートフォリオ", "応用知識"),
    "コミュニケーション初級技術": ("コミュニケーション技術", "初級編"),
    "コミュニケーション中級技術": ("コミュニケーション技術", "中級編"),
    "コミュニケーション上級技術": ("コミュニケーション技術", "上級編"),
}

videos = Video.objects.all()
count = 0
for v in videos:
    if v.category in mappings:
        parent, sub = mappings[v.category]
        v.parent_category = parent
        v.category = sub
        v.save()
        count += 1
        print(f"Migrated: {v.title} -> {parent} / {sub}")

print(f"Total migrated: {count}")
