import React from 'react'
import { Pagination } from 'react-bootstrap';
import './pagenation.css'

const Pagenation = ({ totalPages, currentPage, onPageChange }) => {
    if (totalPages <= 1) return null;

    const handlePaginationClick = (page) => {
        onPageChange(page);
    };


    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const paginationItems = [];

        // First page
        paginationItems.push(
            <Pagination.Item key={1} active={currentPage === 1} onClick={() => handlePaginationClick(1)}>
                1
            </Pagination.Item>
        );

        // Ellipsis before current page if needed
        if (currentPage > 2) {
            paginationItems.push(<Pagination.Ellipsis key="start-ellipsis" />);
        }

        // Current page
        if (currentPage > 1 && currentPage <= totalPages - 1) {
            paginationItems.push(
                <Pagination.Item key={currentPage} active onClick={() => handlePaginationClick(currentPage)}>
                    {currentPage}
                </Pagination.Item>
            );
        }

        // Ellipsis after current page if needed
        if (currentPage < totalPages - 1) {
            paginationItems.push(<Pagination.Ellipsis key="end-ellipsis" />);
        }

        // Last page
        if (totalPages > 1) {
            paginationItems.push(
                <Pagination.Item key={totalPages} active={currentPage === totalPages} onClick={() => handlePaginationClick(totalPages)}>
                    {totalPages}
                </Pagination.Item>
            );
        }

        return paginationItems;
    };

    return (
        <div className='PagiNation'>
            {totalPages > 1 && (
                <Pagination>
                    <Pagination.First onClick={() => handlePaginationClick(currentPage - 1)} disabled={currentPage === 1} />
                    {renderPagination()}
                    <Pagination.Last onClick={() => handlePaginationClick(currentPage + 1)} disabled={currentPage === totalPages} />
                </Pagination>
            )}
        </div>
    );
}

export default Pagenation;
