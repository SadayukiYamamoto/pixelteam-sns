
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import axiosClient from '../../api/axiosClient'
import MentionList from './MentionList.jsx' // We need to create this React component

export default {
    items: async ({ query }) => {
        try {
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
            const q = String(query || "");
            // Android/Capacitor needs trailing slash and proper encoding
            const url = `search/?q=${encodeURIComponent(q)}`;
            const res = await axiosClient.get(url);

            if (res.data && Array.isArray(res.data)) {
                const users = res.data.slice(0, 5).map(u => ({
                    id: u.user_id,
                    label: u.display_name,
                    avatar: u.profile_image
                }));
                return [...suggestions, ...users];
            }

            return suggestions;
        } catch (err) {
            console.error("Mention suggestion error:", err);
            // Defensive fallback for Android
            const qLower = String(query || "").toLowerCase().trim();
            const fallbacks = [];
            if (!qLower || "all".startsWith(qLower) || "全員".includes(qLower)) {
                fallbacks.push({
                    id: "ALL",
                    label: "全員",
                    avatar: null,
                });
            }
            return fallbacks;
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
