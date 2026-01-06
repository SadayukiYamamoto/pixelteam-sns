
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import axios from 'axios'
import MentionList from './MentionList.jsx'

export default {
    char: '#',
    items: async ({ query }) => {
        try {
            const token = localStorage.getItem("token");
            // Using the search API we created
            const res = await axios.get(`/api/hashtags/search/?query=${query}`, {
                headers: { Authorization: `Token ${token}` },
            });
            // API returns [{id: 'tag', label: 'tag'}, ...]
            // Tiptap mentions expects this format.
            // We can create a new tag if it doesn't exist?
            // Typically suggestion shows existing tags.
            // If query is not empty and not in list, maybe suggest creating it?
            // For now just return results.
            const tags = res.data.map(t => ({ id: t.id, label: t.label }));
            if (query && !tags.find(t => t.id === query)) {
                // Optional: allow creating new tag by showing it as option
                tags.push({ id: query, label: query });
            }
            return tags.slice(0, 5);
        } catch (err) {
            console.error("Hashtag suggestion error:", err);
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
