import React, { useCallback, useEffect, useMemo } from "react";
import FileCard from './FileCard';

const FileCardGrid = ({ itemDatasource, gridClass = '', allCategories, onCardSelected, onCategoryUpdate }) => {

    const handleCardSelection = useCallback((id, isCardSelected) => {
        console.log(`Card with id ${id} is ${isCardSelected ? 'selected' : 'unselected'}`);
        onCardSelected(id, isCardSelected);
    }, [onCardSelected]);

    // Memoize the combined and sorted categories
    const combinedAndSortedCategories = useMemo(() => {
        return Array.from(new Set([...itemDatasource.items().flatMap(item => item.categories), ...(allCategories || [])])).sort((a, b) => a.localeCompare(b));
    }, [itemDatasource, allCategories]);

    // Memoize the rendered cards
    const renderCard = useMemo(() => {
        console.log("Items:", itemDatasource.items().length)
        return itemDatasource.items().map((item) => {
            // Sort item categories
            const sortedItemCategories = [...item.categories].sort((a, b) => a.localeCompare(b));

            return (
                <FileCard
                    key={item.id}
                    id={item.id}
                    fileType={item.fileType}
                    title={item.title}
                    uploadDate={item["uploadDateReadable"]}
                    defaultCategorySelection={sortedItemCategories}
                    allCategories={combinedAndSortedCategories}
                    onCategoryUpdate={onCategoryUpdate}
                    onCardSelected={handleCardSelection}
                />
            );
        });
    }, [itemDatasource, combinedAndSortedCategories, onCategoryUpdate, handleCardSelection]);

    useEffect(() => {
        itemDatasource.load();
    }, [itemDatasource]);

    return (
        <div className={`row row-cols-1 row-cols-md-3 g-4 overflow-y-auto h-100 ${gridClass}`}>
            {itemDatasource.items().length > 0 ? renderCard : <div className="text-center">No data to display.</div>}
        </div>
    );
};

export default FileCardGrid;
