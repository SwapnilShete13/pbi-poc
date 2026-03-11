import axios from "axios";

const BASE_URL = "http://localhost:8000";

export const fetchCategories = () =>
  axios.get(`${BASE_URL}/categories`).then((r) => r.data);

export const fetchSchema = (category, subcategory) =>
  axios
    .get(`${BASE_URL}/dataset-schema`, { params: { category, subcategory } })
    .then((r) => r.data);

export const fetchData = (category, subcategory) =>
  axios
    .get(`${BASE_URL}/dataset-data`, { params: { category, subcategory } })
    .then((r) => r.data);

/**
 * Run a full SSMS-style SELECT query directly against SQL Server.
 * Returns { count, columns, data }
 */
export const runQuery = (sql) =>
  axios
    .post(`${BASE_URL}/run-query`, { sql })
    .then((r) => r.data);