
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import axiosClient from '../../api/axiosClient'
import MentionList from './MentionList.jsx'

export default {
    char: '#',
    items: async ({ query }) => {
        try {
            // Using the search API we created
            const q = String(query || "");
            const res = await axiosClient.get(`hashtags/search/?query=${encodeURIComponent(q)}`);

            let tags = [];
            if (res.data && Array.isArray(res.data)) {
                // API returns [{id: 'tag', label: 'tag'}, ...]
                tags = res.data.map(t => ({ id: t.id, label: t.label }));
            }

            // If query is not in the list, allow creating it
            if (q && !tags.find(t => t.id === q)) {
                tags.push({ id: q, label: q });
            }

            return tags.length > 0 ? tags.slice(0, 5) : (q ? [{ id: q, label: q }] : []);
        } catch (err) {
            console.error("Hashtag suggestion error:", err);
            const q = String(query || "");
            return q ? [{ id: q, label: q }] : [];
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
