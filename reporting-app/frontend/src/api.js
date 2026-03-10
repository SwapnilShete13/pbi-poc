import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000" });

export const fetchCategories = () => API.get("/categories").then((r) => r.data);

export const fetchSchema = (category, subcategory) =>
  API.get("/dataset-schema", { params: { category, subcategory } }).then(
    (r) => r.data
  );

export const fetchData = (category, subcategory) =>
  API.get("/dataset-data", { params: { category, subcategory } }).then(
    (r) => r.data
  );
