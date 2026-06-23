import React from 'react';

const AdminOrderPagination = ({
    itemsPerPage,
    currentPage,
    totalPages,
    setCurrentPage
}) => {
    return (
        <div className="orders-pagination-container">
            <div className="orders-pagination" dir="ltr">
                <span className="perPageT">عدد طلبات الصفحة: {itemsPerPage}</span>
                <div className="pages" dir="rtl">
                    <button
                        type='button'
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        {"<"}
                    </button>

                    {(() => {
                        let pages = [];
                        let start = Math.max(1, currentPage - 2);
                        let end = Math.min(totalPages, start + 4);

                        if (end - start < 4) start = Math.max(1, end - 4);

                        for (let i = start; i <= end; i++) {
                            pages.push(
                                <button
                                    type='button'
                                    key={i}
                                    className={currentPage === i ? "active" : ""}
                                    onClick={() => setCurrentPage(i)}
                                >
                                    {i}
                                </button>
                            );
                        }

                        return (
                            <>
                                {start > 1 && (
                                    <>
                                        <button type='button' onClick={() => setCurrentPage(1)}>1</button>
                                        {start > 2 && <span>...</span>}
                                    </>
                                )}
                                {pages}
                                {end < totalPages && (
                                    <>
                                        {end < totalPages - 1 && <span>...</span>}
                                        <button type='button' onClick={() => setCurrentPage(totalPages)}>
                                            {totalPages}
                                        </button>
                                    </>
                                )}
                            </>
                        );
                    })()}

                    <button
                        type='button'
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        {">"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AdminOrderPagination;
