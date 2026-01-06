import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import MentionList from '../components/MentionList.jsx' // Reuse same list UI
import axios from 'axios'

export default {
    items: async ({ query }) => {
        // ハッシュタグ検索
        try {
            // 全件取得APIがない場合もあるが、一旦適当なリスト or API
            // ここではAPIがないと仮定し、固定の推奨タグ + 入力中のものを返す
            // 本来は GET /api/hashtags/?search=... が欲しい
            const suggested = [
                'PixelShop', 'NewArrival', 'Campaign', 'Support', 'Event'
            ];

            // 入力クエリそのものも候補に入れる (#newtag 作成用)
            const candidates = [...suggested];
            if (query && !candidates.includes(query)) {
                candidates.unshift(query);
            }

            return candidates
                .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
                .map(tag => ({ id: tag, display_name: tag })) // MentionListが期待する形式に変換
                .slice(0, 5);
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    render: () => {
        let component
        let popup

        return {
            onStart: props => {
                component = new ReactRenderer(MentionList, {
                    props,
                    editor: props.editor,
                })

                if (!props.clientRect) {
                    return
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                })
            },

            onUpdate(props) {
                component.updateProps(props)

                if (!props.clientRect) {
                    return
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                })
            },

            onKeyDown(props) {
                if (props.event.key === 'Escape') {
                    popup[0].hide()

                    return true
                }

                return component.ref?.onKeyDown(props)
            },

            onExit() {
                popup[0].destroy()
                component.destroy()
            },
        }
    },
}
