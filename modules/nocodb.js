import axios from "axios";

class NocoDB {
    constructor(baseUrl, apiKey) {
        // Initialization if needed
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }
    /**
     *
     * @param {string} baseUrl
     * @param {string} apiKey
     * @param {string} tableId
     * @param {object} queryParameters
     * @returns
     */
    async listRows(
        tableId,
        { viewId = null, limit = 25, offset = 0, where = null },
    ) {
        // construct query parameters
        const params = {
            limit,
            offset,
        };
        // if viewId is provided, add it to params
        if (viewId) {
            params.viewId = viewId;
        }
        // if where clause is provided, add it to params
        if (where) {
            params.where = where;
        }
        // make the GET request to NocoDB API
        const options = {
            method: "GET",
            url: `${this.baseUrl}/api/v2/tables/${tableId}/records`,
            params,
            headers: {
                "xc-token": this.apiKey,
            },
        };
        const res = await axios.request(options);
        return res.data.list;
    }

    /**
     * Update a single row by rowId
     *
     * @param {string} tableId
     * @param {string} rowId      -> e.g. "recAbc123"
     * @param {object} fields    -> { engine: "STATIC", status: "ACTIVE" }
     */
    async updateRow(tableId, rowId, fields) {
        if (!rowId) {
            throw new Error("rowId is required");
        }

        const res = await axios.patch(
            `${this.baseUrl}/api/v2/tables/${tableId}/records`,
            {
                Id: rowId,
                ...fields,
            },
            {
                headers: {
                    "xc-token": this.apiKey,
                    "Content-Type": "application/json",
                },
            },
        );

        return res.data;
    }

    /**
     * Delete a single row by rowId
     *
     * @param {string} tableId
     * @param {string} rowId   -> e.g. "recAbc123"
     */
    async deleteRow(tableId, rowId) {
        if (!rowId) {
            throw new Error("rowId is required");
        }

        const res = await axios.delete(
            `${this.baseUrl}/api/v2/tables/${tableId}/records`,
            {
                headers: {
                    "xc-token": this.apiKey,
                    "Content-Type": "application/json",
                },
                data: {
                    Id: rowId,
                },
            },
        );

        return res.data;
    }
}

export default NocoDB;
