import './SearchModel.scss'
// import { useLocation } from 'react-router-dom'
import React, { useEffect, useRef, useState, useCallback } from 'react';
import SearchComp from './SearchComp';
import { MdClose } from 'react-icons/md';
import CartComp from './CartComp';

const SearchModel = ({ closeBtn }) => {

    const [isVisible, setIsVisible] = useState(false);
    const modelRef = useRef(null);
    // const Location = useLocation();

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => {
            closeBtn();
        }, 300);
    }, [closeBtn]);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 10);
    }, [])

    useEffect(() => {
        const handelClickOutside = (e) => {
            if (modelRef.current && !modelRef.current.contains(e.target)) {
                handleClose()
            }
        };
        document.addEventListener('mousedown', handelClickOutside)
        return () => {
            document.removeEventListener('mousedown', handelClickOutside)
        }

    }, [handleClose]);

    // useEffect(() => {
    //     handleClose()
    // }, [Location.pathname, handleClose])

    return (
        <div id='searchM' className={isVisible ? 'showSearch' : 'hideSearch'}>
            <div className='innerSearchM' ref={modelRef}>
                <div className='innerSearch_H' style={{ display: 'none' }}>
                    <MdClose onClick={handleClose} />
                </div>
                <SearchComp autoFocus={isVisible} closeModal={handleClose} />
                <CartComp />
            </div>
        </div>
    )
}

export default SearchModel