
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import axios from 'axios'
import MentionList from './MentionList.jsx' // We need to create this React component

export default {
    items: async ({ query }) => {
        try {
            const token = localStorage.getItem("token");
            // Using the search API we created earlier
            const queryLower = query.toLowerCase();
            const suggestions = [];

            // Add ALL suggestion
            if (!query || "all".startsWith(queryLower) || "全員".includes(queryLower)) {
                suggestions.push({
                    id: "ALL",
                    label: "全員",
                    avatar: null,
                });
            }

            // Using the search API we created earlier
            const res = await axios.get(`/api/search/?query=${query}`, {
                headers: { Authorization: `Token ${token}` },
            });

            const users = res.data.slice(0, 5).map(u => ({
                id: u.user_id,
                label: u.display_name,
                avatar: u.icon_url
            }));

            return [...suggestions, ...users];
        } catch (err) {
            console.error("Mention suggestion error:", err);
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
