import React from "react";
import { Input } from "antd";

const Search = Input.Search;

export const KeywordSearch = ({onSearch}) => (
    <div>
        <Search
            placeholder="Keyword"
            onSearch={onSearch}
            style={{ width: 200 }}
        />
    </div>
);
