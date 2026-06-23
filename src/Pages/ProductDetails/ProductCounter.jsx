import React, { useState } from "react";

const ProductCounter = ({ initialQuantity = 1, max = Infinity, onQuantityChange }) => {
    const [quantity, setQuantity] = useState(initialQuantity);

    const updateQuantity = (newQuantity) => {
        const validated = Math.max(1, Math.min(max, newQuantity)); // لا يقل عن 1 ولا يزيد عن max
        setQuantity(validated);
        onQuantityChange?.(validated);
    };

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
            updateQuantity(value);
        }
    };

    const handleDecrease = () => {
        updateQuantity(quantity - 1);
    };

    const handleIncrease = () => {
        updateQuantity(quantity + 1);
    };

    return (
        <div className="counter-container">
            <button
                type="button"
                onClick={handleDecrease}
                className="counterBtn counterAdd"
                disabled={quantity <= 1}
            >
                <span>-</span>
            </button>

            <input
                aria-label="الكمية"
                type="number"
                className="no-spinner"
                value={quantity}
                onChange={handleInputChange}
                min="1"
                max={max}
            />

            <button
                type="button"
                onClick={handleIncrease}
                className="counterBtn counterRemove"
                disabled={quantity >= max}
            >
                <span>+</span>
            </button>
        </div>
    );
};

export default ProductCounter;
