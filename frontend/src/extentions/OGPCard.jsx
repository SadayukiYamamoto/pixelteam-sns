import { Node, mergeAttributes } from "@tiptap/core";
import axiosClient from "../api/axiosClient";

export const OGPCard = Node.create({
  name: "ogpCard",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      url: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-url") || element.querySelector(".ogp-header-link")?.getAttribute("href") || "",
      },
      title: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-title") || element.querySelector(".ogp-title")?.innerText || "",
      },
      description: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-description") || element.querySelector(".ogp-desc")?.innerText || "",
      },
      image: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-image") || element.querySelector(".ogp-thumb img")?.getAttribute("src") || "",
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="ogp-card"]' },
      { tag: 'div.ogp-wrapper' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { url, title, description, image } = node.attrs;
    const imageSource = image || "https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Preview";

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: "ogp-wrapper",
        "data-type": "ogp-card",
        "data-url": url,
        "data-title": title,
        "data-description": description,
        "data-image": image,
      }),

      // 🔵 カード上部のURL表示
      [
        "div",
        { class: "ogp-header" },
        [
          "a",
          { href: url, target: "_blank", class: "ogp-header-link" },
          url || ""
        ]
      ],

      // 🔵 OGP カード本体
      [
        "div",
        { class: "ogp-card" },
        [
          "a",
          { href: url, target: "_blank" },
          [
            "div",
            { class: "ogp-thumb" },
            ["img", {
              src: imageSource,
              onerror: "this.src='https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Preview'"
            }],
          ],
          [
            "div",
            { class: "ogp-info" },
            ["div", { class: "ogp-title" }, title || "No Title Provided"],
            ["div", { class: "ogp-desc" }, description || "Click to visit this link and learn more."],
          ],
        ],
      ],
    ];
  },

  addCommands() {
    return {
      insertOGP:
        (url) =>
          async ({ editor }) => {
            try {
              const res = await axiosClient.post(
                `fetch-ogp/`,
                { url }
              );

              const ogp = res.data;

              editor
                .chain()
                .focus()
                .insertContent({
                  type: "ogpCard",
                  attrs: {
                    url: ogp.url || url,
                    title: ogp.title || "",
                    description: ogp.description || "",
                    image: ogp.image || "",
                  },
                })
                .run();
            } catch (err) {
              console.error("OGP fetch failed:", err);
              // Insert minimal card on failure
              editor.chain().focus().insertContent({
                type: "ogpCard",
                attrs: { url, title: url, description: "Link preview unavailable", image: "" }
              }).run();
            }
          },
    };
  },
});
