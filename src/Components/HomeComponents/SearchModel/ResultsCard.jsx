import React from 'react';
import { HiMiniArrowTopRightOnSquare } from "react-icons/hi2";

const ResultsCard = ({ item }) => {
    return (
        <div className='results-card' id={item.id}>
            <div className='card-info'>
                <p className='card-info-head'><strong>{item.name_ar}</strong></p>
                <p className='card-info-desc'>{item.slug}</p>
                <div className="card_info_price_cont">
                    <button className='cart-btn'><HiMiniArrowTopRightOnSquare /></button>
                    <p className='card-info-price'>
                        <sub>جنيه </sub>
                        <strong>
                            {(item.salePrice > 0
                                ? Math.floor(Number(item.salePrice || 0))
                                : Number(item.price || 0)
                            ).toLocaleString('en-EG')}
                        </strong>
                    </p>

                </div>
            </div>
            <img className='results-card-img' src={item.image} alt={item.name} />
            {item.isSale && (<span className='SsaleLable'>خصم %</span>)}
        </div>
    );
};

export default ResultsCard;
