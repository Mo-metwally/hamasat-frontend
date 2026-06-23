import React from "react";
import { AuthProvider } from "./Context/AuthContext";
import { SearchProvider } from "./Context/SearchContext";
import { RecentlyWatchedProvider } from "./Context/RecentlyWatchedContext";
import { InterestProvider } from "./Context/InterestContext";
import { CartProvider } from "./Context/CartContext";
import { OrderNowProvider } from "./Context/OrderNowContext";
import { CartCheckOutProvider } from "./Context/cartCheckOutContext";
import { AdminOrdersProvider } from "./Context/AdminOrdersContext";
import { HandleOrdersProvider } from "./Context/HandleOrders";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const AppProviders = ({ children }) => {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <SearchProvider>
                <RecentlyWatchedProvider>
                    <InterestProvider>
                        <CartProvider>
                            <CartCheckOutProvider>
                                <OrderNowProvider>
                                    <AuthProvider>
                                        <AdminOrdersProvider>
                                            <HandleOrdersProvider>
                                                {children}
                                            </HandleOrdersProvider>
                                        </AdminOrdersProvider>
                                    </AuthProvider>
                                </OrderNowProvider>
                            </CartCheckOutProvider>
                        </CartProvider>
                    </InterestProvider>
                </RecentlyWatchedProvider>
            </SearchProvider>
        </QueryClientProvider>

    );
};
