import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (item) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((i) => i.id === item.id);
            if (existingItem) {
                return prevItems.map((i) =>
                    i.id === item.id ? { ...i, qty: i.qty + 1 } : i
                );
            }
            return [...prevItems, { ...item, qty: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
    };

    const updateQuantity = (itemId, qty) => {
        if (qty < 1) {
            removeFromCart(itemId);
            return;
        }
        setCartItems((prevItems) =>
            prevItems.map((i) => (i.id === itemId ? { ...i, qty } : i))
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalAmount = cartItems.reduce(
        (total, item) => total + item.price * item.qty,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalAmount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
