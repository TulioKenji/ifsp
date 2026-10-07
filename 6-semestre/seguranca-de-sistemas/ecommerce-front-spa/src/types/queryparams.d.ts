interface APIQueryParamsRequest {
    page?: number;
    size?: number;
    field?: string;
    queryparam?: string;
}

// page: página, padrão 1
// size: itens por página, padrão 20, máximo 100
// field: all, name, description ou sku
// queryparam: busca full-text PostgreSQL

interface APIQueryParamsResponse<T> {
    pagination: {
        page: number;
        size: number;
        total: number;
        total_pages: number;
    }
    data: T[];
}