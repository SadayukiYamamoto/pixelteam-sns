import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export default forwardRef((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = index => {
        const item = props.items[index]

        if (item) {
            props.command({ id: item.id, label: item.display_name })
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
                upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                downHandler()
                return true
            }

            if (event.key === 'Enter') {
                enterHandler()
                return true
            }

            return false
        },
    }))

    return (
        <div className="items">
            {props.items.length ? (
                props.items.map((item, index) => (
                    <button
                        className={`item ${index === selectedIndex ? 'is-selected' : ''}`}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        {item.image ? <img src={item.image} alt="" className="item-img" /> : null}
                        <span className="item-label">{item.display_name}</span>
                        <span className="item-id">@{item.id}</span>
                    </button>
                ))
            ) : (
                <div className="item">No result</div>
            )}
        </div>
    )
})
