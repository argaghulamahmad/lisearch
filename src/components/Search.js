import React, { useCallback, useMemo } from "react";
import { Input } from "antd";
import debounce from 'lodash/debounce';

const { Search } = Input;

const KeywordSearch = React.memo(({ onSearch }) => {
    const debouncedSearch = useMemo(
        () => debounce((value) => {
            onSearch(value);
        }, 300),
        [onSearch]
    );

    const handleSearch = useCallback((value) => {
        debouncedSearch(value);
    }, [debouncedSearch]);

    return (
        <Search
            placeholder="Search by Keyword"
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={handleSearch}
            enterButton
            style={{ minWidth: "100%" }}
            allowClear
        />
    );
});

KeywordSearch.displayName = 'KeywordSearch';

export default KeywordSearch;
