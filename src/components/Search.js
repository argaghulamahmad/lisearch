import React from "react";
import { Input } from "antd";

const { Search } = Input;

const KeywordSearch = ({ onSearch }) => (
    <Search
        placeholder="Search by Keyword"
        onSearch={onSearch}
        enterButton
        style={{ minWidth: "100%" }}
    />
);

export default KeywordSearch;
