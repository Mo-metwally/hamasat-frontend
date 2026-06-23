import React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

const CustomSlider = styled(Slider)({
    color: '#4A1E0A',
    '& .MuiSlider-thumb': {
        backgroundColor: '#FFF7EF',
        boxShadow: '0 0 0 5px rgba(255, 141, 107, 0.16)',
        width: '15px',
        height: '15px',
        '&:hover': {
            boxShadow: '0 0 0 8px rgba(255, 87, 34, 0.16)',
        },
    },
    '& .MuiSlider-track': {
        backgroundColor: '#4A1E0A',
    },
    '& .MuiSlider-rail': {
        backgroundColor: '#4A1E0A',
    },
});

function valuetext(value) {
    return `${value}`;
}

const minDistance = 50;

export default function SliderBar({ priceRange, setPriceRange, maxPrice }) {
    const handleChange = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) return;

        if (activeThumb === 0) {
            setPriceRange([Math.min(newValue[0], priceRange[1] - minDistance), priceRange[1]]);
        } else {
            setPriceRange([priceRange[0], Math.max(newValue[1], priceRange[0] + minDistance)]);
        }
    };

    return (
        <div className='sliderBar'>
            <Box sx={{ width: "100%", padding: 2.5 }}>
                <h5 dir='rtl'>تصنيف حسب السعر</h5>
                <CustomSlider
                    value={priceRange}
                    onChange={handleChange}
                    valueLabelDisplay="auto"
                    getAriaValueText={valuetext}
                    min={0}
                    max={maxPrice}
                    disableSwap
                />
                <br />
                <p dir='rtl'>
                    السعر:
                    <strong>{Number(priceRange[0] || 0).toLocaleString('en-EG')}</strong> -
                    <strong>{Number(priceRange[1] || 0).toLocaleString('en-EG')}</strong>
                </p>

            </Box>
        </div>
    );
}
