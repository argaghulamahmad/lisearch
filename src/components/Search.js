import React from "react";
import { Input } from "antd";

const Search = Input.Search;

export const KeywordSearch = ({onSearch}) => (
    <Search
        placeholder="Keyword"
        onSearch={onSearch}
        style={{ minWidth: "100%" }}
    />
);
