import React, { useState } from "react";

const CartCounter = ({
    initialQuantity = 1,
    max = Infinity,
    onQuantityChange,
    onIncrease,
    onDecrease
}) => {
    const [quantity, setQuantity] = useState(initialQuantity);

    const updateQuantity = (newQuantity) => {
        const validated = Math.max(1, Math.min(max, newQuantity));
        if (validated !== quantity) {
            setQuantity(validated);
            onQuantityChange?.(validated);

            if (validated > quantity) {
                onIncrease?.(validated);
            } else if (validated < quantity) {
                onDecrease?.(validated);
            }
        }
    };

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) updateQuantity(value);
    };

    return (
        <div className="counter-container">
            <button
                onClick={() => updateQuantity(quantity - 1)}
                className="counterBtn counterAdd"
                disabled={quantity <= 1}
            >
                <span>-</span>
            </button>

            <input
                type="number"
                className="no-spinner"
                value={quantity}
                onChange={handleInputChange}
                min="1"
                max={max}
            />

            <button
                onClick={() => updateQuantity(quantity + 1)}
                className="counterBtn counterRemove"
                disabled={quantity >= max}
            >
                <span>+</span>
            </button>
        </div>
    );
};

export default CartCounter;
