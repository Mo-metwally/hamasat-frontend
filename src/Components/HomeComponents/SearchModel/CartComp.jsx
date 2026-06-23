import React from 'react'
import { IoIosArrowBack } from 'react-icons/io'
// import { Link } from 'react-router-dom'
import { useCart } from '../../../Context/CartContext'

const CartComp = () => {
    const cart = useCart();
    const cartQuantity = cart?.cart?.products?.length || 0;


    return (
        <div className='cartComp'>
            <div className='cartComp-info'>
                <p> {cartQuantity} : منتج في العربة</p>
                <a href='/cart' className='cart-btn-S'>إذهب للعربة <i><IoIosArrowBack /></i></a>
            </div>
        </div>
    )
}

export default CartComp