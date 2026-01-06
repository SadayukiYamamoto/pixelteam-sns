import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import MentionList from '../components/MentionList.jsx'
import axios from 'axios'

export default {
    items: async ({ query }) => {
        // ユーザー検索 API を叩く (ここでは全件取得してJSでフィルタリングする簡易実装)
        // 実運用ではサーバーサイド検索 (?search=query) が望ましい
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/users/all/", {
                headers: { Authorization: `Token ${token}` },
            });

            const users = res.data.map(u => ({
                id: u.user_id,
                display_name: u.display_name,
                image: u.profile_image
            })).filter(item =>
                item.id.toLowerCase().startsWith(query.toLowerCase()) ||
                item.display_name.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5); // 上位5件

            return users;
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
